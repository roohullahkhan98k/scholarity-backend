# Frontend Integration Guide

## Base Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:3000
# or for production
VITE_API_URL=https://api.scholarity.com
```

---

## API Client Setup

### Axios Instance Configuration

```typescript
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Authentication Service

### Auth Service Implementation

```typescript
// src/services/authService.ts
import api from '@/lib/api';

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'teacher' | 'student';
    isActive: boolean;
  };
}

export const authService = {
  // Sign up new user
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post('/auth/signup', data);
    this.saveAuth(response.data);
    return response.data;
  },

  // Login existing user
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    this.saveAuth(response.data);
    return response.data;
  },

  // Get current user profile
  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Save auth data to localStorage
  saveAuth(data: AuthResponse) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
  },

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  },
};
```

---

## Instructor Application Service

```typescript
// src/services/instructorService.ts
import api from '@/lib/api';
import { ApplicationStatus } from '@/types';

export interface ApplyInstructorData {
  bio: string;
  expertise: string;
  experience: string;
}

export interface InstructorApplication {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  bio: string;
  expertise: string;
  experience: string;
  status: ApplicationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const instructorService = {
  // Apply to become instructor (student only)
  async apply(data: ApplyInstructorData) {
    const response = await api.post('/instructor/apply', data);
    return response.data;
  },

  // Get all applications (admin only)
  async getApplications(status?: ApplicationStatus) {
    const params = status ? { status } : {};
    const response = await api.get('/instructor/applications', { params });
    return response.data;
  },

  // Review application (admin only)
  async reviewApplication(
    id: string,
    status: ApplicationStatus,
    rejectionReason?: string
  ) {
    const response = await api.patch(`/instructor/applications/${id}`, {
      status,
      rejectionReason,
    });
    return response.data;
  },
};
```

---

## React Hooks

### useAuth Hook

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

export function useAuth() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated()
  );

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const signup = async (email: string, password: string, name: string) => {
    const data = await authService.signup({ email, password, name });
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    hasRole: (role: string) => user?.role === role,
  };
}
```

---

## Protected Route Component

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'student';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

---

## Example Components

### Login Form

```typescript
// src/components/LoginForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Instructor Application Form

```typescript
// src/components/InstructorApplicationForm.tsx
import { useState } from 'react';
import { instructorService } from '@/services/instructorService';

export function InstructorApplicationForm() {
  const [formData, setFormData] = useState({
    bio: '',
    expertise: '',
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await instructorService.apply(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        <h3>Application Submitted!</h3>
        <p>Your application is under review. We'll notify you once it's processed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={formData.bio}
        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        placeholder="Tell us about yourself (min 50 characters)"
        minLength={50}
        required
      />
      <input
        type="text"
        value={formData.expertise}
        onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
        placeholder="Your areas of expertise"
        minLength={10}
        required
      />
      <textarea
        value={formData.experience}
        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
        placeholder="Your teaching/work experience (min 50 characters)"
        minLength={50}
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
```

### Admin Applications List

```typescript
// src/components/AdminApplicationsList.tsx
import { useState, useEffect } from 'react';
import { instructorService } from '@/services/instructorService';

export function AdminApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await instructorService.getApplications();
      setApplications(data.applications);
    } catch (error) {
      console.error('Failed to load applications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await instructorService.reviewApplication(id, status);
      loadApplications(); // Reload list
    } catch (error) {
      console.error('Failed to review application', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="applications-list">
      {applications.map((app: any) => (
        <div key={app.id} className="application-card">
          <h3>{app.user.name}</h3>
          <p>{app.user.email}</p>
          <p><strong>Bio:</strong> {app.bio}</p>
          <p><strong>Expertise:</strong> {app.expertise}</p>
          <p><strong>Experience:</strong> {app.experience}</p>
          <p><strong>Status:</strong> {app.status}</p>
          
          {app.status === 'PENDING' && (
            <div className="actions">
              <button onClick={() => handleReview(app.id, 'APPROVED')}>
                Approve
              </button>
              <button onClick={() => handleReview(app.id, 'REJECTED')}>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## TypeScript Types

```typescript
// src/types/index.ts
export type UserRole = 'admin' | 'teacher' | 'student';

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
```

---

## Error Handling

```typescript
// src/utils/errorHandler.ts
import { AxiosError } from 'axios';

export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    // Server responded with error
    if (error.response) {
      return error.response.data?.message || 'An error occurred';
    }
    // Network error
    if (error.request) {
      return 'Network error. Please check your connection.';
    }
  }
  return 'An unexpected error occurred';
}
```

---

## Usage in Routes

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/apply-instructor"
          element={
            <ProtectedRoute requiredRole="student">
              <InstructorApplicationPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminApplicationsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Quick Start Checklist

- [ ] Install axios: `npm install axios`
- [ ] Set up environment variables
- [ ] Create API client with interceptors
- [ ] Implement auth service
- [ ] Create useAuth hook
- [ ] Set up protected routes
- [ ] Build login/signup forms
- [ ] Implement role-based UI components
