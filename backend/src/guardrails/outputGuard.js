export function outputGuard(summary) {
  const errors = [];
  
  // Required fields
  if (!summary.tldr) {
    errors.push('Missing TL;DR');
  }
  
  if (!summary.bullets || summary.bullets.length === 0) {
    errors.push('Missing bullet points');
  }
  
  // Length checks
  if (summary.tldr && summary.tldr.length > 200) {
    errors.push('TL;DR too long (max 200 chars)');
  }
  
  if (summary.bullets) {
    summary.bullets.forEach((bullet, idx) => {
      if (bullet.length > 300) {
        errors.push(`Bullet ${idx + 1} too long`);
      }
    });
  }
  
  // Hallucination detection (basic)
  const dangerousPhrases = [
    'i think', 'probably', 'might be', 'could be',
    'not sure', 'unclear', 'seems like'
  ];
  
  const text = `${summary.tldr} ${summary.bullets?.join(' ')}`.toLowerCase();
  const hasUncertainty = dangerousPhrases.some(phrase => text.includes(phrase));
  
  if (hasUncertainty) {
    errors.push('Output contains uncertain language');
  }
  
  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }
  
  return { valid: true };
}