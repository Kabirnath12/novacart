# NovaCart Project Map

## Frontend

`index.html`
- Defines the storefront layout.
- Contains navigation, search, categories, product grid, account UI, product modal, and cart drawer.

`style.css`
- Handles layout, responsive behavior, cards, modals, cart drawer, forms, and mobile navigation.

`script.js`
- Loads products from the API.
- Provides local fallback products.
- Implements search, category filtering, sorting, product details, cart state, authentication requests, and order creation.

## Backend

`server.js`
- Starts the Express API.
- Provides product endpoints.
- Provides registration/login using bcrypt and JWT.
- Protects authenticated endpoints.
- Creates and lists user orders.
- Includes a lightweight semantic relevance scorer for search.

`package.json`
- Defines backend dependencies and start commands.

`.env.example`
- Documents environment variables used by the backend.

## Current Request Flow

Search:
Browser → `GET /api/products?q=...` → relevance scoring → products

Registration:
Browser → `POST /api/auth/register` → password hash → JWT → browser

Login:
Browser → `POST /api/auth/login` → password verification → JWT → browser

Order:
Browser → JWT → `POST /api/orders` → order validation → order record
