# Diya Organics - Premium Natural & Organic E-Commerce Platform

This is a robust, full-stack e-commerce application built for **Diya Organics** using **Next.js 14** and **Supabase**. It specializes in delivering high-quality natural and organic products through a seamless shopping experience and a powerful admin dashboard.

## 🚀 Key Features

### 🛒 Advanced E-Commerce Core
- **Robust Shopping Cart:** "Crash-proof" cart logic (Context API) that handles edge cases like missing stock limits or quantities gracefully.
- **Slide-Out Mini Cart:** A responsive, side-drawer cart for quick access and seamless UX on all devices.
- **Checkout Flow:** Optimized checkout process integrated with coupon logic.

### 🎛️ Modular Admin Dashboard
- **Feature Switchboard:** A dedicated "Modules" page (`/admin/modules`) to Enable/Disable features (e.g., Flash Sales, Blog, Loyalty Program).
- **Control & Security:** PIN-protected sensitive areas to prevent accidental changes.
- **Dynamic Sidebar:** The admin menu automatically updates based on enabled modules.

### 📝 Dynamic CMS (Content Management System)
- **Zero-Code Updates:** Manage Homepage text, Service Cards, Trust Badges, and Stats directly from the Admin Panel.
- **Hero Slider Management:** Easily upload/manage hero slides with support for both **Images** and **Videos**. Includes smart fallback logic and easy removal tools.
- **Site Settings:** Update global site info (Logo, Contact, Social Links) on the fly.

### 🛡️ Data Integrity & Safety
- **Soft Delete Architecture:** Products and Orders are never permanently deleted ("hard delete"). Instead, they are "Archived" to preserve historical sales data and prevent integrity errors.
- **Role-Based Access:** Secure authentication flow distinguishing between Customers, Staff, and Admins.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Directory)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Remix Icon](https://remixicon.com/)
- **Deployment:** [Vercel](https://vercel.com/)

## 📦 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sasusavage/WIDAMA-PHARMACY.git
   cd multimey
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the App:**
   Visit [http://localhost:3000](http://localhost:3000).

## 🗂️ Project Structure

- `/app` - Next.js App Router pages and layouts.
  - `/(store)` - Public-facing e-commerce pages.
  - `/admin` - Secure admin dashboard.
- `/components` - Reusable UI components.
- `/context` - React Context providers (Cart, CMS, etc.).
- `/lib` - Utilities and Supabase client configuration.

## 📝 License

This project is proprietary software developed for WIDAMA Pharmacy.
