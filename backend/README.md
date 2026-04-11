# ABA Pro Coach — Backend API

Node.js + Express backend with SQLite database and JWT authentication.

## Quick Start

```bash
cd backend
npm install
node server.js
```

Server runs at: **http://localhost:3001**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Check if server is running |
| POST | /api/auth/register | Create new account |
| POST | /api/auth/login | Log in |
| GET | /api/auth/me | Get current user (requires token) |

## Register — POST /api/auth/register
```json
{
  "name": "Kat Rivera",
  "email": "kat@example.com",
  "password": "mypassword123",
  "role": "Behavior Technician",
  "org": "Tealway ABA"
}
```

## Login — POST /api/auth/login
```json
{
  "email": "kat@example.com",
  "password": "mypassword123"
}
```

Both return a `token` and `user` object. The token goes in the `Authorization` header for protected routes:
```
Authorization: Bearer <token>
```

## Files
- `server.js` — Express app entry point
- `db.js` — SQLite database setup (creates `aba_coach.db` automatically)
- `routes/auth.js` — Register, login, and /me routes
- `middleware/auth.js` — JWT verification middleware

## Before Going Live
1. Change `JWT_SECRET` in `middleware/auth.js` to a long random string
2. Update `API_URL` in `aba-toolkit.html` to your deployed backend URL
3. Update `cors origin` in `server.js` to your frontend's domain
