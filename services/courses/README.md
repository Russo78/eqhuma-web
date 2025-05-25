# EQHuma Courses Microservice

This microservice manages the asynchronous courses feature for the EQHuma platform, allowing instructors to create and publish courses and students to enroll and access course content.

## Features

- **Course Management**: Create, update, and delete courses with lessons, resources, and quizzes
- **User Authentication**: Register, login, and manage user profiles
- **Enrollment System**: Manage course enrollments with progress tracking
- **Payment Integration**: Process course payments using Stripe
- **Event Calendar**: Schedule and manage webinars and other course-related events
- **Content Organization**: Manage lessons, resources, and course materials

## Tech Stack

- **Node.js & Express**: Backend framework
- **MongoDB**: Database (via Mongoose ORM)
- **JWT**: Authentication
- **Stripe**: Payment processing
- **Multer**: File uploads

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- Stripe account (for payment processing)

### Installation

1. Clone the repository:
   ```
   git clone [repository-url]
   cd eqhuma-courses-service
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your specific configuration values.

5. Start the development server:
   ```
   npm run dev
   ```

## API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Log in a user
- `GET /api/v1/auth/me` - Get current user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/password` - Update password
- `POST /api/v1/auth/upload-profile-image` - Upload profile image
- `POST /api/v1/auth/verify-token` - Verify JWT token
- `POST /api/v1/auth/sso` - Single Sign-On from main service

### Course Endpoints

- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/categories` - Get course categories
- `GET /api/v1/courses/featured` - Get featured courses
- `GET /api/v1/courses/:id` - Get a single course
- `POST /api/v1/courses` - Create a new course
- `PUT /api/v1/courses/:id` - Update a course
- `DELETE /api/v1/courses/:id` - Delete a course
- `POST /api/v1/courses/:id/upload-cover` - Upload course cover image
- `GET /api/v1/courses/my-courses` - Get courses created by current user
- `GET /api/v1/courses/my-enrollments` - Get courses user is enrolled in
- `GET /api/v1/courses/stats` - Get course statistics (admin only)
- `POST /api/v1/courses/:courseId/enroll` - Enroll in a course

### Lesson Endpoints

- `GET /api/v1/courses/:courseId/lessons` - Get all lessons for a course
- `POST /api/v1/courses/:courseId/lessons` - Create a new lesson
- `PUT /api/v1/courses/:courseId/lessons/reorder` - Reorder lessons
- `GET /api/v1/lessons/:id` - Get a single lesson
- `PUT /api/v1/lessons/:id` - Update a lesson
- `DELETE /api/v1/lessons/:id` - Delete a lesson
- `POST /api/v1/lessons/:id/upload` - Upload lesson resources
- `POST /api/v1/lessons/:id/progress` - Update lesson progress

### Enrollment Endpoints

- `GET /api/v1/enrollments` - Get all enrollments (admin only)
- `GET /api/v1/enrollments/stats` - Get enrollment statistics (admin only)
- `GET /api/v1/enrollments/my-enrollments` - Get user's enrollments
- `GET /api/v1/enrollments/:id` - Get a single enrollment
- `PUT /api/v1/enrollments/:id` - Update enrollment status
- `POST /api/v1/enrollments/:id/payment` - Create payment session
- `POST /api/v1/enrollments/webhook` - Handle payment webhook
- `POST /api/v1/enrollments/:id/certificate` - Issue certificate

### Calendar Endpoints

- `GET /api/v1/calendar/events` - Get all events
- `GET /api/v1/calendar/events/upcoming` - Get upcoming events
- `GET /api/v1/calendar/events/categories` - Get event categories
- `GET /api/v1/calendar/events/:id` - Get a single event
- `POST /api/v1/calendar/events` - Create a new event
- `PUT /api/v1/calendar/events/:id` - Update an event
- `DELETE /api/v1/calendar/events/:id` - Delete an event
- `POST /api/v1/calendar/events/:id/upload-image` - Upload event image
- `POST /api/v1/calendar/events/:id/register` - Register for an event
- `DELETE /api/v1/calendar/events/:id/register` - Cancel event registration
- `GET /api/v1/calendar/events/:id/attendees` - Get event attendees
- `PUT /api/v1/calendar/events/:id/attendees/:attendeeId` - Update attendee status
- `GET /api/v1/calendar/courses/:courseId/events` - Get events for a course
- `GET /api/v1/calendar/events/my-events` - Get events created by current user
- `GET /api/v1/calendar/events/my-registrations` - Get events user is registered for

## Integration with Main EQHuma Service

This microservice is designed to integrate with the main EQHuma platform. Users can be authenticated through SSO, and relevant data can be shared between services.

## License

Proprietary - All rights reserved.