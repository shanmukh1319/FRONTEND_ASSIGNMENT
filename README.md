# Product & Order Management System

A modern React application for managing products and orders with authentication, dynamic forms, and full CRUD operations. Built with TypeScript, Material UI, and integrated with NestJS backend APIs.

## Features

### Authentication
- User signup with validation
- Secure login with credential verification
- Session management using localStorage
- Protected routes with automatic redirect

### Dashboard
- Responsive sidebar navigation
- Welcome page with user information
- Mobile-friendly drawer menu
- Logout functionality

### Product Management
- **View Products**: Table view with pagination
- **Search**: Search by name or category
- **Filter**: Filter by status (Active/Inactive)
- **Sort**: Sort by name, price, inventory, or date
- **Create**: Add new products using dynamic JSON form
- **Edit**: Update existing products
- **Delete**: Remove products with confirmation dialog
- **Pagination**: Server-side pagination with metadata

### Order Management
- **View Orders**: Table view with pagination
- **Search**: Search by customer name, product, or order ID
- **Filter**: Filter by status (Pending, Confirmed, Shipped, Delivered)
- **Sort**: Sort by order number, total amount, status, or date
- **Create**: Create new orders with product selection
- **View Details**: Side drawer with complete order information
- **Update Status**: Change order status with dropdown
- **Pagination**: Server-side pagination with metadata

### Dynamic Forms
- JSON-based form configuration
- Support for text fields, dropdowns, and radio buttons
- Automatic validation with Yup schema
- Auto-save to localStorage
- Customizable form titles and button text
- Initial values support for editing

### API Integration
- Axios-based HTTP client
- Automatic localStorage fallback for offline mode
- Error handling with user-friendly notifications
- Separate API endpoints for products and orders

## Tech Stack

- **React 19** with TypeScript
- **Material UI 7** - Component library
- **React Router DOM 7** - Routing
- **Vite 7** - Build tool
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Yup** - Schema validation
- **LocalStorage** - Session & data persistence

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the root directory:
```env
VITE_API_BASE_URL_PRODUCTS=http://localhost:3000
VITE_API_BASE_URL_ORDERS=http://localhost:3001
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  ├── api/              # API service layer
  │   ├── products.ts   # Product API calls
  │   └── orders.ts     # Order API calls
  ├── components/       # Reusable components
  │   └── DynamicForm.tsx
  ├── config/           # Configuration files
  │   ├── env.ts
  │   ├── productForm.json
  │   ├── loginForm.json
  │   └── signupForm.json
  ├── pages/            # Page components
  │   ├── Signup.tsx
  │   ├── Login.tsx
  │   ├── Dashboard.tsx
  │   ├── DashboardHome.tsx
  │   ├── Products.tsx
  │   ├── Orders.tsx
  │   └── FormPage.tsx
  ├── routes/            # Route components
  │   └── ProtectedRoute.tsx
  ├── types/             # TypeScript definitions
  │   ├── form.ts
  │   ├── product.ts
  │   └── order.ts
  └── utils/             # Utility functions
      ├── storage.ts
      ├── formStorage.ts
      └── configLoader.ts
```

## Routes

- `/` - Redirects to login
- `/signup` - User registration
- `/login` - User login
- `/dashboard` - Protected dashboard (requires auth)
  - `/dashboard` - Dashboard home
  - `/dashboard/products` - Product management
  - `/dashboard/orders` - Order management
- `/form` - Dynamic form demo page

## Usage

### Authentication Flow

1. **Signup**: Register a new account at `/signup`
2. **Login**: Sign in at `/login` with your credentials
3. **Dashboard**: Access protected routes after login
4. **Logout**: Click logout in sidebar to end session

### Product Management

1. Navigate to `/dashboard/products`
2. Use search bar to find products
3. Filter by status using the dropdown
4. Click "Add Product" to create new products
5. Click edit icon to modify existing products
6. Click delete icon to remove products

### Order Management

1. Navigate to `/dashboard/orders`
2. Use search bar to find orders
3. Filter by status using the dropdown
4. Click "Add Order" to create new orders
5. Click view icon to see order details
6. Update order status using the dropdown in details drawer

### Dynamic Forms

Forms are configured via JSON files in `src/config/`. The `DynamicForm` component automatically:
- Renders fields based on configuration
- Validates input using Yup schemas
- Auto-saves form data to localStorage
- Supports text, dropdown, and radio field types

## API Endpoints

### Products API
- `GET /products` - Get paginated products (with search, filter, sort)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Orders API
- `GET /orders` - Get paginated orders (with search, filter, sort)
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create order
- `PATCH /orders/:id/status` - Update order status
- `DELETE /orders/:id` - Cancel order

## Features in Detail

### Form Auto-Save
Forms automatically save data to localStorage as you type. Data persists across page refreshes and can be cleared programmatically.

### Offline Support
The application falls back to localStorage when API calls fail, ensuring functionality even when the backend is unavailable.

### Responsive Design
Fully responsive layout that works on desktop, tablet, and mobile devices with Material UI's responsive breakpoints.

### Type Safety
Complete TypeScript coverage with strict type checking for all components, utilities, and API calls.

## Development

### Adding New Features

- **New Pages**: Add to `src/pages/` and register in `src/App.tsx`
- **New Components**: Add to `src/components/`
- **New Utilities**: Add to `src/utils/`
- **New API Endpoints**: Add to `src/api/`

### Form Configuration

Edit JSON files in `src/config/` to modify form fields. Supported field types:
- `TEXT` - Text input (supports email, number, etc.)
- `LIST` - Dropdown select
- `RADIO` - Radio button group

