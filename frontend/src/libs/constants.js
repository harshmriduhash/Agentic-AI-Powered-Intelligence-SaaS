export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TOPICS = [
  { value: 'technology', label: 'Technology', icon: '💻', color: 'bg-blue-500' },
  { value: 'ai', label: 'AI & ML', icon: '🤖', color: 'bg-purple-500' },
  { value: 'cloud', label: 'Cloud', icon: '☁️', color: 'bg-cyan-500' },
  { value: 'cybersecurity', label: 'Cybersecurity', icon: '🔒', color: 'bg-red-500' },
  { value: 'web3', label: 'Web3', icon: '⛓️', color: 'bg-orange-500' },
  { value: 'devops', label: 'DevOps', icon: '⚙️', color: 'bg-green-500' },
  { value: 'finance', label: 'Finance', icon: '💰', color: 'bg-emerald-500' },
  { value: 'politics', label: 'Politics', icon: '🏛️', color: 'bg-indigo-500' },
  { value: 'startups', label: 'Startups', icon: '🚀', color: 'bg-pink-500' },
  { value: 'science', label: 'Science', icon: '🔬', color: 'bg-teal-500' },
  { value: 'business', label: 'Business', icon: '📊', color: 'bg-yellow-500' },
  { value: 'sports', label: 'Sports', icon: '⚽', color: 'bg-lime-500' },
  { value: 'geopolitics', label: 'Geopolitics', icon: '🌍', color: 'bg-slate-500' },
];

export const TIMES = [
  { value: '06:00', label: '6:00 AM' },
  { value: '07:00', label: '7:00 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
  { value: '22:00', label: '10:00 PM' },
];

export const TONES = [
  { value: 'concise', label: 'Concise', description: 'Brief and to the point' },
  { value: 'detailed', label: 'Detailed', description: 'Comprehensive analysis' },
  { value: 'technical', label: 'Technical', description: 'Deep technical details' },
];

export const CATEGORIES = {
  release: { label: 'Release', icon: '🚀', color: 'bg-green-500' },
  incident: { label: 'Incident', icon: '🔥', color: 'bg-red-500' },
  security: { label: 'Security', icon: '🛡️', color: 'bg-orange-500' },
  upgrade: { label: 'Upgrade', icon: '⬆️', color: 'bg-blue-500' },
  trend: { label: 'Trend', icon: '📈', color: 'bg-purple-500' },
  policy: { label: 'Policy', icon: '📜', color: 'bg-indigo-500' },
};