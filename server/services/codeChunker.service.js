const fs = require("fs");
const path = require("path");
const VectorEmbedding = require("../models/vectorEmbedding.models");
const Project = require("../models/project.models");
const User = require("../models/user.models");
const { getEmbedding } = require("./embedding.service");

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  "tmp",
  ".cache",
  ".vscode",
  ".idea",
]);

const ALLOWED_EXTS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".json",
  ".md",
  ".sql",
  ".yaml",
  ".yml",
]);

/**
 * Split source code into logical chunks preserving structure and line numbers
 */
function chunkCodeContent({ content, filePath, maxChunkLines = 45, overlap = 8 }) {
  if (!content || typeof content !== "string") return [];
  const lines = content.split("\n");
  const chunks = [];

  let i = 0;
  let chunkIdx = 0;

  while (i < lines.length) {
    const end = Math.min(i + maxChunkLines, lines.length);
    const chunkLines = lines.slice(i, end);
    const chunkText = chunkLines.join("\n").trim();

    if (chunkText.length > 20) {
      chunks.push({
        chunkIndex: chunkIdx++,
        lineStart: i + 1,
        lineEnd: end,
        text: `// File: ${filePath} (Lines ${i + 1}-${end})\n` + chunkText,
        tokenCount: Math.ceil(chunkText.length / 4),
      });
    }

    if (end >= lines.length) break;
    i += maxChunkLines - overlap;
  }

  return chunks;
}

/**
 * Index a single source file into MongoDB Vector Store
 */
async function indexSourceFile({ workspaceId, projectId, filePath, content, language = "JavaScript" }) {
  if (!content || !projectId) return 0;
  const chunks = chunkCodeContent({ content, filePath });

  for (const c of chunks) {
    const embedding = await getEmbedding(c.text);

    await VectorEmbedding.create({
      workspace: workspaceId,
      project: projectId,
      category: "code",
      source: filePath,
      title: `${filePath} (Lines ${c.lineStart}-${c.lineEnd})`,
      content: c.text,
      metadata: {
        lineStart: c.lineStart,
        lineEnd: c.lineEnd,
        language,
        astType: "code_chunk",
      },
      embedding,
      tokenCount: c.tokenCount,
      chunkIndex: c.chunkIndex,
    });
  }

  return chunks.length;
}

/**
 * Recursively scan local directory for real source files
 */
function scanDirectoryFiles(dirPath, baseDir = dirPath, maxFiles = 30) {
  const results = [];
  try {
    if (!fs.existsSync(dirPath)) return results;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (results.length >= maxFiles) break;
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith(".")) {
          results.push(...scanDirectoryFiles(fullPath, baseDir, maxFiles - results.length));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ALLOWED_EXTS.has(ext)) {
          const stats = fs.statSync(fullPath);
          if (stats.size > 0 && stats.size < 200 * 1024) {
            const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
            results.push({ fullPath, relPath, ext });
          }
        }
      }
    }
  } catch (err) {
    console.error("Directory scan error:", err.message);
  }
  return results;
}

/**
 * Helper to parse GitHub Owner and Repo name from a repo string/URL
 */
function parseGithubRepo(repoStr) {
  if (!repoStr || typeof repoStr !== "string") return null;
  const clean = repoStr
    .replace(/^https?:\/\//i, "")
    .replace(/^github\.com\//i, "")
    .replace(/\.git$/i, "")
    .trim();
  const parts = clean.split("/").filter(Boolean);
  if (parts.length >= 2) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

/**
 * Fetch and index code files from GitHub repository
 */
async function fetchAndIndexGithubRepo({ project, token }) {
  const ghInfo = parseGithubRepo(project.repo);
  if (!ghInfo) return { success: false, count: 0, reason: "Not a GitHub repository URL" };

  const branch = project.branch || "main";
  const headers = {
    "User-Agent": "PRAXIS-Platform",
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const treeUrl = `https://api.github.com/repos/${ghInfo.owner}/${ghInfo.repo}/git/trees/${branch}?recursive=1`;
    const treeRes = await fetch(treeUrl, { headers });

    if (!treeRes.ok) {
      const errText = await treeRes.text();
      return { success: false, count: 0, reason: `GitHub tree fetch failed: ${treeRes.status} ${errText}` };
    }

    const treeData = await treeRes.json();
    if (!treeData.tree || !Array.isArray(treeData.tree)) {
      return { success: false, count: 0, reason: "No files found in GitHub repository tree." };
    }

    // Filter code files
    const codeFiles = treeData.tree.filter((node) => {
      if (node.type !== "blob") return false;
      const p = node.path.toLowerCase();
      if (IGNORED_DIRS.has(p.split("/")[0])) return false;
      const ext = path.extname(p);
      return ALLOWED_EXTS.has(ext);
    }).slice(0, 25);

    let totalChunks = 0;
    for (const fileNode of codeFiles) {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${ghInfo.owner}/${ghInfo.repo}/${branch}/${fileNode.path}`;
        const fileRes = await fetch(rawUrl, { headers: token ? { Authorization: `Bearer ${token}` } : {} });

        if (fileRes.ok) {
          const content = await fileRes.text();
          const ext = path.extname(fileNode.path).toLowerCase();
          const lang = ext === ".py" ? "Python" : ext === ".json" ? "JSON" : project.language || "JavaScript";

          const count = await indexSourceFile({
            workspaceId: project.workspace,
            projectId: project._id,
            filePath: fileNode.path,
            content,
            language: lang,
          });
          totalChunks += count;
        }
      } catch (e) {
        console.warn(`Failed to fetch file ${fileNode.path} from GitHub:`, e.message);
      }
    }

    return { success: true, count: totalChunks };
  } catch (err) {
    return { success: false, count: 0, reason: err.message };
  }
}

/**
 * Main Index Project Repository Orchestrator
 */
async function indexProjectRepository(project, customFiles = null, userId = null) {
  try {
    if (!project) return { success: false, message: "Project not found." };

    // 1. Remove previous code vector embeddings for this specific project
    await VectorEmbedding.deleteMany({
      project: project._id,
      category: "code",
    });

    let indexedCount = 0;

    // Option A: Caller provided explicit custom files
    if (Array.isArray(customFiles) && customFiles.length > 0) {
      for (const file of customFiles) {
        if (file.path && file.content) {
          const count = await indexSourceFile({
            workspaceId: project.workspace,
            projectId: project._id,
            filePath: file.path,
            content: file.content,
            language: file.language || project.language || "JavaScript",
          });
          indexedCount += count;
        }
      }
    }

    // Option B: Fetch directly from GitHub repository if URL is provided
    if (indexedCount === 0 && project.repo && (project.repo.includes("github.com") || project.repo.includes("/"))) {
      let token = null;
      if (userId) {
        const user = await User.findById(userId).select("+githubAccessToken");
        if (user?.githubAccessToken) token = user.githubAccessToken;
      }
      const ghResult = await fetchAndIndexGithubRepo({ project, token });
      if (ghResult.success && ghResult.count > 0) {
        indexedCount += ghResult.count;
      }
    }

    // Option C: Check local directory on disk
    if (indexedCount === 0) {
      let targetDir = null;
      const cwd = process.cwd();

      if (project.repo && fs.existsSync(project.repo)) {
        targetDir = project.repo;
      } else if (fs.existsSync(path.join(cwd, project.name))) {
        targetDir = path.join(cwd, project.name);
      } else if (fs.existsSync(path.join(cwd, project.repo))) {
        targetDir = path.join(cwd, project.repo);
      } else if (
        (project.name?.toLowerCase() === "praxis" || project.repo?.toLowerCase().includes("praxis")) &&
        fs.existsSync(cwd)
      ) {
        targetDir = cwd;
      }

      if (targetDir) {
        const files = scanDirectoryFiles(targetDir, targetDir, 25);
        for (const f of files) {
          try {
            const content = fs.readFileSync(f.fullPath, "utf-8");
            const lang = f.ext === ".py" ? "Python" : f.ext === ".json" ? "JSON" : project.language || "JavaScript";
            const count = await indexSourceFile({
              workspaceId: project.workspace,
              projectId: project._id,
              filePath: f.relPath,
              content,
              language: lang,
            });
            indexedCount += count;
          } catch (e) {
            console.error(`Error reading ${f.fullPath}:`, e.message);
          }
        }
      }
    }

    // 4. Update Project record with actual real chunk count in MongoDB
    const totalChunks = await VectorEmbedding.countDocuments({
      project: project._id,
      category: "code",
    });

    await Project.findByIdAndUpdate(project._id, {
      ragChunks: totalChunks,
      ragStatus: totalChunks > 0 ? "indexed" : "pending",
      lastIndexed: new Date(),
    });

    return {
      success: true,
      chunksCount: totalChunks,
      message:
        totalChunks > 0
          ? `Indexed ${totalChunks} real AST vector chunks for ${project.name}.`
          : `No source files found for ${project.name}. Use 'Index Code File' to add source files or clone repository locally.`,
    };
  } catch (err) {
    console.error("Project repository indexing error:", err);
    return { success: false, message: err.message };
  }
}

module.exports = {
  chunkCodeContent,
  indexSourceFile,
  indexProjectRepository,
  scanDirectoryFiles,
};
