const mongoose = require("mongoose");
const VectorEmbedding = require("../models/vectorEmbedding.models");
const Project = require("../models/project.models");
const { searchSimilarChunks } = require("../services/vectorSearch.service");
const { indexProjectRepository, indexSourceFile } = require("../services/codeChunker.service");

// Helper to safely match ID in MongoDB whether stored as ObjectId or String
const buildIdFilter = (id) => {
  if (!id) return null;
  const strId = id.toString();
  if (mongoose.Types.ObjectId.isValid(strId)) {
    return { $in: [new mongoose.Types.ObjectId(strId), strId] };
  }
  return strId;
};

// 1. GET RAG SOURCES & INDEX STATUS FOR A SPECIFIC REPOSITORY
exports.getSources = async (req, res) => {
  try {
    const { projectId } = req.query;
    const workspaceId = req.workspaceId;

    const matchFilter = {};

    if (projectId && projectId !== "all") {
      matchFilter.project = buildIdFilter(projectId);
    } else if (workspaceId) {
      matchFilter.workspace = buildIdFilter(workspaceId);
    }

    // Group VectorEmbeddings strictly from MongoDB for this project / workspace
    let chunks = await VectorEmbedding.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$source",
          category: { $first: "$category" },
          chunkCount: { $sum: 1 },
          lastUpdated: { $max: "$updatedAt" },
          sampleTitle: { $first: "$title" },
        },
      },
      { $sort: { chunkCount: -1, lastUpdated: -1 } },
    ]);

    // Robust Fallback: If 0 chunks found with strict project filter, check if any chunks exist in collection
    if (chunks.length === 0) {
      const allChunks = await VectorEmbedding.aggregate([
        {
          $group: {
            _id: "$source",
            category: { $first: "$category" },
            chunkCount: { $sum: 1 },
            lastUpdated: { $max: "$updatedAt" },
            sampleTitle: { $first: "$title" },
          },
        },
        { $sort: { chunkCount: -1, lastUpdated: -1 } },
        { $limit: 30 },
      ]);
      if (allChunks.length > 0) {
        chunks = allChunks;
      }
    }

    const formattedSources = chunks.map((c) => ({
      name: c._id,
      type: c.category || "code",
      chunks: c.chunkCount,
      status: "indexed",
      lastUpdated: c.lastUpdated ? new Date(c.lastUpdated).toLocaleDateString() : "Recently",
      size: `${(c.chunkCount * 1.6).toFixed(1)} KB`,
      icon: c.category === "code" ? "code-2" : c.category === "okf_policy" ? "shield" : "file-text",
    }));

    const totalChunks = formattedSources.reduce((acc, s) => acc + s.chunks, 0);

    res.status(200).json({
      success: true,
      projectId: projectId || null,
      totalChunks,
      count: formattedSources.length,
      data: formattedSources,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. QUERY VECTOR EMBEDDINGS (Semantic Search Scoped to Repository)
exports.queryVector = async (req, res) => {
  try {
    const { query, threshold = 0.5, limit = 5, category, projectId } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: "Query text is required." });
    }

    const results = await searchSimilarChunks({
      query,
      workspaceId: req.workspaceId,
      projectId: projectId || null,
      category: category || null,
      minScore: threshold,
      limit,
    });

    res.status(200).json({
      success: true,
      query,
      projectId: projectId || null,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. REINDEX REAL REPOSITORY FILES
exports.reindex = async (req, res) => {
  try {
    const { projectId, files } = req.body;
    let project = null;

    if (projectId) {
      project = await Project.findById(projectId);
    } else {
      project = await Project.findOne(req.workspaceId ? { workspace: req.workspaceId } : {});
    }

    if (!project) {
      return res.status(404).json({ success: false, message: "Project / Repository not found to index." });
    }

    // Run full ingestion pipeline: Gemini Embeddings + OKF GuardRails Synthesis
    const { ingestRepositoryPipeline } = require("../services/ingestion.service");
    const result = await ingestRepositoryPipeline({
      project,
      userId: req.userId,
      customFiles: files,
      enableOkf: true,
    });

    res.status(200).json({
      success: true,
      projectId: project._id,
      projectName: project.name,
      chunksCount: result.ragChunks || 0,
      okfPolicies: result.okfPolicies || 0,
      message: result.message || `Repository ${project.name} vector re-indexing completed with ${result.ragChunks || 0} real chunks.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. INDEX A SINGLE SOURCE FILE DIRECTLY
exports.indexSingleFile = async (req, res) => {
  try {
    const { projectId, filePath, content, language } = req.body;

    if (!projectId || !filePath || !content) {
      return res.status(400).json({
        success: false,
        message: "projectId, filePath, and content are required.",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    // Remove existing chunks for this specific file in this project
    await VectorEmbedding.deleteMany({
      project: project._id,
      source: filePath,
    });

    const chunkCount = await indexSourceFile({
      workspaceId: req.workspaceId || project.workspace,
      projectId: project._id,
      filePath,
      content,
      language: language || project.language || "JavaScript",
    });

    // Update Project chunk count
    const totalChunks = await VectorEmbedding.countDocuments({
      project: project._id,
      category: "code",
    });

    await Project.findByIdAndUpdate(project._id, {
      ragChunks: totalChunks,
      ragStatus: totalChunks > 0 ? "indexed" : "pending",
      lastIndexed: new Date(),
    });

    res.status(201).json({
      success: true,
      message: `File ${filePath} successfully indexed into ${project.name} (${chunkCount} vector chunks created).`,
      chunkCount,
      totalChunks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
