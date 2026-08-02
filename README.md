# zAIko 📦 🤖
**Inventory Prediction & Demand Forecasting for Kirana Stores**

zAIko is an intelligent, AI-powered inventory management and demand forecasting platform built specifically for small-to-medium retailers (like Kirana stores). It transforms static inventory lists into a dynamic, predictive engine that tells you what to order, when to order it, and how to optimize your capital.

## 🚀 Key Features

### 1. Command Center (Dashboard)
A real-time pulse on your store's health. 
- **Dynamic Top Selling Products**: Instantly calculates top-moving items based on live transaction data.
- **ML Accuracy Tracking**: A live score tracking how closely the AI's predicted demand matched actual historical sales over the last 7 days.
- **Quick Actions**: Instantly record sales or apply discounts from a unified interface.

### 2. Live Inventory Management
- Full CRUD capabilities for all store SKUs.
- **Instant Reordering**: Bypass AI recommendations to manually place reorders directly from the inventory table.
- **Status Badges**: Visual indicators for "In Stock", "Low", and "Out of Stock" items, along with tracking for pending shipments.

### 3. AI Optimizations Engine
A background ML engine that constantly scans live inventory state to generate actionable insights:
- **Overstock Risk**: Detects items tying up too much capital or taking up too much shelf space and suggests bundle offers or discounts.
- **Low Stock Alerts**: Dynamically prompts immediate reorders for fast-moving items about to stock out.

### 4. What-If Simulator
A powerful forecasting tool to visualize demand shifts.
- Tweak parameters like **Marketing Spend**, **Discount Percentage**, and **Adverse Weather Impact**.
- See a smooth, deterministic visualization of how these external factors will pull forward or depress future demand curves over a customizable 7 to 90-day range.

### 5. Daily Activity Ledger
- An immutable transaction log tracking all sales, reorders, and stock receipts.
- Easily filter by date to review historical performance and store activity.

## 🛠 Tech Stack

- **Frontend Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS & shadcn/ui components
- **State Management**: Zustand (with localStorage persistence)
- **Data Visualization**: Recharts (for demand curves and sparklines)
- **Icons**: Lucide React

## 🚦 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/hazynyx/zAIko.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

*Note: For the purpose of this hackathon, user authentication is mocked. Simply click "Login" to access the dashboard. All state is persisted locally in your browser.*
