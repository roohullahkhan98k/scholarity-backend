# API Testing Guide

## Base URL
```
http://localhost:3000
```

## Test Credentials

### Admin User
- Email: `admin@scholarity.com`
- Password: `Admin123!`

---

## 1. Signup (Register New Student)

**POST** `/auth/signup`

```json
{
  "email": "student@example.com",
  "password": "Student123!",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student",
    "isActive": true
  }
}
```

---

## 2. Login

**POST** `/auth/login`

```json
{
  "email": "student@example.com",
  "password": "Student123!"
}
```

**Response:** Same as signup

---

## 3. Get Profile (Protected)

**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer {your_token_here}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "student@example.com",
  "name": "John Doe",
  "role": "student",
  "isActive": true
}
```

---

## 4. Logout (Protected)

**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer {your_token_here}
```

**Response:**
```json
{
  "message": "Logged out successfully",
  "userId": "uuid"
}
```

> **Note:** JWT tokens are stateless, so logout is primarily handled on the frontend by removing the token from localStorage. This endpoint is provided for logging/analytics purposes.

---

## 5. Apply for Instructor (Student Only)

**POST** `/instructor/apply`

**Headers:**
```
Authorization: Bearer {student_token}
```

**Body:**
```json
{
  "bio": "I am an experienced software engineer with over 5 years in the industry. Passionate about teaching and mentoring.",
  "expertise": "Web Development, Node.js, React, TypeScript, Database Design",
  "experience": "I have been teaching programming for 3 years at various bootcamps and have mentored over 50 students successfully."
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "PENDING",
  "createdAt": "2026-01-31T10:00:00Z"
}
```

---

## 5. List Instructor Applications (Admin Only)

**GET** `/instructor/applications`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Optional Query Params:**
- `?status=PENDING` - Filter by status (PENDING, APPROVED, REJECTED)

**Response:**
```json
{
  "applications": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "student@example.com"
      },
      "bio": "I am an experienced...",
      "expertise": "Web Development...",
      "experience": "I have been teaching...",
      "status": "PENDING",
      "reviewedBy": null,
      "reviewedAt": null,
      "rejectionReason": null,
      "createdAt": "2026-01-31T10:00:00Z",
      "updatedAt": "2026-01-31T10:00:00Z"
    }
  ]
}
```

---

## 6. Review Application (Admin Only)

**PATCH** `/instructor/applications/{application_id}`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Approve Application:**
```json
{
  "status": "APPROVED"
}
```

**Reject Application:**
```json
{
  "status": "REJECTED",
  "rejectionReason": "Insufficient teaching experience"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "APPROVED",
  "reviewedAt": "2026-01-31T11:00:00Z"
}
```

> **Note:** When approved, the user's role is automatically updated from "student" to "teacher"

---

## Testing Flow

### 1. Register a Student
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "Student123!",
    "name": "John Doe"
  }'
```

### 2. Login as Student
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "Student123!"
  }'
```

### 3. Apply for Instructor (use token from step 2)
```bash
curl -X POST http://localhost:3000/instructor/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -d '{
    "bio": "Experienced software engineer with passion for teaching...",
    "expertise": "Web Development, Node.js, React",
    "experience": "5 years teaching experience at bootcamps..."
  }'
```

### 4. Login as Admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@scholarity.com",
    "password": "Admin123!"
  }'
```

### 5. List Applications (use admin token)
```bash
curl -X GET http://localhost:3000/instructor/applications \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 6. Approve Application (use admin token and application ID)
```bash
curl -X PATCH http://localhost:3000/instructor/applications/APPLICATION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "status": "APPROVED"
  }'
```

### 7. Verify Student is Now Teacher
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

The response should now show `"role": "teacher"`
