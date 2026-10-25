const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const workspaceRoutes = require("./routes/workspace.routes");
const workflowRoutes = require("./routes/workflow.routes");
const approvalRoutes = require("./routes/approval.routes");
const agentRoutes = require("./routes/agent.routes");
const notificationRoutes = require("./routes/notification.routes");
const ragRoutes = require("./routes/rag.routes");
const okfRoutes = require("./routes/okf.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const telemetryRoutes = require("./routes/telemetry.routes");
const { atlasConnect } = require("./config/db");

// Global Middlewares
const clientUrlClean = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.replace(/\/+$/, "")
  : null;

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://zfd3vwsk-5173.inc1.devtunnels.ms",
  clientUrlClean,
].filter(Boolean);

const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".devtunnels.ms") ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Tunnel-Skip-Anti-Phishing-Page",
    ],
  }),
);

app.use(express.json());

atlasConnect()
  .then(async () => {
    try {
      const VectorEmbedding = require("./models/vectorEmbedding.models");
      const cleanResult = await VectorEmbedding.deleteMany({ category: "okf_policy" });
      if (cleanResult.deletedCount > 0) {
        console.log(`[VectorDB Clean] Automatically purged ${cleanResult.deletedCount} legacy okf_policy chunks from VectorEmbedding.`);
      }
    } catch (e) {
      console.warn("[VectorDB Clean]:", e.message);
    }

    try {
      const { recoverDanglingWorkflows } = require("./services/agentOrchestrator.service");
      const recovered = await recoverDanglingWorkflows({ autoResume: true });
      if (recovered && recovered.length > 0) {
        console.log(`[Orchestrator Recovery] Successfully recovered ${recovered.length} dangling workflows on startup.`);
      }
    } catch (e) {
      console.warn("[Orchestrator Recovery]:", e.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Database connection error:", err);
    process.exit(1);
  });

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/okf", okfRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/logs", telemetryRoutes);

module.exports = app;
