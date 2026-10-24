const express = require("express");
const router = express.Router();
const okfController = require("../controllers/okf.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/policies", okfController.getPolicies);
router.post("/policies", okfController.createPolicy);
router.post("/policies/baseline", okfController.applyBaseline);
router.patch("/policies/:id/toggle", okfController.togglePolicy);
router.delete("/policies/:id", okfController.deletePolicy);

module.exports = router;
