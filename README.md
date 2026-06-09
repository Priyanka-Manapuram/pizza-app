# 🍕 PizzaApp - Full Stack Pizza Ordering System

A full-stack MERN application with custom pizza builder, Razorpay payments, admin inventory management, and real-time order tracking.

## Project Structure

```
pizza-app/
├── backend/          # Node.js + Express + MongoDB
└── frontend/         # React + Vite + Tailwind CSS
```

---

## 🚀 Quick Setup

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env    # Fill in your values
node seed.js            # Seeds DB + creates admin account
npm run dev
```

**Admin credentials (after seed):**
- Email: `admin@pizzaapp.com`
- Password: `Admin@123`

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env    # Add your Razorpay test key
npm run dev
```

App runs at: `http://localhost:5173`
API runs at: `https://pizza-app-backend-nz14.onrender.com`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Any long random string |
| `EMAIL_HOST/USER/PASS` | SMTP config (use Mailtrap for dev) |
| `ADMIN_EMAIL` | Email to receive stock alerts |
| `RAZORPAY_KEY_ID` | Razorpay test key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay test secret |
| `FRONTEND_URL` | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_RAZORPAY_KEY_ID` | Same Razorpay test key ID |

---

## 📧 Email Setup (Development)

Use **Mailtrap** (free) for catching emails in dev:
1. Sign up at https://mailtrap.io
2. Go to Email Testing → Inboxes → SMTP Settings
3. Copy host/port/user/pass to your `.env`

---

## 💳 Razorpay Test Mode

1. Sign up at https://razorpay.com
2. Go to Dashboard → Settings → API Keys → Generate Test Keys
3. Add keys to both `.env` files
4. In test mode, use card: `4111 1111 1111 1111`, any future date, any CVV

---

## 🗂️ Feature Tasks Checklist

- [x] Task 1: User & Admin registration, login, email verification, forgot/reset password
- [x] Task 2: Pizza varieties dashboard (user)
- [x] Task 3: Custom pizza builder (base → sauce → cheese → veggies)
- [x] Task 4: Meat selection (inventory seeded, extend BuildPizza step)
- [x] Task 5: Razorpay checkout integration (test mode)
- [x] Task 6: Admin inventory management (CRUD for all ingredient categories)
- [x] Task 7: Stock deduction after orders + admin dashboard stock view
- [x] Task 8: Email alert when stock goes below threshold (cron + per-order check)
- [x] Task 9: Admin order status management (received → kitchen → delivery)
- [x] Task 10: User sees live order status updates (polling every 30s)

---

## 🛣️ API Routes Reference

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/verify-email/:token`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`
- `GET  /api/auth/me`

### Inventory (Admin)
- `GET    /api/inventory`
- `GET    /api/inventory/category/:cat`
- `POST   /api/inventory`
- `PUT    /api/inventory/:id`
- `DELETE /api/inventory/:id`

### Orders
- `POST /api/orders` — place order
- `GET  /api/orders/my` — user's orders
- `GET  /api/orders` — all orders (admin)
- `PUT  /api/orders/:id/status` — update status (admin)

### Payment
- `POST /api/payment/create-order`
- `POST /api/payment/verify`

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
