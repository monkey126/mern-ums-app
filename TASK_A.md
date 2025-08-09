# **1\. Introduction**

## **1.1 Purpose**

The purpose of this SRS is to define the requirements for developing a **User Management System** for the website of **World IT Ltd.** The system will handle user registration, authentication, roles, and permission control in a scalable and secure manner.

## **1.2 Scope**

This system will be integrated into the main website of World IT Ltd. It will manage different user types such as **Admins**, **Clients**, **Developers**, and **Moderators**, each with specific access permissions and dashboard views.

## **1.3 Intended Audience**

- CTO of World IT Ltd.
- Development Team
- Website Developer Candidate
- QA Engineers
- UI/UX Designers

# **2\. System Overview**

## **2.1 System Features**

- User registration & login
- Email verification & password reset
- Role-based access control (RBAC)
- Admin dashboard
- Profile management
- User activity log
- Secure session & token handling

## 2.2 Technologies (Suggested Stack)

- **Frontend**: React + Tailwind CSS + Shadcn/ui
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, bcrypt, CSRF tokens
- **Validation**: Zod
- **Logger**: Pino
- **Orm**: Prisma

# **3\. Functional Requirements**

## **3.1 User Roles**

| Role      | Description                             |
| :-------- | :-------------------------------------- |
| Admin     | Full system access and user control     |
| Client    | Can register, login, and update profile |
| Developer | Internal users with project access      |
| Moderator | Manage client comments, feedback        |

## **3.2 Registration**

- Form with: Full Name, Email, Phone, Password, Confirm Password
- Validations: Email format, strong password, unique email
- After successful registration: send verification email

## **3.3 Login**

- Form with: Email, Password
- Validations: Active account, correct credentials
- On login success: redirect based on role

## **3.4 Password Reset**

- "Forgot Password" link
- Email-based reset token
- Form with: New Password, Confirm New Password

## **3.5 Profile Management**

- Users can view/edit their own profile
- Editable fields: Full Name, Phone, Password, Profile Picture

## **3.6 Admin Panel**

- View all users (filter by role/status)
- Edit user info
- Activate/Deactivate/Delete accounts
- Assign/change roles
- View login activity logs

## **3.7 RBAC (Role-Based Access Control)**

- Permissions mapped to roles
- Unauthorized users redirected or shown error

| Feature           | Admin | Client | Developer | Moderator |
| :---------------- | :---- | :----- | :-------- | :-------- |
| View dashboard    | YES   | YES    | YES       | YES       |
| Manage users      | YES   | NO     | NO        | NO        |
| Edit own profile  | YES   | YES    | YES       | YES       |
| View activity log | YES   | NO     | YES       | YES       |
| Change user roles | YES   | NO     | NO        | NO        |

# **4\. Non-Functional Requirements**

## **4.1 Security**

- Passwords hashed (e.g., bcrypt)
- Secure token handling (JWT or Session)
- CSRF & XSS protection

## **4.2 Usability**

- Clean and modern UI
- Mobile responsive
- Error messages with guidance

## **4.3 Performance**

- Fast load time
- Backend query optimization
- Asynchronous processes (email sending)

## **4.4 Maintainability**

- Code must follow MVC structure
- Modular and reusable components
- Proper documentation and comments

# **5\. Database Schema (Simplified Example) // you should change it based on your design**

### **Users Table**

| Field          | Type      | Description             |
| :------------- | :-------- | :---------------------- |
| id             | INT (PK)  | User ID                 |
| name           | VARCHAR   | Full name               |
| email          | VARCHAR   | Unique, indexed         |
| password       | VARCHAR   | Hashed                  |
| phone          | VARCHAR   | Optional                |
| role           | ENUM      | admin, client, dev, mod |
| status         | ENUM      | active, inactive        |
| email_verified | BOOLEAN   | Verification status     |
| created_at     | TIMESTAMP |                         |
| updated_at     | TIMESTAMP |                         |

### **Activity Logs Table**

| Field     | Type     | Description           |
| :-------- | :------- | :-------------------- |
| id        | INT (PK) |                       |
| user_id   | INT (FK) |                       |
| activity  | TEXT     | Description of action |
| timestamp | DATETIME | When it happened      |

# **6\. System Diagrams (Optional for Candidate)**

## **6.1 User Flow (Registration/Login)**

User → Registration → Email Verification → Login → Dashboard (based on role)

## **6.2 Admin Flow**

Admin Login → Admin Dashboard → Manage Users → View Activity Logs

# **7\. Test Cases (Sample)**

| Test Case                       | Expected Result                    |
| :------------------------------ | :--------------------------------- |
| Register with valid info        | Success \+ verification email sent |
| Login with invalid credentials  | Error message                      |
| Access Admin Panel as Client    | Access denied / redirect           |
| Reset password with valid token | Success \+ password updated        |
| Edit profile                    | Changes reflected immediately      |

# **8\. Deliverables (From Candidate)**

- Complete source code (GitHub link or ZIP file)
- Live demo link (if hosted)
- Readme file with setup instructions
- Screenshot of database schema (or dump file)
- Documented code (at least minimal comments)
