# 📚 API Documentation - User Management System

Complete API reference for the User Management System backend, including authentication, user management, admin operations, and activity tracking.

## 🌐 Base URL & Authentication

### Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### CSRF Protection

For state-changing operations, include CSRF token:

```http
X-CSRF-Token: <csrf-token>
```

Get CSRF token from `/api/auth/csrf-token` endpoint.

## 📄 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {
      // Additional error details
    }
  }
}
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## ❌ Error Handling

### HTTP Status Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 422  | Validation Error      |
| 429  | Too Many Requests     |
| 500  | Internal Server Error |

### Common Error Codes

| Code                   | Description               |
| ---------------------- | ------------------------- |
| `VALIDATION_ERROR`     | Input validation failed   |
| `UNAUTHORIZED`         | Authentication required   |
| `FORBIDDEN`            | Insufficient permissions  |
| `USER_NOT_FOUND`       | User does not exist       |
| `EMAIL_ALREADY_EXISTS` | Email already registered  |
| `INVALID_CREDENTIALS`  | Login credentials invalid |
| `TOKEN_EXPIRED`        | JWT token expired         |
| `RATE_LIMIT_EXCEEDED`  | Too many requests         |

## 🔐 Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CLIENT",
      "status": "ACTIVE",
      "emailVerified": false
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  },
  "message": "User registered successfully"
}
```

**Validation Rules:**

- `name`: Required, 2-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, min 8 characters, must contain uppercase, lowercase, number, special character
- `phone`: Optional, valid phone format

---

### Login User

**POST** `/api/auth/login`

Authenticate user and receive JWT tokens.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CLIENT",
      "status": "ACTIVE",
      "emailVerified": true,
      "profilePicture": "https://cloudinary.com/image.jpg"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  },
  "message": "Login successful"
}
```

---

### Refresh Token

**POST** `/api/auth/refresh`

Refresh expired access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

---

### Get Current User

**GET** `/api/auth/me`

Get current authenticated user information.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "CLIENT",
      "status": "ACTIVE",
      "emailVerified": true,
      "profilePicture": "https://cloudinary.com/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Logout User

**POST** `/api/auth/logout`

Logout user and invalidate tokens.

**Headers:**

```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Verify Email

**POST** `/api/auth/verify-email`

Verify user email address using verification token.

**Request Body:**

```json
{
  "token": "email_verification_token"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### Forgot Password

**POST** `/api/auth/forgot-password`

Request password reset email.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### Reset Password

**POST** `/api/auth/reset-password`

Reset password using reset token.

**Request Body:**

```json
{
  "token": "password_reset_token",
  "password": "NewSecurePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### Get CSRF Token

**GET** `/api/auth/csrf-token`

Get CSRF token for state-changing operations.

**Response:**

```json
{
  "success": true,
  "data": {
    "csrfToken": "csrf_token_string"
  }
}
```

## 👤 User Management

### Get User Profile

**GET** `/api/users/profile`

Get current user's profile information.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "CLIENT",
      "status": "ACTIVE",
      "emailVerified": true,
      "profilePicture": "https://cloudinary.com/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Update User Profile

**PUT** `/api/users/profile`

Update current user's profile information.

**Headers:**

```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Request Body:**

```json
{
  "name": "John Smith",
  "phone": "+1234567891"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "+1234567891",
      "role": "CLIENT",
      "status": "ACTIVE",
      "emailVerified": true,
      "profilePicture": "https://cloudinary.com/image.jpg",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Profile updated successfully"
}
```

---

### Change Password

**PUT** `/api/users/change-password`

Change current user's password.

**Headers:**

```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Request Body:**

```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Upload Profile Picture

**POST** `/api/users/profile-picture`

Upload or update user's profile picture.

**Headers:**

```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "profilePicture": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/profile_pictures/user_id.jpg"
  },
  "message": "Profile picture updated successfully"
}
```

**Notes:**

- Accepts base64 encoded images
- Supported formats: JPEG, PNG, GIF, WebP
- Maximum file size: 5MB
- Images are automatically optimized and resized

## 👑 Admin Operations

### Get All Users

**GET** `/api/admin/users`

Get paginated list of all users with filtering options.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in name and email
- `role` (string): Filter by role (ADMIN, DEVELOPER, MODERATOR, CLIENT)
- `status` (string): Filter by status (ACTIVE, INACTIVE, SUSPENDED)
- `sortBy` (string): Sort field (name, email, createdAt, updatedAt)
- `sortOrder` (string): Sort order (asc, desc)

**Example Request:**

```
GET /api/admin/users?page=1&limit=20&search=john&role=CLIENT&status=ACTIVE&sortBy=createdAt&sortOrder=desc
```

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "role": "CLIENT",
        "status": "ACTIVE",
        "emailVerified": true,
        "profilePicture": "https://cloudinary.com/image.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Required Role:** ADMIN

---

### Get User by ID

**GET** `/api/admin/users/:id`

Get specific user by ID.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "CLIENT",
      "status": "ACTIVE",
      "emailVerified": true,
      "profilePicture": "https://cloudinary.com/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "activityLogs": [
        {
          "id": "log_id",
          "activity": "LOGIN",
          "details": "User logged in",
          "ipAddress": "192.168.1.1",
          "userAgent": "Mozilla/5.0...",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  }
}
```

**Required Role:** ADMIN

---

### Update User

**PUT** `/api/admin/users/:id`

Update user information (admin only).

**Headers:**

```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Request Body:**

```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "phone": "+1234567891",
  "role": "DEVELOPER",
  "status": "ACTIVE"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Smith",
      "email": "johnsmith@example.com",
      "phone": "+1234567891",
      "role": "DEVELOPER",
      "status": "ACTIVE",
      "emailVerified": true,
      "profilePicture": "https://cloudinary.com/image.jpg",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "User updated successfully"
}
```

**Required Role:** ADMIN

**Notes:**

- Cannot update own role or status
- Email changes require re-verification

---

### Delete User

**DELETE** `/api/admin/users/:id`

Delete user account (admin only).

**Headers:**

```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
```

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Required Role:** ADMIN

**Notes:**

- Cannot delete own account
- Cannot delete other admin users
- Soft delete - user data is archived

---

### Get Dashboard Statistics

**GET** `/api/admin/dashboard`

Get dashboard statistics and metrics.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 1250,
      "activeUsers": 1100,
      "newUsersToday": 15,
      "newUsersThisWeek": 89,
      "usersByRole": {
        "ADMIN": 5,
        "DEVELOPER": 25,
        "MODERATOR": 20,
        "CLIENT": 1200
      },
      "usersByStatus": {
        "ACTIVE": 1100,
        "INACTIVE": 100,
        "SUSPENDED": 50
      },
      "recentActivity": [
        {
          "id": "activity_id",
          "userId": "user_id",
          "userName": "John Doe",
          "activity": "LOGIN",
          "details": "User logged in",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  }
}
```

**Required Role:** ADMIN

## 📊 Activity Tracking

### Get My Activity

**GET** `/api/activity/my-activity`

Get current user's activity logs.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in activity and details
- `activityType` (string): Filter by activity type
- `startDate` (string): Filter from date (ISO format)
- `endDate` (string): Filter to date (ISO format)

**Response:**

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity_id",
        "activity": "LOGIN",
        "details": "User logged in from Chrome browser",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### Get Activity Logs (Admin/Moderator)

**GET** `/api/activity/logs`

Get system-wide activity logs.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `userId` (string): Filter by user ID
- `search` (string): Search in activity and details
- `activityType` (string): Filter by activity type
- `startDate` (string): Filter from date (ISO format)
- `endDate` (string): Filter to date (ISO format)

**Response:**

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity_id",
        "userId": "user_id",
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "activity": "LOGIN",
        "details": "User logged in from Chrome browser",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 500,
      "totalPages": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Required Role:** ADMIN, DEVELOPER, MODERATOR

---

### Get Activity Statistics

**GET** `/api/activity/stats`

Get activity statistics and metrics.

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `period` (string): Time period (today, week, month, year)
- `userId` (string): Filter by user ID (optional)

**Response:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalActivities": 10000,
      "activitiesToday": 150,
      "activitiesThisWeek": 1200,
      "activitiesThisMonth": 5000,
      "topActivities": [
        {
          "activity": "LOGIN",
          "count": 3000
        },
        {
          "activity": "PROFILE_UPDATE",
          "count": 1500
        }
      ],
      "activityTrend": [
        {
          "date": "2024-01-01",
          "count": 120
        }
      ]
    }
  }
}
```

**Required Role:** ADMIN, DEVELOPER, MODERATOR

## 📁 File Upload

### Upload Profile Picture

**POST** `/api/users/profile-picture`

Upload user profile picture to Cloudinary.

**Headers:**

```http
Authorization: Bearer <access_token>
X-CSRF-Token: <csrf_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "profilePicture": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/profile_pictures/user_id.jpg",
    "publicId": "profile_pictures/user_id"
  },
  "message": "Profile picture updated successfully"
}
```

**File Requirements:**

- **Format:** JPEG, PNG, GIF, WebP
- **Size:** Maximum 5MB
- **Encoding:** Base64 data URL format
- **Processing:** Automatic optimization and resizing to 400x400px

## 🚦 Rate Limiting

### Global Rate Limits

| Endpoint Pattern            | Limit        | Window     |
| --------------------------- | ------------ | ---------- |
| `/api/auth/login`           | 5 requests   | 15 minutes |
| `/api/auth/register`        | 3 requests   | 15 minutes |
| `/api/auth/forgot-password` | 3 requests   | 15 minutes |
| `/api/auth/reset-password`  | 5 requests   | 15 minutes |
| `/api/*` (general)          | 100 requests | 15 minutes |

### Per-User Rate Limits

| User Role | Requests | Window     |
| --------- | -------- | ---------- |
| CLIENT    | 100      | 15 minutes |
| DEVELOPER | 200      | 15 minutes |
| MODERATOR | 300      | 15 minutes |
| ADMIN     | 500      | 15 minutes |

### Rate Limit Headers

When rate limited, responses include:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200
Retry-After: 900
```

## 📝 Examples

### Complete Authentication Flow

```javascript
// 1. Register new user
const registerResponse = await fetch("/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    password: "SecurePassword123!",
    phone: "+1234567890",
  }),
});

const { data: registerData } = await registerResponse.json();
const { accessToken, refreshToken } = registerData.tokens;

// 2. Get CSRF token
const csrfResponse = await fetch("/api/auth/csrf-token");
const { data: csrfData } = await csrfResponse.json();
const csrfToken = csrfData.csrfToken;

// 3. Update profile
const updateResponse = await fetch("/api/users/profile", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "X-CSRF-Token": csrfToken,
  },
  body: JSON.stringify({
    name: "John Smith",
    phone: "+1234567891",
  }),
});

// 4. Upload profile picture
const uploadResponse = await fetch("/api/users/profile-picture", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "X-CSRF-Token": csrfToken,
  },
  body: JSON.stringify({
    image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  }),
});

// 5. Get user activity
const activityResponse = await fetch(
  "/api/activity/my-activity?page=1&limit=10",
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);
```

### Admin User Management

```javascript
// Get all users with filtering
const usersResponse = await fetch(
  "/api/admin/users?search=john&role=CLIENT&status=ACTIVE&page=1&limit=20",
  {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  }
);

// Update user role
const updateUserResponse = await fetch("/api/admin/users/user_id", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
    "X-CSRF-Token": csrfToken,
  },
  body: JSON.stringify({
    role: "DEVELOPER",
    status: "ACTIVE",
  }),
});

// Get dashboard statistics
const dashboardResponse = await fetch("/api/admin/dashboard", {
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
});
```

### Error Handling

```javascript
try {
  const response = await fetch("/api/users/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-CSRF-Token": csrfToken,
    },
    body: JSON.stringify({
      name: "John Smith",
    }),
  });

  const result = await response.json();

  if (!result.success) {
    // Handle API error
    console.error("API Error:", result.error.message);

    if (result.error.code === "VALIDATION_ERROR") {
      // Handle validation errors
      console.error("Validation details:", result.error.details);
    }
  } else {
    // Handle success
    console.log("Profile updated:", result.data.user);
  }
} catch (error) {
  // Handle network or parsing errors
  console.error("Network error:", error.message);
}
```

### Token Refresh

```javascript
async function refreshToken(refreshToken) {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Update stored tokens
      localStorage.setItem("accessToken", result.data.accessToken);
      localStorage.setItem("refreshToken", result.data.refreshToken);
      return result.data.accessToken;
    } else {
      // Refresh failed, redirect to login
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
    window.location.href = "/login";
  }
}

// Automatic token refresh interceptor
async function apiCall(url, options = {}) {
  let accessToken = localStorage.getItem("accessToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    const refreshTokenValue = localStorage.getItem("refreshToken");
    if (refreshTokenValue) {
      accessToken = await refreshToken(refreshTokenValue);

      // Retry original request with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  }

  return response;
}
```

---
