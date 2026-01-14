export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateTimeFormat(time) {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}

export function validateInterests(interests) {
  const validInterests = [
    'technology',
    'politics',
    'finance',
    'ai',
    'cloud',
    'cybersecurity',
    'web3',
    'devops',
    'sports',
    'startups',
    'science',
    'business',
    'geopolitics'
  ];

  if (!Array.isArray(interests) || interests.length === 0) {
    return { valid: false, message: 'Interests must be a non-empty array' };
  }

  const invalidInterests = interests.filter(i => !validInterests.includes(i));
  
  if (invalidInterests.length > 0) {
    return {
      valid: false,
      message: `Invalid interests: ${invalidInterests.join(', ')}`,
      validOptions: validInterests
    };
  }

  return { valid: true };
}

export function sanitizeText(text, maxLength = 500) {
  if (!text) return '';
  
  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + '...';
  }
  
  return sanitized;
}