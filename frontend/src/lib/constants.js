const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const API_URL = getApiUrl();

export const TOPICS = [
  { value: 'technology', label: 'Technology', icon: 'Laptop', color: 'bg-blue-500' },
  { value: 'ai', label: 'AI & ML', icon: 'Cpu', color: 'bg-purple-500' },
  { value: 'cloud', label: 'Cloud', icon: 'Cloud', color: 'bg-cyan-500' },
  { value: 'cybersecurity', label: 'Cybersecurity', icon: 'Shield', color: 'bg-red-500' },
  { value: 'web3', label: 'Web3', icon: 'Link', color: 'bg-orange-500' },
  { value: 'devops', label: 'DevOps', icon: 'Settings', color: 'bg-green-500' },
  { value: 'finance', label: 'Finance', icon: 'DollarSign', color: 'bg-emerald-500' },
  { value: 'politics', label: 'Politics', icon: 'Gavel', color: 'bg-indigo-500' },
  { value: 'startups', label: 'Startups', icon: 'Rocket', color: 'bg-pink-500' },
  { value: 'science', label: 'Science', icon: 'FlaskConical', color: 'bg-teal-500' },
  { value: 'business', label: 'Business', icon: 'BarChart3', color: 'bg-yellow-500' },
  { value: 'sports', label: 'Sports', icon: 'Trophy', color: 'bg-lime-500' },
  { value: 'geopolitics', label: 'Geopolitics', icon: 'Globe2', color: 'bg-slate-500' },
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
  release: { label: 'Release', icon: 'Package', color: 'bg-green-500' },
  incident: { label: 'Incident', icon: 'AlertTriangle', color: 'bg-red-500' },
  security: { label: 'Security', icon: 'ShieldAlert', color: 'bg-orange-500' },
  upgrade: { label: 'Upgrade', icon: 'ArrowUpCircle', color: 'bg-blue-500' },
  trend: { label: 'Trend', icon: 'TrendingUp', color: 'bg-purple-500' },
  policy: { label: 'Policy', icon: 'FileText', color: 'bg-indigo-500' },
};
