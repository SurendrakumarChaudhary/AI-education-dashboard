# Devio Backend API

A comprehensive backend API for the Devio AI-powered educational platform built with Express.js, Node.js, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Profile management, progress tracking, saved questions
- **Question Bank**: MCQ and Q&A questions for college and placement prep
- **AI Integration**: OpenAI GPT-3.5 for generating interview questions and explanations
- **Mock Tests**: Test creation, attempt tracking, and scoring
- **Interview Prep**: AI-powered interview sessions with chat functionality

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Service**: OpenAI API
- **Security**: Helmet, CORS, Rate Limiting

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd devio-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# - Set MongoDB URI
# - Set JWT Secret
# - Set OpenAI API Key

# Start development server
npm run dev

# Or start production server
npm start
```

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/devio

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# CORS
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/google` | Google OAuth | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/update-profile` | Update profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |
| POST | `/api/auth/logout` | Logout | Private |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users/profile` | Get user profile | Private |
| PUT | `/api/users/profile` | Update profile | Private |
| GET | `/api/users/dashboard` | Get dashboard data | Private |
| GET | `/api/users/stats` | Get user statistics | Private |
| GET | `/api/users/saved-questions` | Get saved questions | Private |
| POST | `/api/users/save-question/:id` | Save a question | Private |
| DELETE | `/api/users/save-question/:id` | Remove saved question | Private |

### Questions
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/questions` | Get all questions | Public |
| GET | `/api/questions/:id` | Get single question | Public |
| GET | `/api/questions/subjects` | Get all subjects | Public |
| GET | `/api/questions/tags` | Get all tags | Public |
| GET | `/api/questions/subject/:subject` | Get by subject | Public |
| POST | `/api/questions/:id/answer` | Submit answer | Private |
| POST | `/api/questions/:id/explain` | Get explanation | Private |
| POST | `/api/questions/generate` | Generate AI questions | Private |
| POST | `/api/questions` | Create question | Admin |
| PUT | `/api/questions/:id` | Update question | Admin |
| DELETE | `/api/questions/:id` | Delete question | Admin |

### Tests
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tests` | Get all tests | Public |
| GET | `/api/tests/:id` | Get single test | Public |
| POST | `/api/tests/:id/start` | Start test | Private |
| POST | `/api/tests/:id/answer` | Submit answer | Private |
| POST | `/api/tests/:id/complete` | Complete test | Private |
| GET | `/api/tests/history/me` | Get test history | Private |
| GET | `/api/tests/results/:id` | Get test result | Private |
| GET | `/api/tests/stats/me` | Get test stats | Private |
| POST | `/api/tests` | Create test | Admin |
| PUT | `/api/tests/:id` | Update test | Admin |
| DELETE | `/api/tests/:id` | Delete test | Admin |

### Interview Prep
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/interview/start` | Start session | Private |
| GET | `/api/interview/session` | Get active session | Private |
| GET | `/api/interview/session/:id` | Get session details | Private |
| POST | `/api/interview/chat` | Chat with AI | Private |
| POST | `/api/interview/generate-questions` | Generate questions | Private |
| POST | `/api/interview/get-answer` | Get answer | Private |
| POST | `/api/interview/evaluate` | Evaluate answer | Private |
| POST | `/api/interview/complete` | Complete session | Private |
| POST | `/api/interview/abandon` | Abandon session | Private |
| GET | `/api/interview/history` | Get session history | Private |

### College Prep
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/college/subjects` | Get subjects | Public |
| GET | `/api/college/mcq/:subject` | Get MCQs | Public |
| GET | `/api/college/qa/:subject` | Get Q&A | Public |
| POST | `/api/college/mcq/:id/check` | Check answer | Private |
| POST | `/api/college/generate` | Generate questions | Private |
| GET | `/api/college/progress` | Get progress | Private |
| GET | `/api/college/recommendations` | Get recommendations | Private |

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "progress": {
        "totalQuestionsAnswered": 0,
        "correctAnswers": 0,
        "testsCompleted": 0,
        "interviewsCompleted": 0
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Generate AI Questions
```bash
POST /api/questions/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Data Structures",
  "topic": "Binary Trees",
  "difficulty": "medium",
  "count": 5,
  "category": "college"
}
```

### Chat with AI Interview Assistant
```bash
POST /api/interview/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Give me React interview questions"
}
```

## Database Models

### User
- Authentication info (name, email, password)
- Progress tracking
- Preferences
- Saved questions
- Subscription info

### Question
- Type (MCQ, Q&A)
- Category (college, placement)
- Subject and tags
- Difficulty level
- Options and correct answer
- Explanation
- AI-generated metadata

### Test
- Title and description
- Questions array
- Settings (duration, passing score)
- Statistics

### TestResult
- User reference
- Test reference
- Answers given
- Score and time spent
- Status

### InterviewSession
- User reference
- Role and experience level
- Messages history
- Generated questions
- Metrics

## AI Integration

The backend integrates with OpenAI's GPT-3.5 API for:

1. **Generating Interview Questions**: Role-specific technical and behavioral questions
2. **Providing Explanations**: Detailed answers with code examples
3. **Chat Interface**: Interactive interview preparation
4. **Answer Evaluation**: Feedback on user's responses

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Run tests
npm test
```

## Deployment

1. Set up MongoDB database
2. Configure environment variables
3. Install dependencies: `npm install --production`
4. Start server: `npm start`

## License

MIT
