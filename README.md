# FarmLink Direct — SIH 26033

> **Voice-First B2B Fresh Produce Marketplace with Spatial Discovery, Price Intelligence, and Verified Settlement**  
> *Developed for Smart India Hackathon (SIH) 26033* • **Lucknow Regional Agri-Cluster**

---

## 🌟 Product Overview

FarmLink Direct gives farmers and FPOs a **voice-first way to list verified produce**, enables institutional buyers (retailers, kitchens, processors) to **discover nearby supply within a 50 km radius**, provides **deterministic 7-day price forecasting**, coordinates **vehicle route planning**, and guarantees an **immutable proof-of-delivery (POD) settlement flow**.

### 🔑 Key Capabilities (100% Free Tools Stack)
- 🎙️ **Voice-Assisted Produce Listing**: In-browser dual-language (Hindi & English) speech transcription with structured field extraction (Commodity, Grade, Quantity, Asking Price).
- 📍 **Spatial Proximity Matching**: Haversine/PostGIS radius search centered around Lucknow cluster (Malihabad, Bakshi Ka Talab, Chinhat, Kakori, Mohanlalganj).
- 📊 **7-Day Price Forecast Engine**: Explainable, deterministic mandi benchmark guidance with confidence metrics to protect farmers from distressed selling.
- 🔒 **Atomic Inventory Reservation**: Prevents double-selling under concurrent buyer orders with row-level transaction management.
- 🚚 **Pickup-Delivery Route Optimizer**: Capacity-constrained nearest-neighbor routing engine (Tata Ace, 2,000 kg cap).
- 📸 **Proof of Delivery (POD) & Transparent Settlement**: OTP + Geo-photo capture triggering automated settlement breakdown (Gross, 5% Logistics, 2% Platform Fee, Net Farmer payout).
- 🛡️ **Operations Control Tower**: Live KPI tracking, load utilization metrics, and exception resolution queue.

---

## 🚀 Quick Start (Local Run)

### 1. Backend Setup (Django + SQLite)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend Setup (Next.js 14)
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎭 Demo Credentials (All passwords: `farm1234`)

| Role | Username | Organization | Description |
|---|---|---|---|
| **Farmer** | `ramesh` | Lucknow Kisan FPO | Has 500kg Tomato Grade A lot in Bakshi Ka Talab |
| **FPO Operator** | `fpo_admin` | Lucknow Kisan FPO | Manages 5 member farm lots across Lucknow |
| **Buyer** | `buyer1` | Fresh Mart Retailers | Institutional buyer seeking bulk produce in Lucknow |
| **Driver** | `driver1` | FarmLink Logistics | Driver on Tata Ace vehicle (VH-001) |
| **Ops Tower** | `ops` | FarmLink Logistics | Coordinator monitoring route optimization & alerts |

> 💡 **Quick Switch**: Click the **"Demo Role Switch"** button in the top navbar on any page to switch users in 1 click!

---

## 🧪 3-Minute Rehearsed Demo Script for Judges

1. **Farmer Flow**:
   - Log in as **Ramesh (Farmer)**.
   - Click **"Tap Mic to Speak & Auto-Fill"** and select sample: `"500 किलो टमाटर ग्रेड ए कल सुबह पिकअप 38 रुपया भाव"`.
   - Watch extracted fields (Commodity: Tomato, Grade: A, Qty: 500kg, Price: ₹38/kg).
   - Click **"Publish Lot to Marketplace"**.
2. **Buyer Discovery**:
   - Switch role to **Ankit (Buyer)**.
   - Set service radius to `50 km`, select `Tomato`.
   - Toggle **Map Radius** to see Lucknow cluster farm pins on Leaflet map.
   - Click Ramesh's lot, reserve `300 kg`, and click **"Confirm & Lock Order"**.
   - Notice available lot quantity drops atomically from `500 kg` to `200 kg`.
3. **Price Card**:
   - Inspect the **7-Day Price Guidance** chart showing Lucknow mandi trend, suggested ₹34–₹42/kg range, and confidence level.
4. **Driver Fulfillment**:
   - Switch role to **Suresh (Driver)**.
   - View stop sequence for Order #1.
   - Click **"Mark Picked Up"**, then click **"Capture POD & Settle"**.
   - Enter demo OTP `8842`, verify photo, and click **Confirm Delivery**.
5. **Settlement Statement**:
   - View the transparent settlement ledger:
     - Gross Produce Amount: `₹11,400`
     - Logistics Fee (5%): `-₹570`
     - Platform Fee (2%): `-₹228`
     - **Net Farmer Payout**: `₹10,602`
     - Status: `Settlement Ready` (Simulated Ledger).
6. **Ops Control Tower**:
   - Switch role to **Deepak (Ops)**.
   - View aggregate metrics, load utilization, and resolve open exception alerts.

---

## 🏗️ Architecture & Tech Stack

```
SIH/
├── backend/                  # Django 5 + Django REST Framework + SimpleJWT
│   ├── accounts/             # User, Org, Role auth & seed_demo
│   ├── lots/                 # Farm, Lot models & Haversine spatial search
│   ├── orders/               # Order state machine & atomic reservation
│   ├── forecasts/            # Deterministic price forecast engine
│   ├── routing/              # Nearest-neighbor vehicle route planner
│   ├── fulfillment/          # Audit events, delivery proof & settlement
│   └── farmlink/             # Settings & routing
│
└── frontend/                 # Next.js 14 (App Router) + Tailwind CSS
    ├── src/app/              # 12-screen role routes (/, /farmer, /buyer, /driver, /ops)
    ├── src/components/       # Navbar, PriceGuidanceCard, LeafletMap, VoiceListingModal, etc.
    └── src/lib/              # API client, Auth provider, Voice parser, Dual translations (EN/HI)
```
