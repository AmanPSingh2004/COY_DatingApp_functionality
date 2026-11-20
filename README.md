# Coy Dating App — Internship Assignment

A swipe-based dating app prototype built with React and Vite on the frontend and Node.js with Express on the backend.

## Features

- **Discover:** Browse one profile at a time.
- **Swipe:** Like or pass on profiles using buttons or drag gestures.
- **Profile history:** Previously swiped profiles are excluded from the feed.
- **Matching:** Simulates mutual likes using mock profile data.

## Tech Stack

- React
- Vite
- JavaScript
- Node.js
- Express
- REST APIs
- JSON file storage

## Project Setup

### Prerequisites

Install Node.js and npm.

### 1. Clone the repository

```bash
git clone https://github.com/AmanPSingh2004/COY_DatingApp_functionality.git
cd COY_DatingApp_functionality
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

### 4. Start the backend

Open a second terminal in the project folder and run:

```bash
node index.js
```

The backend runs at `http://localhost:5000`, and Vite displays the frontend URL in the terminal.

> If the frontend and backend use separate `package.json` files, install dependencies in each respective folder before starting them.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/feed` | Retrieve profiles not yet swiped on |
| POST | `/swipe` | Record a like or pass and check for a match |
| GET | `/matches` | Retrieve mutual matches |

### Swipe Request Example

```json
{
  "profileId": 1,
  "action": "like"
}
```

Valid actions are `like` and `pass`.

## Data Storage

Swipe history is stored in `swipes.json`. Mock profiles are provided in `profiles.json`.

Matching is simulated using mock profile data and is intended for this assignment, not production use.

## Scope and Limitations

- The prototype assumes a single current user.
- Authentication and real multi-user matching are not implemented.
- Data is stored in local JSON files rather than a production database.

## Author

Developed as part of a software engineering internship assignment.
