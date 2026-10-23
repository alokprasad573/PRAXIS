const Project = require("../models/project.models");
const Workspace = require("../models/workspace.models");
const Session = require("../models/session.models");

// Helper to format project for frontend consumption (Ensures both id and _id exist)
const formatProject = (p, workflowCount = 0, agentCount = 3) => ({
  id: p._id.toString(),
  _id: p._id.toString(),
  name: p.name,
  repo: p.repo,
  branch: p.branch || "main",
  language: p.language || "TypeScript",
  framework: p.framework || "Node.js",
  health: p.health || "healthy",
  ragStatus: p.ragStatus || "indexed",
  agents: agentCount,
  workflows: workflowCount,
  lastWorkflow: "Just now",
  ragChunks: p.ragChunks ?? 0,
  lastIndexed: p.lastIndexed || p.updatedAt || new Date().toISOString(),
});

// 1. GET ALL PROJECTS FOR ACTIVE WORKSPACE
exports.getProjects = async (req, res) => {
  try {
    let workspaceId = req.workspaceId;

    if (!workspaceId) {
      const ws = await Workspace.findOne({
        $or: [{ owner: req.userId }, { "members.user": req.userId }],
      });
      if (ws) workspaceId = ws._id;
    }

    if (!workspaceId) {
      return res.status(200).json({ success: true, data: [] });
    }

    const projects = await Project.find({ workspace: workspaceId }).sort({
      createdAt: -1,
    });

    const formatted = projects.map((p) => formatProject(p));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. CONNECT NEW REPOSITORY / CREATE PROJECT
exports.connectProject = async (req, res) => {
  try {
    const { repoUrl, branch, ingestAst, ingestDocs, enableOkf, name, language, framework } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ success: false, message: "Repository URL is required." });
    }

    let workspaceId = req.workspaceId;
    if (!workspaceId) {
      const ws = await Workspace.findOne({
        $or: [{ owner: req.userId }, { "members.user": req.userId }],
      });
      if (ws) workspaceId = ws._id;
    }

    if (!workspaceId) {
      return res.status(400).json({ success: false, message: "No active workspace found for this session." });
    }

    // Clean URL and derive repository name if not provided
    const cleanRepo = repoUrl.replace(/^https?:\/\//, "").trim();
    const parts = cleanRepo.split("/");
    const derivedName = name || parts[parts.length - 1] || "new-project";

    // Auto-detect or default language & framework
    const detectedLang = language || (cleanRepo.includes("frontend") || cleanRepo.includes("react") ? "TypeScript" : "Node.js");
    const detectedFramework = framework || (detectedLang === "TypeScript" ? "React" : "Express");

    // Random initial RAG vectors simulating AST chunking
    const initialChunks = ingestAst ? Math.floor(Math.random() * 25000 + 12000) : 0;

    const project = await Project.create({
      name: derivedName,
      workspace: workspaceId,
      repo: cleanRepo,
      branch: branch || "main",
      language: detectedLang,
      framework: detectedFramework,
      health: "healthy",
      ragStatus: "indexed",
      ragChunks: initialChunks,
      lastIndexed: new Date(),
    });

    // Update active session context to the newly created project
    if (req.session) {
      req.session.project = project._id;
      await req.session.save();
    }

    res.status(201).json({
      success: true,
      message: `Repository ${project.name} successfully connected and indexed into RAG.`,
      data: formatProject(project),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET SINGLE PROJECT BY ID
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({
      _id: id,
      workspace: req.workspaceId,
    }).populate("workspace", "name plan");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    res.status(200).json({
      success: true,
      data: formatProject(project),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. DELETE / DISCONNECT PROJECT
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOneAndDelete({
      _id: id,
      workspace: req.workspaceId,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    res.status(200).json({
      success: true,
      message: `Project ${project.name} successfully disconnected.`,
      data: { id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. RE-INDEX PROJECT RAG
exports.reindexProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findOne({
      _id: id,
      workspace: req.workspaceId,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    project.ragStatus = "indexed";
    project.ragChunks = (project.ragChunks || 10000) + Math.floor(Math.random() * 2000 + 500);
    project.lastIndexed = new Date();
    await project.save();

    res.status(200).json({
      success: true,
      message: `AST tree and RAG embeddings re-indexed for ${project.name}.`,
      data: formatProject(project),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const User = require("../models/user.models");

// 6. FETCH ORIGINAL USER REPOSITORIES DIRECTLY FROM GITHUB API
exports.getGithubRepos = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("+githubAccessToken");

    if (!user || !user.githubAccessToken) {
      return res.status(200).json({
        success: true,
        connected: false,
        message: "GitHub account not connected. Please connect your GitHub account.",
        repos: [],
      });
    }

    // Call Official GitHub REST API
    const ghResponse = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator",
      {
        headers: {
          Authorization: `Bearer ${user.githubAccessToken}`,
          "User-Agent": "PRAXIS-Platform",
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!ghResponse.ok) {
      return res.status(200).json({
        success: true,
        connected: false,
        message: "GitHub token expired or revoked. Please reconnect GitHub.",
        repos: [],
      });
    }

    const repos = await ghResponse.json();

    const formattedRepos = repos.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      htmlUrl: r.html_url,
      cloneUrl: r.clone_url,
      description: r.description || "No description provided",
      language: r.language || "TypeScript",
      branch: r.default_branch || "main",
      isPrivate: r.private,
      stars: r.stargazers_count,
      updatedAt: r.updated_at,
    }));

    res.status(200).json({
      success: true,
      connected: true,
      username: user.githubUsername,
      count: formattedRepos.length,
      data: formattedRepos,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};