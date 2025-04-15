# Pick a Game for Me

A NestJS application to manage and search through your game collection.

## Features

- Create, read, update, and delete games
- Search games by name, completion status, and platform
- Platform management with associated games
- User authentication and authorization
- All game responses include platform information
- All platform responses include associated games

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/pick-a-game-for-me.git
cd pick-a-game-for-me
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PW=your_password
DB_NAME=your_database_name

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Server Configuration
PORT=3000
```

4. Run the database migrations:

```bash
npm run migration:run
```

5. Start the development server:

```bash
npm run start:dev
```

## API Documentation

### Authentication

#### Login

```http
POST /auth/login
```

Body:

```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

Response:

```json
{
  "token": "your_jwt_token"
}
```

### Users

#### Sign Up

```http
POST /users/signup
```

Body:

```json
{
  "email": "user@example.com",
  "password": "your_password",
  "name": "User Name"
}
```

Response:

```json
{
  "id": "uuid",
  "name": "User Name",
  "email": "user@example.com",
  "isActive": true,
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": 1704067200000
}
```

#### Get Current User

```http
GET /users/me
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Response:

```json
{
  "id": "uuid",
  "name": "User Name",
  "email": "user@example.com",
  "isActive": true,
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": 1704067200000
}
```

#### Get User by ID

```http
GET /users/:id
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Response:

```json
{
  "id": "uuid",
  "name": "User Name",
  "email": "user@example.com",
  "isActive": true,
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": 1704067200000
}
```

#### Update User

```http
PATCH /users/:id
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Body:

```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

Response:

```json
{
  "id": "uuid",
  "name": "Updated Name",
  "email": "updated@example.com",
  "isActive": true,
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": 1704067200000
}
```

### Games

#### Create Game

```http
POST /games
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Body:

```json
{
  "name": "Game Name",
  "platformId": 1,
  "completed": false
}
```

Response:

```json
{
  "id": 1,
  "name": "Game Name",
  "completed": false,
  "isActive": true,
  "platform": {
    "id": 1,
    "name": "Platform Name"
  }
}
```

#### Get All Games

```http
GET /games
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Response:

```json
[
  {
    "id": 1,
    "name": "Game Name",
    "completed": false,
    "isActive": true,
    "platform": {
      "id": 1,
      "name": "Platform Name"
    }
  }
]
```

#### Get Game by ID

```http
GET /games/:id
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Response:

```json
{
  "id": 1,
  "name": "Game Name",
  "completed": false,
  "isActive": true,
  "platform": {
    "id": 1,
    "name": "Platform Name"
  }
}
```

#### Update Game

```http
PATCH /games/:id
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Body:

```json
{
  "name": "Updated Name",
  "platformId": 2,
  "completed": true
}
```

Response:

```json
{
  "id": 1,
  "name": "Updated Name",
  "completed": true,
  "isActive": true,
  "platform": {
    "id": 2,
    "name": "New Platform Name"
  }
}
```

#### Delete Game

```http
DELETE /games/:id
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Note: Requires Admin role

#### Search Games

```http
GET /games/search
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Query Parameters:

- `name` (optional): Search games by name (case-insensitive, partial match)
  - Example: `name=mario` will match "Super Mario Bros", "Mario Kart", etc.
- `completed` (optional): Filter by completion status
  - Accepts: `true` or `false` (as strings)
  - Example: `completed=true`
- `platformId` (optional): Filter by platform ID
  - Must be a valid number
  - Example: `platformId=1`

Example:

```http
GET /games/search?name=mario&completed=true&platformId=1
```

Response:

```json
[
  {
    "id": 1,
    "name": "Super Mario Bros",
    "completed": true,
    "isActive": true,
    "platform": {
      "id": 1,
      "name": "Nintendo Switch"
    }
  }
]
```

#### Pick Random Game

```http
GET /games/pick
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Response:

```json
{
  "id": 1,
  "name": "Random Game",
  "completed": false,
  "isActive": true,
  "platform": {
    "id": 1,
    "name": "Platform Name"
  }
}
```

### Platforms

#### Get All Platforms

```http
GET /platforms
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Response:

```json
[
  {
    "id": 1,
    "name": "Platform Name",
    "games": [
      {
        "id": 1,
        "name": "Game Name",
        "completed": false,
        "isActive": true
      }
    ]
  }
]
```

#### Create Platform

```http
POST /platforms
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Body:

```json
{
  "name": "Platform Name"
}
```

Response:

```json
{
  "id": 1,
  "name": "Platform Name",
  "games": []
}
```

Note: Requires Admin role

#### Get Platform by ID

```http
GET /platforms/:id
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Response:

```json
{
  "id": 1,
  "name": "Platform Name",
  "games": [
    {
      "id": 1,
      "name": "Game Name",
      "completed": false,
      "isActive": true
    }
  ]
}
```

#### Update Platform

```http
PATCH /platforms/:id
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Body:

```json
{
  "name": "Updated Platform Name"
}
```

Response:

```json
{
  "id": 1,
  "name": "Updated Platform Name",
  "games": [
    {
      "id": 1,
      "name": "Game Name",
      "completed": false,
      "isActive": true
    }
  ]
}
```

Note: Requires Admin role

#### Search Games

```http
GET /games/search
```

Headers:

```http
Authorization: Bearer your_jwt_token
```

Query Parameters:

- `name` (optional): Search games by name (case-insensitive, partial match)
  - Example: `name=mario` will match "Super Mario Bros", "Mario Kart", etc.
- `completed` (optional): Filter by completion status
  - Accepts: `true` or `false` (as strings)
  - Example: `completed=true`
- `platformId` (optional): Filter by platform ID
  - Must be a valid number
  - Example: `platformId=1`

Example:

```http
GET /games/search?name=mario&completed=true&platformId=1
```

Response:

```json
[
  {
    "id": 1,
    "name": "Super Mario Bros",
    "completed": true,
    "isActive": true,
    "platform": {
      "id": 1,
      "name": "Nintendo Switch"
    }
  }
]
```

## Authentication

All endpoints except `/auth/login` and `/users/signup` require authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer your_jwt_token
```

Some endpoints require specific roles:

- Admin role required for:
  - DELETE /games/:id
  - POST /platforms
  - PATCH /platforms/:id

## Development

- Run tests: `npm run test`
