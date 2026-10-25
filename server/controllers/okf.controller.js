const OkfPolicy = require("../models/okfPolicy.models");
const { seedAndIndexOkfPolicies } = require("../services/okfIndexer.service");

// 1. GET OKF POLICIES (Scoped by Repository / Project)
exports.getPolicies = async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {};
    if (projectId) {
      filter.project = projectId;
    } else if (req.workspaceId) {
      filter.workspace = req.workspaceId;
    }

    const policies = await OkfPolicy.find(filter).sort({ policyId: 1 });

    const formatted = policies.map((p) => ({
      id: p.policyId,
      _id: p._id,
      projectId: p.project,
      name: p.name,
      category: p.category,
      risk: p.risk,
      status: p.status,
      description: p.description,
      rule: p.rule,
      triggers: p.triggers || 0, // Real triggers from DB
      version: p.version || "v1.0",
    }));

    res.status(200).json({
      success: true,
      projectId: projectId || null,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. CREATE A NEW OKF POLICY FOR A SPECIFIC REPOSITORY
exports.createPolicy = async (req, res) => {
  try {
    const { name, category, risk, rule, description, projectId, policyId } = req.body;

    if (!name || !category || !rule) {
      return res.status(400).json({
        success: false,
        message: "Policy name, category, and deterministic rule are required.",
      });
    }

    const generatedId = policyId || `okf-${Date.now().toString().slice(-4)}`;

    const policy = await OkfPolicy.create({
      workspace: req.workspaceId,
      project: projectId || null,
      policyId: generatedId,
      name,
      category,
      risk: risk || "medium",
      status: "enabled",
      description: description || "",
      rule,
      version: "v1.0",
      triggers: 0,
    });

    res.status(201).json({
      success: true,
      message: `Policy ${policy.name} created for repository.`,
      data: {
        id: policy.policyId,
        _id: policy._id,
        projectId: policy.project,
        name: policy.name,
        category: policy.category,
        risk: policy.risk,
        status: policy.status,
        description: policy.description,
        rule: policy.rule,
        triggers: 0,
        version: policy.version,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. TOGGLE POLICY STATUS (Enabled <-> Disabled)
exports.togglePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id && id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ policyId: id }, { _id: id }] }
      : { policyId: id };

    const policy = await OkfPolicy.findOne(query);

    if (!policy) {
      return res.status(404).json({ success: false, message: "Policy not found." });
    }

    policy.status = policy.status === "enabled" ? "disabled" : "enabled";
    await policy.save();

    res.status(200).json({
      success: true,
      message: `Policy ${policy.policyId} is now ${policy.status}.`,
      data: {
        id: policy.policyId,
        _id: policy._id,
        name: policy.name,
        category: policy.category,
        risk: policy.risk,
        status: policy.status,
        description: policy.description,
        rule: policy.rule,
        triggers: policy.triggers || 0,
        version: policy.version || "v1.0",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. DELETE POLICY
exports.deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id && id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ policyId: id }, { _id: id }] }
      : { policyId: id };

    const policy = await OkfPolicy.findOneAndDelete(query);
    if (!policy) {
      return res.status(404).json({ success: false, message: "Policy not found." });
    }

    res.status(200).json({
      success: true,
      message: `Policy ${policy.policyId} successfully deleted.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. EXPLICITLY APPLY BASELINE POLICIES UPON USER ACTION
exports.applyBaseline = async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required." });
    }

    await seedAndIndexOkfPolicies(req.workspaceId, projectId);
    const policies = await OkfPolicy.find({ project: projectId }).sort({ policyId: 1 });

    res.status(200).json({
      success: true,
      message: "Baseline governance policies applied to repository.",
      data: policies.map((p) => ({
        id: p.policyId,
        _id: p._id,
        projectId: p.project,
        name: p.name,
        category: p.category,
        risk: p.risk,
        status: p.status,
        description: p.description,
        rule: p.rule,
        triggers: 0,
        version: p.version || "v1.0",
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
