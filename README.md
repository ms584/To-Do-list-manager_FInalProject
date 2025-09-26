---

### **📜 API Contract**

เอกสารนี้คือ "สัญญา" ที่กำหนดวิธีการสื่อสารระหว่าง Frontend และ Backend API ทุกตัวจะอยู่ภายใต้ Base URL: `/api` และ API ส่วนใหญ่ (ยกเว้น Login) จะต้องมีการยืนยันตัวตน

---

#### **Authentication**

ทุกๆ Request ที่ต้องมีการยืนยันตัวตน จะต้องส่ง JWT Token ที่ได้รับหลังจาก Login สำเร็จมาใน HTTP Header ดังนี้:

```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

---

### **Authentication Endpoints**

#### **1. Login with Google**
*   **Endpoint:** `POST /api/auth/google/login`
*   **Description:** ใช้สำหรับยืนยันตัวตนผู้ใช้ผ่าน Google Token ที่ได้มาจาก Frontend เมื่อสำเร็จ ระบบจะสร้าง/ค้นหา User และส่ง JWT Token ของแอปพลิเคชันกลับไป
*   **Authentication:** `Public` (ไม่ต้องใช้ Token)
*   **Request Body:**
    ```json
    {
      "token": "GOOGLE_ID_TOKEN_FROM_FRONTEND"
    }
    ```
*   **Success Response (`200 OK`):**
    ```json
    {
      "access_token": "YOUR_APPLICATION_JWT_TOKEN",
      "token_type": "bearer"
    }
    ```
*   **Error Response (`400 Bad Request`):**
    *   เมื่อ `token` ที่ส่งมาไม่ถูกต้องหรือไม่สามารถตรวจสอบกับ Google ได้

---

### **User Endpoints**

#### **1. Get Current User Info**
*   **Endpoint:** `GET /api/users/me`
*   **Description:** ดึงข้อมูลของผู้ใช้ที่กำลัง Login อยู่ (เช่น ชื่อ, อีเมล)
*   **Authentication:** `Required`
*   **Request Body:** `None`
*   **Success Response (`200 OK`):**
    ```json
    {
      "id": "user_mongodb_object_id",
      "email": "user@example.com",
      "username": "User Name"
    }
    ```
*   **Error Response (`401 Unauthorized`):**
    *   เมื่อไม่ได้ส่ง Token หรือ Token ไม่ถูกต้อง

---

### **Task Endpoints**

#### **1. Get All Tasks for User**
*   **Endpoint:** `GET /api/tasks`
*   **Description:** ดึง To-Do List ทั้งหมดของผู้ใช้ที่กำลัง Login อยู่
*   **Authentication:** `Required`
*   **Request Body:** `None`
*   **Success Response (`200 OK`):**
    ```json
    [
      {
        "id": "task_mongodb_object_id_1",
        "title": "Finish the project",
        "done": false
      },
      {
        "id": "task_mongodb_object_id_2",
        "title": "Prepare presentation",
        "done": true
      }
    ]
    ```

#### **2. Create New Task**
*   **Endpoint:** `POST /api/tasks`
*   **Description:** สร้าง Task ใหม่สำหรับผู้ใช้ที่กำลัง Login อยู่
*   **Authentication:** `Required`
*   **Request Body:**
    ```json
    {
      "title": "My new awesome task"
    }
    ```
*   **Success Response (`201 Created`):**
    ```json
    {
      "id": "new_task_mongodb_object_id",
      "title": "My new awesome task",
      "done": false
    }
    ```
*   **Error Response (`422 Unprocessable Entity`):**
    *   เมื่อ `title` ไม่ได้ถูกส่งมา หรือมี data type ไม่ถูกต้อง

#### **3. Update a Task**
*   **Endpoint:** `PUT /api/tasks/{task_id}`
*   **Description:** แก้ไขรายละเอียดของ Task ที่มีอยู่ (เช่น แก้ไข title หรือเปลี่ยนสถานะ `done`)
*   **Authentication:** `Required`
*   **Request Body:**
    ```json
    {
      "title": "My updated task title",
      "done": true
    }
    ```
*   **Success Response (`200 OK`):**
    ```json
    {
      "id": "task_mongodb_object_id",
      "title": "My updated task title",
      "done": true
    }
    ```
*   **Error Response (`404 Not Found`):**
    *   เมื่อ `task_id` ที่ระบุไม่มีอยู่ หรือไม่ได้เป็นของผู้ใช้ที่ Login อยู่

#### **4. Delete a Task**
*   **Endpoint:** `DELETE /api/tasks/{task_id}`
*   **Description:** ลบ Task ที่มีอยู่ออกจากระบบ
*   **Authentication:** `Required`
*   **Request Body:** `None`
*   **Success Response (`204 No Content`):**
    *   จะไม่มี Response Body ส่งกลับไป
*   **Error Response (`404 Not Found`):**
    *   เมื่อ `task_id` ที่ระบุไม่มีอยู่ หรือไม่ได้เป็นของผู้ใช้ที่ Login อยู่

#### **5. Export Tasks as CSV**
*   **Endpoint:** `GET /api/tasks/export`
*   **Description:** ดาวน์โหลด To-Do List ทั้งหมดของผู้ใช้ในรูปแบบไฟล์ CSV
*   **Authentication:** `Required`
*   **Request Body:** `None`
*   **Success Response (`200 OK`):**
    *   **Response Body:** จะเป็นข้อมูล Text ของไฟล์ CSV
    *   **Headers:**
        *   `Content-Type: text/csv`
        *   `Content-Disposition: attachment; filename="tasks.csv"` (เพื่อให้ browser ดาวน์โหลดไฟล์)

---