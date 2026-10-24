const Project = require("../models/project.models");
const VectorEmbedding = require("../models/vectorEmbedding.models");
const Notification = require("../models/notifications.models");
const { indexProjectRepository } = require("./codeChunker.service");
const { generateAndStoreOkfGuardrails } = require("./okfGenerator.service");

/**
 * Full End-to-End Repository Ingestion Pipeline
 * 1. Fetch Repository Code (GitHub or Local)
 * 2. Google Gemini Text-Embedding Model -> Vector Chunks in VectorEmbedding
 * 3. Gemini / Groq LLM -> Repository-Specific OKF Guardrails in OkfPolicy & VectorEmbedding
 * 4. Update Database records & notify
 */
async function ingestRepositoryPipeline({ project, userId, customFiles = null, enableOkf = true }) {
  try {
    if (!project) {
      return { success: false, message: "Project is required for ingestion." };
    }

    // Mark project as currently indexing
    await Project.findByIdAndUpdate(project._id, {
      ragStatus: "indexing",
    });

    // Step 1 & 2: Real AST Code Indexing + Gemini Vector Embeddings (80% RAG)
    const codeIndexResult = await indexProjectRepository(project, customFiles, userId);

    // Step 3: Gemini / Groq LLM Synthesizes Repository-Specific OKF Guardrails (20% OKF)
    let policiesCount = 0;
    if (enableOkf) {
      const generatedPolicies = await generateAndStoreOkfGuardrails({
        project,
        files: customFiles || [],
      });
      policiesCount = generatedPolicies.length;
    }

    // Step 4: Finalize DB stats
    const totalChunks = await VectorEmbedding.countDocuments({
      project: project._id,
      category: "code",
    });

    const updatedProject = await Project.findByIdAndUpdate(
      project._id,
      {
        ragChunks: totalChunks,
        ragStatus: totalChunks > 0 ? "indexed" : "pending",
        lastIndexed: new Date(),
      },
      { returnDocument: 'after' }
    );

    // Create real notification in MongoDB
    try {
      await Notification.create({
        user: userId || null,
        workspace: project.workspace,
        title: "Repository Ingested Successfully",
        message: `${project.name} vectorized into ${totalChunks} RAG chunks + ${policiesCount} OKF guardrails synthesized.`,
        type: "success",
        unread: true,
      });
    } catch (notifErr) {
      console.warn("Failed to create notification:", notifErr.message);
    }

    return {
      success: true,
      projectId: project._id,
      projectName: project.name,
      ragChunks: totalChunks,
      okfPolicies: policiesCount,
      project: updatedProject,
      message: `Repository ${project.name} successfully ingested: ${totalChunks} vector chunks + ${policiesCount} OKF guardrails created.`,
    };
  } catch (error) {
    console.error("Repository ingestion pipeline error:", error);
    await Project.findByIdAndUpdate(project._id, { ragStatus: "error" });
    return { success: false, message: error.message };
  }
}

module.exports = {
  ingestRepositoryPipeline,
};

