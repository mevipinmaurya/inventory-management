# StockPilot — Inventory & Order Management System

A full-stack portfolio project built with **Java 17, Spring Boot, Spring Data JPA, Spring Security, JWT, MySQL, React, Vite, and CSS**.

## Features
- Sign up and sign in with password hashing (BCrypt) and JWT authentication.
- Protected product, stock, order, and dashboard APIs.
- Add, edit, search, and deactivate products.
- Adjust inventory quantities; low-stock means 5 or fewer units.
- Create orders with server-calculated prices and automatic stock deduction.
- Complete or cancel an order. The backend restores stock when a placed order is cancelled (once only).
- Dashboard metrics and low-stock alerts.
- Responsive dashboard, product table, order table, and login/signup screens.

## Requirements
- Java 17+
- Maven 3.9+
- MySQL 8+
- Node.js 20+ and npm

## 1. Set up MySQL
Install and start MySQL. The app creates `inventory_db` automatically when the configured MySQL user has permission. In `backend/src/main/resources/application.properties`, set your password, or set the environment variable `DB_PASSWORD`.

Default development connection:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/inventory_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD:YOUR_MYSQL_PASSWORD}
```

Change `YOUR_MYSQL_PASSWORD` to your local MySQL password if you do not use the `DB_PASSWORD` environment variable. For real deployments, set a strong private `JWT_SECRET` and never commit credentials.

## 2. Start the Spring Boot backend
Open a terminal in the `backend` folder:
```bash
cd backend
mvn spring-boot:run
```
The API starts at `http://localhost:8080`. Hibernate creates/updates development tables automatically.

## 3. Start the React frontend
Open a second terminal in the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite (normally `http://localhost:5173`). Create an account on the sign-up screen, then sign in. The frontend stores the JWT in browser local storage and attaches it to API requests.

## Main API routes
All routes below except signup/login require `Authorization: Bearer <token>`.

### Authentication
- `POST /api/auth/signup` — `{ "name":"Asha Sharma", "email":"asha@example.com", "password":"password123" }`
- `POST /api/auth/login` — `{ "email":"asha@example.com", "password":"password123" }`

### Products and stock
- `GET /api/products` (optional `?name=mouse`)
- `GET /api/products/{id}`
- `POST /api/products` — `{ "name":"Mouse", "category":"Electronics", "price":599.00, "quantity":20 }`
- `PUT /api/products/{id}` — same product body
- `DELETE /api/products/{id}` — deactivates the product
- `PATCH /api/products/{id}/stock` — `{ "change":5 }` (negative values reduce stock)
- `GET /api/products/low-stock`

### Orders and dashboard
- `POST /api/orders` — `{ "customerName":"Asha", "items":[{"productId":1,"quantity":2}] }`
- `GET /api/orders`
- `GET /api/orders/{id}`
- `PATCH /api/orders/{id}/status` — `{ "status":"COMPLETED" }` or `{ "status":"CANCELLED" }`
- `GET /api/dashboard/summary`

## Important notes
- The order service calculates totals using database product prices; it does not trust prices supplied by the browser.
- Creating an order and changing stock are handled in the backend transaction.
- Signup creates a normal `USER` role. This starter project does not implement role-based permissions or password reset/email verification.
- `ddl-auto=update` and the fallback JWT secret are for local development only. For production, use migrations, environment secrets, HTTPS, stricter CORS, rate limiting, and a reviewed authorization model.
- The code is provided as a starter project; run the build and test locally with your Java/Maven/MySQL/Node setup before deployment.
