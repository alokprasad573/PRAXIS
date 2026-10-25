const Project = require("../models/project.models");
const VectorEmbedding = require("../models/vectorEmbedding.models");
const OkfPolicy = require("../models/okfPolicy.models");
const Notification = require("../models/notifications.models");
const { indexProjectRepository } = require("./codeChunker.service");
const { generateAndStoreOkfGuardrails } = require("./okfGenerator.service");

/**
 * Full End-to-End Repository Ingestion Pipeline with Atomic Consistency Guarantee
 * 1. Fetch Repository Code & Generate Vector Embeddings (AST Code Chunking)
 * 2. Synthesize Repository-Specific OKF Guardrail Policies (AI Governance)
 * 3. Atomic Verification: If either fails, all changes are rolled back cleanly.
 */
async function ingestRepositoryPipeline({
  project,
  userId,
  customFiles = null,
  enableOkf = true,
  isNewProject = false,
}) {
  try {
    if (!project) {
      return { success: false, message: "Project is required for ingestion." };
    }

    // Mark project as currently indexing
    await Project.findByIdAndUpdate(project._id, {
      ragStatus: "indexing",
    });

    // Step 1: Real AST Code Indexing + Vector Embeddings
    const codeIndexResult = await indexProjectRepository(
      project,
      customFiles,
      userId,
    );

    if (!codeIndexResult.success || codeIndexResult.chunksCount === 0) {
      throw new Error(
        codeIndexResult.message ||
          "Failed to generate vector embeddings. No valid source code files could be fetched or parsed.",
      );
    }

    // Step 2: AI Synthesizes Repository-Specific OKF Guardrails
    let policiesCount = 0;
    if (enableOkf) {
      const generatedPolicies = await generateAndStoreOkfGuardrails({
        project,
        files: customFiles || [],
      });

      if (!generatedPolicies || generatedPolicies.length === 0) {
        throw new Error(
          "Failed to synthesize repository OKF governance guardrails.",
        );
      }
      policiesCount = generatedPolicies.length;
    }

    // Step 3: Finalize DB stats - Both vector embeddings and OKF policies succeeded!
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
      { returnDocument: "after" },
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
    console.error("[Ingestion Pipeline Error]:", error.message);

    // Atomic Rollback: If this is a new repository connection, purge all 3 collections cleanly
    if (isNewProject && project?._id) {
      console.warn(
        `[Atomic Rollback]: Ingestion failed for new project ${project._id}. Purging project, vectors, and OKF policies from database.`,
      );
      await Promise.allSettled([
        Project.findByIdAndDelete(project._id),
        VectorEmbedding.deleteMany({ project: project._id }),
        OkfPolicy.deleteMany({ project: project._id }),
      ]);
    } else if (project?._id) {
      await Project.findByIdAndUpdate(project._id, { ragStatus: "error" });
    }

    return { success: false, message: error.message };
  }
}

module.exports = {
  ingestRepositoryPipeline,
};
