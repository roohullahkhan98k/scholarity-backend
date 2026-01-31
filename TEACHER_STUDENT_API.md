# Teacher & Student Management API

Complete CRUD API documentation for managing teacher and student profiles.

---

## Overview

**Separate endpoints** for managing teacher and student profiles. These are distinct from the User model and store role-specific profile information.

### Frontend Usage:
- **Teachers Page** → Use `/teachers` endpoint to fetch all teachers
- **Students Page** → Use `/students` endpoint to fetch all students
- **Admin** → Can access both endpoints to see all data

**Base URL:** `http://localhost:3000`

---

## Teacher Endpoints

### 1. Create Teacher Profile (Admin Only)

**POST** `/teachers`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "userId": "user-uuid-here",
  "bio": "Experienced software engineer with 10+ years...",
  "expertise": "Web Development, Node.js, React, TypeScript",
  "experience": "Teaching at universities for 5 years..."
}
```

**Response:**
```json
{
  "id": "teacher-uuid",
  "userId": "user-uuid",
  "bio": "Experienced software engineer...",
  "expertise": "Web Development, Node.js, React, TypeScript",
  "experience": "Teaching at universities for 5 years...",
  "rating": 0,
  "totalStudents": 0,
  "createdAt": "2026-01-31T10:00:00Z",
  "updatedAt": "2026-01-31T10:00:00Z",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "id": "role-uuid",
      "name": "teacher"
    }
  }
}
```

---

### 2. List All Teachers

**GET** `/teachers`

**Headers:**
```
Authorization: Bearer {token}
```

**Description:**
Returns all users who are teachers OR have instructor applications (pending/approved/rejected).

**Response:**
```json
[
  {
    "id": "teacher-uuid",
    "userId": "user-uuid",
    "name": "Teacher Applicant 1",
    "email": "teacher-applicant1@scholarity.com",
    "role": "student",
    "isActive": true,
    "bio": "I am a passionate educator with experience...",
    "expertise": "Web Development, JavaScript, React, Node.js",
    "experience": "5 years of professional development experience...",
    "rating": 0,
    "totalStudents": 0,
    "applicationStatus": "PENDING",
    "createdAt": "2026-01-31T10:00:00Z",
    "updatedAt": "2026-01-31T10:00:00Z"
  },
  {
    "id": "teacher-uuid-2",
    "userId": "user-uuid-2",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "teacher",
    "isActive": true,
    "bio": "Experienced software engineer...",
    "expertise": "Web Development, Node.js, React",
    "experience": "Teaching at universities for 5 years...",
    "rating": 4.5,
    "totalStudents": 120,
    "applicationStatus": "APPROVED",
    "createdAt": "2026-01-31T10:00:00Z",
    "updatedAt": "2026-01-31T10:00:00Z"
  }
]
```

> **Note:** This endpoint returns users with instructor applications (even if pending) AND approved teachers. The `applicationStatus` field indicates whether they are PENDING, APPROVED, or REJECTED.

---

### 3. Get Teacher by ID

**GET** `/teachers/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** Same as create response

---

### 4. Update Teacher (Admin Only)

**PATCH** `/teachers/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "bio": "Updated bio...",
  "expertise": "Updated expertise...",
  "rating": 4.8,
  "totalStudents": 150
}
```

**Response:** Updated teacher object

---

### 5. Delete Teacher (Admin Only)

**DELETE** `/teachers/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "message": "Teacher deleted successfully"
}
```

---

## Student Endpoints

### 1. Create Student Profile (Admin Only)

**POST** `/students`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "userId": "user-uuid-here",
  "bio": "Passionate learner interested in web development...",
  "interests": "JavaScript, React, Node.js, AI"
}
```

**Response:**
```json
{
  "id": "student-uuid",
  "userId": "user-uuid",
  "bio": "Passionate learner...",
  "interests": "JavaScript, React, Node.js, AI",
  "enrolledCourses": 0,
  "completedCourses": 0,
  "createdAt": "2026-01-31T10:00:00Z",
  "updatedAt": "2026-01-31T10:00:00Z",
  "user": {
    "id": "user-uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": {
      "id": "role-uuid",
      "name": "student"
    }
  }
}
```

---

### 2. List All Students

**GET** `/students`

**Headers:**
```
Authorization: Bearer {token}
```

**Description:**
Returns all users who are students AND have NOT applied to become instructors.

**Response:**
```json
[
  {
    "id": "student-uuid",
    "userId": "user-uuid",
    "name": "Jane Smith",
    "email": "student1@scholarity.com",
    "role": "student",
    "isActive": true,
    "bio": "Eager to learn web development",
    "interests": "JavaScript, React, Node.js",
    "enrolledCourses": 3,
    "completedCourses": 1,
    "createdAt": "2026-01-31T10:00:00Z",
    "updatedAt": "2026-01-31T10:00:00Z"
  }
]
```

> **Note:** This endpoint excludes students who have applied to become instructors. Those users appear in the `/teachers` endpoint instead.

---

### 3. Get Student by ID

**GET** `/students/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** Same as create response

---

### 4. Update Student (Admin Only)

**PATCH** `/students/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "bio": "Updated bio...",
  "interests": "Updated interests...",
  "enrolledCourses": 5,
  "completedCourses": 3
}
```

**Response:** Updated student object

---

### 5. Delete Student (Admin Only)

**DELETE** `/students/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "message": "Student deleted successfully"
}
```

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| **Teachers** |
| POST | `/teachers` | Create teacher profile | Yes | Admin |
| GET | `/teachers` | List all teachers | Yes | Any |
| GET | `/teachers/:id` | Get teacher by ID | Yes | Any |
| PATCH | `/teachers/:id` | Update teacher | Yes | Admin |
| DELETE | `/teachers/:id` | Delete teacher | Yes | Admin |
| **Students** |
| POST | `/students` | Create student profile | Yes | Admin |
| GET | `/students` | List all students | Yes | Any |
| GET | `/students/:id` | Get student by ID | Yes | Any |
| PATCH | `/students/:id` | Update student | Yes | Admin |
| DELETE | `/students/:id` | Delete student | Yes | Admin |

---

## Testing Examples

### Create Teacher Profile

```bash
curl -X POST http://localhost:3000/teachers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": "user-uuid",
    "bio": "Experienced developer and educator",
    "expertise": "Web Development, JavaScript, React",
    "experience": "10 years in software development, 5 years teaching"
  }'
```

### List All Teachers

```bash
curl -X GET http://localhost:3000/teachers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Student Profile

```bash
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": "user-uuid",
    "bio": "Eager to learn web development",
    "interests": "JavaScript, React, Node.js"
  }'
```

### Update Student

```bash
curl -X PATCH http://localhost:3000/students/student-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "enrolledCourses": 3,
    "completedCourses": 1
  }'
```

---

## Important Notes

1. **User Role Validation**: Users must have the corresponding role (teacher/student) to create a profile
2. **One Profile Per User**: Each user can only have one teacher OR one student profile
3. **Cascade Delete**: When a user is deleted, their teacher/student profile is automatically deleted
4. **Admin Only**: Create, update, and delete operations require admin role
5. **Public Read**: Anyone authenticated can view teacher and student lists

---

## Error Responses

### User Not Found
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

### Profile Already Exists
```json
{
  "statusCode": 409,
  "message": "Teacher profile already exists for this user"
}
```

### Unauthorized
```json
{
  "statusCode": 403,
  "message": "User does not have required role. Required: admin"
}
```

### Invalid Role
```json
{
  "statusCode": 409,
  "message": "User must have teacher role"
}
```

---

## Frontend Integration

### Fetching Teachers (for Teachers Page)

```typescript
// src/services/teacherService.ts
import api from '@/lib/api';

export const teacherService = {
  // Get all teachers
  async getAllTeachers() {
    const response = await api.get('/teachers');
    return response.data;
  },

  // Get single teacher
  async getTeacher(id: string) {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  // Create teacher (admin only)
  async createTeacher(data: { userId: string; bio?: string; expertise?: string; experience?: string }) {
    const response = await api.post('/teachers', data);
    return response.data;
  },

  // Update teacher (admin only)
  async updateTeacher(id: string, data: any) {
    const response = await api.patch(`/teachers/${id}`, data);
    return response.data;
  },

  // Delete teacher (admin only)
  async deleteTeacher(id: string) {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },
};
```

### Fetching Students (for Students Page)

```typescript
// src/services/studentService.ts
import api from '@/lib/api';

export const studentService = {
  // Get all students
  async getAllStudents() {
    const response = await api.get('/students');
    return response.data;
  },

  // Get single student
  async getStudent(id: string) {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  // Create student (admin only)
  async createStudent(data: { userId: string; bio?: string; interests?: string }) {
    const response = await api.post('/students', data);
    return response.data;
  },

  // Update student (admin only)
  async updateStudent(id: string, data: any) {
    const response = await api.patch(`/students/${id}`, data);
    return response.data;
  },

  // Delete student (admin only)
  async deleteStudent(id: string) {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};
```

### React Component Examples

#### Teachers List Page

```typescript
// src/pages/TeachersPage.tsx
import { useState, useEffect } from 'react';
import { teacherService } from '@/services/teacherService';

export function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Failed to load teachers', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading teachers...</div>;

  return (
    <div className="teachers-page">
      <h1>Teachers</h1>
      <div className="teachers-grid">
        {teachers.map((teacher: any) => (
          <div key={teacher.id} className="teacher-card">
            <h3>{teacher.user.name}</h3>
            <p>{teacher.user.email}</p>
            <p><strong>Expertise:</strong> {teacher.expertise}</p>
            <p><strong>Rating:</strong> {teacher.rating}/5</p>
            <p><strong>Students:</strong> {teacher.totalStudents}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Students List Page

```typescript
// src/pages/StudentsPage.tsx
import { useState, useEffect } from 'react';
import { studentService } from '@/services/studentService';

export function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading students...</div>;

  return (
    <div className="students-page">
      <h1>Students</h1>
      <div className="students-grid">
        {students.map((student: any) => (
          <div key={student.id} className="student-card">
            <h3>{student.user.name}</h3>
            <p>{student.user.email}</p>
            <p><strong>Interests:</strong> {student.interests}</p>
            <p><strong>Enrolled:</strong> {student.enrolledCourses} courses</p>
            <p><strong>Completed:</strong> {student.completedCourses} courses</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### TypeScript Types

```typescript
// src/types/index.ts

export interface Teacher {
  id: string;
  userId: string;
  bio?: string;
  expertise?: string;
  experience?: string;
  rating: number;
  totalStudents: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
}

export interface Student {
  id: string;
  userId: string;
  bio?: string;
  interests?: string;
  enrolledCourses: number;
  completedCourses: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
}
```

---

## Summary

✅ **Separate APIs** - `/teachers` and `/students` are completely separate  
✅ **Frontend Pages** - Use `/teachers` for Teachers page, `/students` for Students page  
✅ **Smart Filtering**:
  - `/teachers` shows users with teacher role OR instructor applications (pending/approved/rejected)
  - `/students` shows only students who have NOT applied to become instructors
✅ **Admin Access** - Admins can access both endpoints  
✅ **Application Status** - Teachers endpoint includes `applicationStatus` field (PENDING/APPROVED/REJECTED)  
✅ **CRUD Operations** - Full create, read, update, delete for both

