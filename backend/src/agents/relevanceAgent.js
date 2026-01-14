import UserEvent from '../models/UserEvent.js';

export async function relevanceAgent(event, userContext) {
  let score = event.importanceScore || 5;
  
  // Keyword boost
  if (userContext.keywords && userContext.keywords.length > 0) {
    const keywordMatches = userContext.keywords.filter(keyword =>
      event.title.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    score += keywordMatches * 0.5;
  }
  
  // Historical feedback boost
  const userHistory = await UserEvent.find({
    userId: userContext._id,
    rating: { $exists: true }
  }).limit(50);
  
  if (userHistory.length > 0) {
    const avgRating = userHistory.reduce((sum, ue) => sum + ue.rating, 0) / userHistory.length;
    const ratingWeight = (avgRating - 3) * 0.3; // -0.6 to +0.6
    score += ratingWeight;
  }
  
  // Topic alignment
  if (event.topics) {
    const topicMatches = event.topics.filter(topic =>
      userContext.interests.includes(topic)
    ).length;
    
    score += topicMatches * 0.3;
  }
  
  // Cap score
  score = Math.max(1, Math.min(10, score));
  
  return {
    relevanceScore: score,
    factors: {
      baseScore: event.importanceScore,
      keywordBoost: userContext.keywords?.length || 0,
      feedbackAdjustment: userHistory.length > 0,
      topicAlignment: event.topics?.length || 0
    }
  };
}