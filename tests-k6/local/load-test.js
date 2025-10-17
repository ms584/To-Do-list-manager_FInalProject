import { userScenario } from '../common/scenarios.js';

// --- Load Test for Local Environment ---
const API_BASE_URL = 'http://localhost/api';
const AUTH_TOKEN = open('../../tests-k6/local/.env');

export const options = {
  scenarios: {
    default: {
      executor: 'ramping-vus',
      stages: [
        { duration: '20s', target: 10 },
        { duration: '30s', target: 10 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], 
    checks: ['rate>0.99'],
  },
};

export default function () {
  userScenario(API_BASE_URL, AUTH_TOKEN);
}