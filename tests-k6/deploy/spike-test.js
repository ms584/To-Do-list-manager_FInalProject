import { userScenario } from '../common/scenarios.js';

// --- Load configuration from .env file ---
const envFile = open('../../tests-k6/deploy/.env').split('\n');

// Helper function to parse the .env file
function getEnvVar(name) {
  const line = envFile.find(l => l.trim().startsWith(name + '='));
  if (!line) {
    throw new Error(`Environment variable "${name}" not found in tests-k6/deploy/.env file.`);
  }
  return line.split('=')[1].trim().replace(/['"]/g, '');
}

const API_BASE_URL = getEnvVar('API_URL');
const AUTH_TOKEN = getEnvVar('AUTH_TOKEN');

export const options = {
  stages: [
    { duration: '1m', target: 10 },
    { duration: '10s', target: 100 },
    { duration: '20s', target: 100 },
    { duration: '10s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  // The check for variables is now implicitly handled by getEnvVar()
  userScenario(API_BASE_URL, AUTH_TOKEN);
}