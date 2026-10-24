const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const workspaceRoutes = require("./routes/workspace.routes");
const workflowRoutes = require("./routes/workflow.routes");
const approvalRoutes = require("./routes/approval.routes");
const agentRoutes = require("./routes/agent.routes");
const notificationRoutes = require("./routes/notification.routes");
const ragRoutes = require("./routes/rag.routes");
const okfRoutes = require("./routes/okf.routes");
const { atlasConnect } = require("./config/db");

// Global Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://zfd3vwsk-5173.inc1.devtunnels.ms",
  process.env.CLIENT_URL,
].filter(Boolean);

const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  }),
);

app.use(express.json());

atlasConnect()
  .then(() => {
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
