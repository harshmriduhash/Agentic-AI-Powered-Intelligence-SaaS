import { inputGuard } from '../guardrails/inputGuard.js';
import { outputGuard } from '../guardrails/outputGuard.js';
import { noiseFilterAgent } from '../agents/noiseFilterAgent.js';
import { classificationAgent } from '../agents/classificationAgent.js';
import { summarizerAgent } from '../agents/summarizerAgent.js';
import { relevanceAgent } from '../agents/relevanceAgent.js';
import logger from '../utils/logger.js';
import reviewQueue from '../humanLoop/ReviewQueue.js';
import threadManager from '../context/ThreadManager.js';

export async function managerAgent(event, userContext) {
  logger.agent('Manager', `Processing event: ${event.title.substring(0, 50)}...`);
  
  try {
    // Step 1: Input Guardrails
const inputCheck = inputGuard(event, userContext);
if (!inputCheck.valid) {
  logger.agent('Manager', `Rejected by input guard: ${inputCheck.reason}`);
  return null;
}

// Step 2: Noise Filtering
const noiseResult = await noiseFilterAgent(event, userContext);
if (!noiseResult.important || noiseResult.score < 5) {
  logger.agent('Manager', `Filtered as noise (score: ${noiseResult.score})`);
  return null;
}

event.noiseScore = noiseResult.score;
event.importanceScore = noiseResult.score;

// Step 3: Classification
const classification = await classificationAgent(event, userContext);
event.category = classification.category;
event.topics = classification.topics;

// Step 4: Thread Management
const relatedThread = await threadManager.findRelatedThread(event);
if (relatedThread) {
  await threadManager.addEventToThread(relatedThread.slug, event._id);
  logger.agent('Manager', `Added to thread: ${relatedThread.slug}`);
}

// Step 5: Summarization
const summary = await summarizerAgent(event, userContext);
event.summary = summary;

// Step 6: Output Guardrails
const outputCheck = outputGuard(summary);
if (!outputCheck.valid) {
  logger.agent('Manager', `Failed output guard: ${outputCheck.errors.join(', ')}`);
  return null;
}

// Step 7: Relevance Scoring
const relevance = await relevanceAgent(event, userContext);
event.relevanceScore = relevance.relevanceScore;

// Step 8: Human Review Decision
const needsReview = shouldRequestHumanReview(event, userContext);
event.needsHumanReview = needsReview;

if (needsReview) {
  await reviewQueue.addToQueue(event, getReviewReason(event));
}

logger.agent('Manager', `Successfully processed (relevance: ${relevance.relevanceScore.toFixed(2)})`);

return {
  event,
  success: true,
  needsHumanReview: needsReview,
  event: {
    relevanceScore: relevance.relevanceScore,
    category: classification.category,
    topics: classification.topics,
    summary: summary,
    importanceScore: noiseResult.score,
    noiseScore: noiseResult.score
  }
};
} catch (error) {
logger.error('Manager agent error', error, { eventTitle: event.title });
return null;
}
}
function shouldRequestHumanReview(event, userContext) {
// High importance
if (event.importanceScore >= 9) return true;
// Security or incidents in sensitive domains
if (['security', 'incident', 'outage', 'vulnerability'].includes(event.category)) {
if (event.topics.some(t => ['politics', 'finance', 'cybersecurity'].includes(t))) {
return true;
}
}
// High relevance but uncertain classification
if (event.relevanceScore >= 8 && ['trend', 'announcement'].includes(event.category)) {
return true;
}
return false;
}
function getReviewReason(event) {
if (event.importanceScore >= 9) {
return 'High importance score (≥9)';
}
if (['security', 'vulnerability'].includes(event.category)) {
return 'Security-related event';
}
if (['incident', 'outage'].includes(event.category)) {
return 'Critical incident/outage';
}
if (event.relevanceScore >= 8) {
return 'High user relevance but needs verification';
}
return 'Unknown reason';
}
export default managerAgent;