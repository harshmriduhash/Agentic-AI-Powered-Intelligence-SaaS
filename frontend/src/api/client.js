import axios from 'axios';
import { API_URL } from '../lib/constants';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
  logout: () => client.post('/auth/logout'),
};

// Onboarding API
export const onboardingAPI = {
  submit: (data) => client.post('/onboarding/submit', data),
  getPreferences: () => client.get('/onboarding/preferences'),
  updatePreferences: (data) => client.put('/onboarding/preferences', data),
};

// Events API
export const eventsAPI = {
  getUserEvents: (userId, params) => client.get(`/events/user/${userId}`, { params }),
  getEvent: (eventId) => client.get(`/events/${eventId}`),
  getStats: (userId) => client.get(`/events/user/${userId}/stats`),
  trackEventView: (userId, eventId) => client.patch(`/events/user/${userId}/event/${eventId}/view`),
  deleteAccount: (userId) => client.delete(`/users/${userId}`),
};

// Feedback API
export const feedbackAPI = {
  submitRating: (data) => client.post('/feedback', data),
};

export default client;