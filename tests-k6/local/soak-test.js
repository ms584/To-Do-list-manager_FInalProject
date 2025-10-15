import { userScenario } from '../common/scenarios.js';

// --- Load Test for Deployed Environment ---
const API_BASE_URL = 'http://localhost/api';
const AUTH_TOKEN = open('../../tests-k6/local/.env');

export const options = {
  stages: [
    { duration: '30s', target: 15 },
    { duration: '5m', target: 15 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  if (!API_BASE_URL || !AUTH_TOKEN) {
    throw new Error("API_URL and AUTH_TOKEN must be provided as environment variables.");
  }
  userScenario(API_BASE_URL, AUTH_TOKEN);
}