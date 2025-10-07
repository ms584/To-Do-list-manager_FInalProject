import http from 'k6/http';
import { check, sleep } from 'k6';

// CONFIGURATION: ตั้งค่าการทดสอบที่นี่ 
const API_BASE_URL = 'https://backend.onrender.com/api' ; // <-- เปลี่ยนเป็น URL ของ Backend คุณ

// --- ข้อมูลสำหรับ Login (ต้องทำก่อนเริ่มเทส) ---
// 1. Login เข้าเว็บของคุณด้วย Google Account ที่คุณใช้ทดสอบ
// 2. เปิด Developer Tools (F12) -> Application -> Local Storage
// 3. คัดลอกค่าของ 'token' มาวางที่นี่
const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE' ; // <-- เอา Token จริงมาใส่

// --- การตั้งค่า Load Test ---
export const options = {
  stages: [
    // Ramp-up: ค่อยๆ เพิ่มผู้ใช้จาก 0 ไป 20 คนใน 30 วินาที
    { duration: '30s', target: 20 },
    // Stay: คงผู้ใช้ไว้ที่ 20 คนเป็นเวลา 1 นาที
    { duration: '1m', target: 20 },
    // Ramp-down: ลดผู้ใช้ลงเหลือ 0 ใน 10 วินาที
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    // กำหนดเกณฑ์: 95% ของ requests ต้องตอบกลับเร็วกว่า 800ms
    http_req_duration: ['p(95)<800'],
  },
};

// TEST SCENARIO
export default function () {
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // --- 1. ผู้ใช้เปิดหน้าเว็บ (ดึง Task ทั้งหมด) ---
  const res = http.get(`${API_BASE_URL}/tasks`, { headers });
  check(res, { 'GET /tasks status was 200': (r) => r.status === 200 });
  
  sleep(1); // ผู้ใช้หยุดคิด 1 วินาที

  // --- 2. ผู้ใช้เพิ่ม Task ใหม่ ---
  const payload = JSON.stringify({
    title: `New Task from k6 user ${__VU} iter ${__ITER}`, // สร้าง title ที่ไม่ซ้ำกัน
  });
  const createRes = http.post(`${API_BASE_URL}/tasks`, payload, { headers });
  check(createRes, { 'POST /tasks status was 201': (r) => r.status === 201 });
  
  sleep(2); // ผู้ใช้หยุดคิด 2 วินาที
}