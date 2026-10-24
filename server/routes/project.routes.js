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
router.delete("/:id", projectController.deleteProject);
router.post("/:id/delink", projectController.deleteProject);
router.delete("/:id/delink", projectController.deleteProject);
router.post("/:id/disconnect", projectController.deleteProject);
router.post("/:id/reindex", projectController.reindexProject);

module.exports = router;