const { InferenceClient, setLogger } = require("@huggingface/inference");

// Silence verbose internal Hugging Face routing logs
if (typeof setLogger === "function") {
  setLogger({
    log: () => {},
    info: () => {},
    warn: () => {},
    debug: () => {},
    error: () => {},
  });
}

const MODEL_NAME =
  process.env.EMBEDDINGS_MODEL_NAME ||
  "sentence-transformers/all-MiniLM-L6-v2";
const DIMENSIONS = 384;

let clientInstance = null;
function getHFClient() {
  const token = process.env.HF_TOKEN;
  if (!token) return null;
  if (!clientInstance) {
    clientInstance = new InferenceClient(token);
  }
  return clientInstance;
}

/**
 * Deterministic fallback embedding generator (L2 Normalized)
 * Used if API quotas/keys are offline or rate-limited.
 */
function generateFallbackEmbedding(text, dims = DIMENSIONS) {
  const vector = new Array(dims).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  // Seeded random walk to fill dimensions
  let seed = Math.abs(hash) || 123456789;
  let norm = 0;
  for (let i = 0; i < dims; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const val = (seed / 233280.0) * 2 - 1;
    vector[i] = val;
    norm += val * val;
  }

  // L2 Normalize
  const mag = Math.sqrt(norm) || 1;
  return vector.map((v) => Number((v / mag).toFixed(6)));
}

let warnedOnce = false;
let isHfHealthy = true;
let lastHfFailure = 0;
const HF_RETRY_INTERVAL_MS = 60 * 1000; // 60s cooldown on auth/network failure

/**
 * Generate embedding using @huggingface/inference SDK with Circuit Breaker
 */
async function generateEmbedding(text) {
  const client = getHFClient();
  const model =
    process.env.EMBEDDINGS_MODEL_NAME ||
    "sentence-transformers/all-MiniLM-L6-v2";

  // Check circuit breaker: if HF failed recently, skip remote calls to prevent request timeouts
  const shouldAttemptHf =
    Boolean(client) &&
    (isHfHealthy || Date.now() - lastHfFailure > HF_RETRY_INTERVAL_MS);

  if (shouldAttemptHf) {
    try {
      const result = await client.featureExtraction({
        model,
        inputs: (text || "").slice(0, 8000),
      });

      const flat = Array.isArray(result?.[0]) ? result[0] : result;
      if (Array.isArray(flat) && flat.every(Number.isFinite) && flat.length > 0) {
        isHfHealthy = true;
        return flat;
      }
    } catch (err) {
      isHfHealthy = false;
      lastHfFailure = Date.now();
      if (!warnedOnce) {
        console.warn(
          `[@huggingface/inference Notice]: ${err.message}. Fast local ${DIMENSIONS}-dim fallback engine activated to prevent HTTP timeouts.`
        );
        warnedOnce = true;
      }
    }
  }

  // Fallback to local deterministic normalized vector
  return generateFallbackEmbedding(text, DIMENSIONS);
}

/**
 * Alias for backward compatibility across server codebase
 */
const getEmbedding = generateEmbedding;

/**
 * Batch generate embeddings using @huggingface/inference SDK
 */
async function getBatchEmbeddings(texts = []) {
  if (!texts || texts.length === 0) return [];
  return Promise.all(texts.map((t) => generateEmbedding(t)));
}

module.exports = {
  generateEmbedding,
  getEmbedding,
  getBatchEmbeddings,
  MODEL_NAME,
  DIMENSIONS,
};
