# magnetAndPosters 🧲

> A full-stack e-commerce application for custom photo magnets and posters — inspired by [littlereminder.in](https://www.littlereminder.in/)

---

## 🗂️ Project Structure

```
magnetAndPosters/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── cloudinary.js       # Cloudinary setup (lossless image storage)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js  # Razorpay integration + signature verify
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js             # JWT protect + adminOnly guard
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   ├── upload.js           # Customer image upload (no compression)
│   │   └── admin.js
│   ├── utils/
│   │   └── seedAdmin.js        # Auto-creates first admin on startup
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/                   # React + Vite + Tailwind CSS
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.jsx
    │   │   │   ├── Navbar.jsx     # Sticky, mobile responsive, cart counter
    │   │   │   ├── Footer.jsx     # Newsletter, links, social
    │   │   │   └── AdminLayout.jsx
    │   │   ├── cart/
    │   │   │   └── CartDrawer.jsx  # Slide-over cart with free shipping progress
    │   │   ├── product/
    │   │   │   └── ProductCard.jsx # Product tile with quick-add
    │   │   └── common/
    │   │       └── ProtectedRoute.jsx
    │   ├── context/
    │   │   ├── CartContext.jsx   # Persisted in localStorage
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx      # Hero, featured products, how it works
    │   │   ├── ShopPage.jsx      # Category filter, search, product grid
    │   │   ├── ProductPage.jsx   # Detail, size picker, photo upload, add to cart
    │   │   ├── CartPage.jsx      # Full cart with qty controls
    │   │   ├── CheckoutPage.jsx  # Address form + Razorpay payment
    │   │   ├── SuccessPage.jsx   # Order confirmation with details
    │   │   ├── LoginPage.jsx     # Auth + other page exports
    │   │   └── admin/
    │   │       ├── AdminLogin.jsx
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminProducts.jsx  # Full CRUD with image upload
    │   │       └── AdminOrders.jsx    # View orders, update status, download customer images
    │   ├── utils/
    │   │   ├── api.js            # Axios with JWT interceptor
    │   │   └── helpers.js        # Price formatting, shipping calc
    │   ├── App.jsx               # All routes
    │   ├── main.jsx
    │   └── index.css             # Tailwind + custom utilities
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier: 25GB storage)
- Razorpay account (free test account)

---

### 1️⃣ Clone & Install

```bash
# Clone the project
git clone <your-repo-url>
cd magnetAndPosters

# Install backend deps
cd backend
npm install

# Install frontend deps
cd ../frontend
npm install
```

---

### 2️⃣ Backend Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas — get from: https://cloud.mongodb.com
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/magnetandposters?retryWrites=true&w=majority

# JWT Secret — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_64_char_random_secret_here
JWT_EXPIRE=7d

# Cloudinary — get from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay — get from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# First admin account (auto-created on first run)
ADMIN_EMAIL=admin@magnetandposters.com
ADMIN_PASSWORD=Admin@123456
```

---

### 3️⃣ Frontend Environment Variables

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
VITE_WHATSAPP_NUMBER=919025926436
```

---

### 4️⃣ Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
# Admin user auto-seeded on first run ✅
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App starts on http://localhost:5173
```

---

## 💳 Razorpay Test Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy `Key ID` (starts with `rzp_test_`) and `Key Secret`
4. Add both to backend `.env` and Key ID to frontend `.env`

**Test credentials:**
| Method | Details |
|--------|---------|
| Card   | `4111 1111 1111 1111`, any future expiry, any CVV |
| UPI    | `success@razorpay` |
| NetBanking | Select any bank → Success |

---

## 🖼️ Image Quality — How It Works

This is the most critical feature. Here's how full image quality is preserved:

### Customer Uploads (for photo magnets)
```js
// In config/cloudinary.js
const customerImageStorage = new CloudinaryStorage({
  params: {
    folder: 'magnetandposters/customer-uploads',
    // NO transformation applied — original file stored as-is
  },
})
// Max 50MB upload allowed
```

### Storing Image References in Orders
Each order item stores **three** image fields:
```js
customImage: {
  publicId:    'magnetandposters/customer-uploads/abc123',  // for API access
  url:         'https://res.cloudinary.com/...',             // display URL
  originalUrl: 'https://res.cloudinary.com/.../q_100/...',  // FULL RES for printing
  fileName:    'my-photo.jpg',
}
```

### Admin Access to Full-Resolution Images
In `AdminOrders.jsx`, each customer photo shows a **"Download Original (Full Res)"** link pointing to `originalUrl` — the uncompressed Cloudinary image.

---

## 🔐 Admin Panel

Access: `http://localhost:5173/admin`

**Default credentials** (set in `.env`):
- Email: `admin@magnetandposters.com`
- Password: `Admin@123456`

**Features:**
- Dashboard with revenue, order, product stats
- Product management: Add/Edit/Delete with image upload
- Order management: Filter by status, update tracking, view customer photos with full-res download

---

## 📦 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |
| GET  | `/api/products` | List products (with filters) |
| GET  | `/api/products/:slug` | Single product |
| POST | `/api/orders` | Place order |
| GET  | `/api/orders/:id` | Get order |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment signature |
| POST | `/api/upload/customer-image` | Upload customer photo |

### Authenticated
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/my` | User's orders |

### Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/admin/dashboard` | Stats + recent orders |
| GET  | `/api/admin/orders` | All orders |
| PUT  | `/api/admin/orders/:id/status` | Update order status |
| GET  | `/api/admin/users` | All users |
| POST | `/api/products` | Create product |
| PUT  | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

---

## 🛒 Order Flow

```
User selects product
       ↓
Uploads custom photo (if photo magnet)
→ Photo uploaded to Cloudinary (NO compression)
→ Returns { publicId, url, originalUrl }
       ↓
Add to cart (cart persisted in localStorage)
       ↓
Checkout — enter shipping address
       ↓
POST /api/orders → creates order in MongoDB (status: 'placed')
       ↓
POST /api/payments/create-order → creates Razorpay order
       ↓
Razorpay checkout opens in browser
       ↓
User pays → Razorpay calls handler with payment IDs
       ↓
POST /api/payments/verify → HMAC SHA-256 signature check
→ On success: order updated to paymentStatus: 'paid', orderStatus: 'confirmed'
→ Cart cleared
       ↓
Redirect to /order-success/:id
```

---

## 🚢 Production Deployment

### Backend (Railway / Render)
```bash
# Set all env vars in the platform dashboard
# Start command:
npm start
```

### Frontend (Vercel / Netlify)
```bash
# Build command:
npm run build

# Set env vars:
VITE_API_URL=https://your-backend.railway.app/api
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx  # Use LIVE key in production

# For Vite SPA routing, add _redirects file (Netlify) or vercel.json (Vercel):
# { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### Switch to Live Razorpay
1. Complete KYC on Razorpay dashboard
2. Get live keys: `rzp_live_...`
3. Update both `.env` files
4. Set `NODE_ENV=production` in backend

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary color | `#b5661f` (brand-600) |
| Background | `#fdf6ec` (cream) |
| Dark | `#1a1208` |
| Display font | Playfair Display |
| Body font | DM Sans |
| Accent font | Cormorant Garamond |

---

## 🧪 Adding Sample Products via API

```bash
# Login as admin first
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@magnetandposters.com","password":"Admin@123456"}' \
  | jq -r '.token')

# Create a sample product
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Photo Magnet 2x2" \
  -F "description=Upload your favourite photo and get it as a beautiful fridge magnet." \
  -F "category=photo-magnet" \
  -F "basePrice=320" \
  -F "requiresCustomImage=true" \
  -F "isFeatured=true" \
  -F 'variants=[{"size":"2x2","price":320,"mrp":400},{"size":"3x3","price":450,"mrp":550}]'
```

---

## 📞 Support

WhatsApp: +91 
Email: hello.magnetandposters@gmail.com

---

*Built with ❤️ using React + Node.js + MongoDB + Razorpay + Cloudinary*
