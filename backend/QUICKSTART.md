# Devio Backend - Quick Start Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenAI API Key

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd devio-backend
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/devio
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-your-openai-api-key
CORS_ORIGIN=http://localhost:5173
```

### 3. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or on macOS with Homebrew
brew services start mongodb-community
```

**Option B: MongoDB Atlas**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get connection string and update `MONGODB_URI`

### 4. Seed Database (Optional)

```bash
node src/utils/seed.js
```

This creates sample questions and an admin user.

### 5. Start the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Server will start on `http://localhost:5000`

## Testing the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Questions (Public)
```bash
curl "http://localhost:5000/api/questions?category=college&limit=5"
```

### Generate AI Questions (Protected)
```bash
curl -X POST http://localhost:5000/api/questions/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "subject": "Data Structures",
    "topic": "Binary Trees",
    "difficulty": "medium",
    "count": 3,
    "category": "college"
  }'
```

### Chat with AI Interview Assistant
```bash
curl -X POST http://localhost:5000/api/interview/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Give me React interview questions"
  }'
```

## API Endpoints Summary

| Category | Base Path | Endpoints |
|----------|-----------|-----------|
| Auth | `/api/auth` | register, login, google, me, update-profile, change-password, logout |
| Users | `/api/users` | profile, dashboard, stats, saved-questions |
| Questions | `/api/questions` | CRUD, generate, submit-answer, explain |
| Tests | `/api/tests` | CRUD, start, submit-answer, complete, history |
| Interview | `/api/interview` | start, chat, generate-questions, evaluate, complete |
| College | `/api/college` | subjects, mcq, qa, progress, recommendations |

## Project Structure

```
devio-backend/
├── src/
│   ├── config/           # Database config
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth, error handling
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # AI service, seed data
│   └── server.js         # Entry point
├── .env                  # Environment variables
├── .env.example          # Example env file
├── package.json
└── README.md
```

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB service or check connection string

### OpenAI API Error
```
Error: Failed to generate interview questions
```
**Solution:** Check your `OPENAI_API_KEY` is valid and has credits

### CORS Error in Frontend
```
Access-Control-Allow-Origin header missing
```
**Solution:** Update `CORS_ORIGIN` in `.env` to match your frontend URL

## Default Credentials (After Seeding)

- **Admin:** admin@devio.com / admin123

## Next Steps

1. Connect your frontend to the API
2. Update CORS_ORIGIN to match your frontend URL
3. Add more questions using the generate endpoint
4. Create custom tests for your users
5. Monitor API usage and add rate limits as needed

## Support

For issues or questions, please refer to the main README.md file.
