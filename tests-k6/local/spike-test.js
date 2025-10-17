import { userScenario } from '../common/scenarios.js';

// --- Load Test for Deployed Environment ---
const API_BASE_URL = 'http://localhost/api';
const AUTH_TOKEN = open('../../tests-k6/local/.env');

export const options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '5s', target: 30 },
    { duration: '10s', target: 30 },
    { duration: '5s', target: 5 },
    { duration: '20s', target: 5 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<4000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  if (!API_BASE_URL || !AUTH_TOKEN) {
    throw new Error("API_URL and AUTH_TOKEN must be provided as environment variables.");
  }
  userScenario(API_BASE_URL, AUTH_TOKEN);
}