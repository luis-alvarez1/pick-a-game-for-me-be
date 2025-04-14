# Pick a Game for Me

A NestJS application to manage and search through your game collection.

## Features

- Create, read, update, and delete games
- Search games by name, completion status, and platform
- Platform management
- User authentication and authorization

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

### Games

#### Search Games

```http
GET /games/search
```

Query Parameters:

- `name` (optional): Search games by name (case-insensitive, partial match)
- `completed` (optional): Filter by completion status (true/false)
- `platformId` (optional): Filter by platform ID

Example:

```http
GET /games/search?name=mario&completed=true&platformId=1
```

#### Create Game

```http
POST /games
```

Body:

```json
{
  "name": "Game Name",
  "platformId": 1,
  "completed": false
}
```

#### Get All Games

```http
GET /games
```

#### Get Game by ID

```http
GET /games/:id
```

#### Update Game

```http
PATCH /games/:id
```

Body:

```json
{
  "name": "Updated Name",
  "platformId": 2,
  "completed": true
}
```

#### Delete Game

```http
DELETE /games/:id
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer your_jwt_token
```

## Development

- Run tests: `npm run test`
- Run tests with coverage: `npm run test:cov`
- Lint: `npm run lint`
- Format code: `npm run format`

## License

This project is licensed under the Apache 2.0 License.
