import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { format } from 'date-fns';

export function userScenario(apiBaseUrl, authToken) {
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };

  const todayString = format(new Date(), 'yyyy-MM-dd');

  group('View Today\'s Tasks', function () {
    const res = http.get(`${apiBaseUrl}/logs/${todayString}`, { headers });
    check(res, {
      '[GET Tasks] status is 200': (r) => r.status === 200,
    });
    sleep(1);
  });

  group('Add a New Task', function () {
    const priorities = ['A', 'B', 'C'];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];

    const payload = JSON.stringify({
      title: `New k6 Task for VU ${__VU} Iter ${__ITER}`,
      priority: randomPriority,
      scheduled_time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
    });

    const res = http.post(`${apiBaseUrl}/logs/${todayString}/tasks`, payload, { headers });
    check(res, {
      '[POST Task] status is 201': (r) => r.status === 201,
      '[POST Task] response has an ID': (r) => r.json('id') !== '',
    });
    sleep(2);
  });
}