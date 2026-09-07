# NovaCart

NovaCart is a modern full-stack e-commerce web application with product discovery, semantic-style search, authentication, shopping cart functionality, and order management.

## Features

- Responsive storefront
- Product catalogue
- Natural-language style product search
- Category filtering
- Price and rating sorting
- Product detail modal
- Shopping cart with LocalStorage
- User registration
- User login
- Password hashing
- JWT authentication
- Protected order endpoints
- Order placement
- User order retrieval
- REST API
- Health-check endpoint
- Local product assets

## Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- LocalStorage

### Backend

- Node.js
- Express.js
- bcryptjs
- JSON Web Tokens (JWT)
- CORS
- dotenv

## Project Structure

```text
NovaCart/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── assets/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── PROJECT_MAP.md
└── README.md
```

## Requirements

- Node.js
- npm
- Modern web browser
- VS Code recommended

Check your installation:

```bash
node --version
npm --version
```

## Run Locally

### 1. Open the project

```bash
cd NovaCart
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

### 3. Start the frontend

Open `frontend/index.html` with VS Code Live Server or another local web server.

The frontend expects the API at:

```text
http://localhost:5000/api
```

## API

Base URL:

```text
http://localhost:5000/api
```

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/health` | API health check | No |
| GET | `/products` | Product catalogue | No |
| GET | `/products/:id` | Product details | No |
| POST | `/auth/register` | Create account | No |
| POST | `/auth/login` | Sign in | No |
| GET | `/me` | Current user | Yes |
| POST | `/orders` | Place an order | Yes |
| GET | `/orders` | Current user's orders | Yes |

### Product Search

Products can be searched through:

```text
GET /api/products?q=comfortable walking shoes
```

The backend calculates a lightweight relevance score using product text and related search terms.

### Health Check

Open:

```text
http://localhost:5000/api/health
```

Example response:

```json
{
  "status": "ok",
  "service": "novacart-api"
}
```

## Environment Variables

Copy:

```text
backend/.env.example
```

to:

```text
backend/.env
```

Example:

```env
PORT=5000
JWT_SECRET=replace-with-a-long-random-secret
```

Do not commit secrets to Git.

## Data Storage

The current server stores users and orders in memory. Restarting the backend clears registered users and order records.

Product data is currently defined in the backend source.

## Git

```bash
git add .
git commit -m "Update NovaCart"
git push
```

## Author

**Kabirshree Nath**
