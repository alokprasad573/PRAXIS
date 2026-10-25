const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// All project routes require active authentication
router.use(authenticate);

router.get("/github/repos", projectController.getGithubRepos); // 👈 Placed before /:id
router.get("/", projectController.getProjects);
router.post("/connect", projectController.connectProject);
router.get("/:id", projectController.getProjectById);
router.delete("/:id", projectController.deleteProject); // Standard RESTful deletion
router.post("/:id/disconnect", projectController.deleteProject); // Backward-compatible action alias
router.post("/:id/reindex", projectController.reindexProject);

module.exports = router;