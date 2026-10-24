const express = require("express");
const router = express.Router();
const ragController = require("../controllers/rag.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/sources", ragController.getSources);
router.post("/query", ragController.queryVector);
router.post("/reindex", ragController.reindex);
router.post("/index-file", ragController.indexSingleFile);

module.exports = router;
