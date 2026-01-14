export function inputGuard(event, userContext = null) {
  // Basic validation
  if (!event.title || event.title.length < 5) {
    return { valid: false, reason: 'Title too short' };
  }
  
  if (event.title.length > 500) {
    return { valid: false, reason: 'Title too long' };
  }
  
  // Spam detection
  const spamKeywords = ['meme', 'upvote if', 'click here', 'buy now'];
  if (spamKeywords.some(keyword => 
    event.title.toLowerCase().includes(keyword)
  )) {
    return { valid: false, reason: 'Spam detected' };
  }
  
  // User-specific filtering (optional - only strict if user has keywords)
  if (userContext && userContext.keywords && userContext.keywords.length > 0) {
    // Keyword matching - only require if user has set keywords
    const hasKeyword = userContext.keywords.some(keyword =>
      event.title.toLowerCase().includes(keyword.toLowerCase()) ||
      (event.content && event.content.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    if (!hasKeyword) {
      return { valid: false, reason: 'No matching keywords' };
    }
  }
  
  // Allow events to pass - let noiseFilter and relevance scoring handle filtering
  return { valid: true };
}