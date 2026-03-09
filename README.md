#  MedChain TN

> AI + Blockchain Medical Inventory Management System for Tamil Nadu Healthcare Supply Chain

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.x-blue)](https://soliditylang.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-green)](https://www.python.org/)
[![Node](https://img.shields.io/badge/Node.js-18+-brightgreen)](https://nodejs.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2051-black)](https://expo.dev/)

---

##  Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
- [Dataset Plan](#-dataset-plan)
- [Smart Contracts](#-smart-contracts)
- [ML Service](#-ml-service)
- [API Reference](#-api-reference)
- [Mobile App](#-mobile-app)
- [Demo Flow](#-demo-flow)


---

##  Problem Statement

Tamil Nadu's healthcare supply chain serving 77 million people suffers from five critical failures:

| Problem | Impact |
|---|---|
| No demand forecasting | Drug shortages during malaria & dengue seasons |
| Mutable inventory records | Stock manipulation goes undetected |
| No drug verification | Counterfeit medicines reach patients |
| Poor expiry management | ~18% of batches wasted |
| No decision support | Reactive, manual procurement decisions |

---

##  Solution

**MedChain TN** combines blockchain immutability with AI intelligence to fix every layer of the supply chain.

```
Blockchain  →  tamper-proof batch records + ownership transfers
AI          →  demand forecasting + anomaly detection + expiry prediction
Mobile App  →  unified interface for manufacturers, distributors, patients
```

---

##  System Architecture

```
┌─────────────────────────────────────────────┐
│           React Native Expo App             │
│  ┌──────────┬──────────────┬─────────────┐  │
│  │ Patient  │ Distributor  │Manufacturer │  │
│  │ 4 Tabs   │   4 Tabs     │   4 Tabs    │  │
│  └────┬─────┴──────┬───────┴──────┬──────┘  │
└───────┼────────────┼──────────────┼──────────┘
        └────────────┼──────────────┘
                     │ HTTPS / REST + JWT
        ┌────────────▼─────────────┐
        │    Node.js API Gateway   │
        │    JWT + RBAC Middleware │
        └──┬───────────┬───────────┘
           │           │
    ┌──────▼───┐  ┌────▼─────────┐
    │PostgreSQL│  │ Flask ML API │
    │ + Redis  │  │  3 Modules   │
    └──────────┘  └──────────────┘
           │
    ┌──────▼──────────────────┐
    │      ethers.js          │
    │         ↕               │
    │  Ganache Local Chain    │
    │  4 Solidity Contracts   │
    └─────────────────────────┘
```

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native + Expo SDK 51 |
| Backend | Node.js + Express |
| ML Service | Python + Flask |
| Database | PostgreSQL + Redis |
| Blockchain | Solidity + Hardhat + Ganache |
| ML Models | scikit-learn, XGBoost, Prophet, Keras |
| Maps | react-native-maps |
| Charts | victory-native |
| Auth | JWT + expo-secure-store |

---

##  Repository Structure

```
/medchain-tn
  /mobile                   ← Expo React Native app
    /app
      /_layout.tsx
      /auth/
      /(patient)/
      /(distributor)/
      /(manufacturer)/
    /components
      /shared/
      /patient/
      /distributor/
      /manufacturer/
    /hooks/
    /services/
  /backend                  ← Node.js API Gateway
    /src
      /routes/
      /controllers/
      /middleware/
      /blockchain/
      /ml/
      /db/
    app.js
  /ml-service               ← Python Flask ML API
    /data
      /raw/
      /processed/
      /synthetic/
    /models/
    /notebooks/
    /src
      /features/
      /training/
      /evaluation/
      /api/
    app.py
  /contracts                ← Solidity Smart Contracts
    /contracts/
      MedAccessControl.sol
      MedBatch.sol
      MedTransfer.sol
      MedAudit.sol
    /scripts/
    /test/
    hardhat.config.js
  /data                     ← Dataset generation
    /synthetic/
      constants.py
      generate_usage.py
      generate_movements.py
      generate_expiry.py
      generate_regional.py
      run_all.py
  /docs/
  docker-compose.yml
  README.md
```

---

##  Getting Started

### Prerequisites

```bash
node >= 18
python >= 3.10
docker + docker-compose
ganache (desktop or CLI)
expo-cli
```

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/medchain-tn.git
cd medchain-tn
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
# Ganache
GANACHE_RPC_URL=http://127.0.0.1:7545
GANACHE_CHAIN_ID=1337
GANACHE_MNEMONIC="your twelve word mnemonic from ganache ui"
GANACHE_PRIVATE_KEY_ADMIN=0x...
GANACHE_PRIVATE_KEY_MANUFACTURER=0x...
GANACHE_PRIVATE_KEY_DISTRIBUTOR=0x...

# PostgreSQL
POSTGRES_URL=postgresql://medchain:password@localhost:5432/medchain_tn

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# ML Service
ML_SERVICE_URL=http://localhost:5000
```

### 3. Start All Services

```bash
docker-compose up -d
```

This starts: Ganache · PostgreSQL · Redis · Node Backend · Flask ML Service

### 4. Deploy Smart Contracts

```bash
cd contracts
npm install
npx hardhat run scripts/deploy.js --network ganache
npx hardhat run scripts/seed.js --network ganache
```

### 5. Generate Datasets + Train ML Models

```bash
cd data/synthetic
pip install -r requirements.txt
python run_all.py

cd ../../ml-service
pip install -r requirements.txt
python src/training/train_all.py
```

### 6. Start the Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on your device.

---

## 📊 Dataset Plan

Three datasets covering Tamil Nadu's pharmaceutical supply chain across **10 districts**, **12 drugs**, **3 facility types**, **24 months**.

| Dataset | Rows | Purpose |
|---|---|---|
| Drug Usage History | ~3,500 | Demand Forecasting |
| Stock Movement Log | ~5,000 | Anomaly Detection |
| Batch Expiry & Wastage | ~2,000 | Expiry Prediction |


### Districts Covered
```
Chennai · Coimbatore · Madurai · Trichy · Salem
Tirunelveli · Vellore · Erode · Thoothukudi · Kanchipuram
```

### Drugs Covered
```
Paracetamol · Amoxicillin · Metformin · Ibuprofen · Omeprazole
Amlodipine · Artemether · Ciprofloxacin · Insulin · Salbutamol
Ondansetron · Chloroquine
```

### Disease Season Flags (Tamil Nadu)
```
Dengue / Vector-borne   Oct–Jan   → Paracetamol, Ciprofloxacin
Malaria                 Jun–Sep   → Artemether, Chloroquine
Respiratory             Dec–Feb   → Salbutamol, Amoxicillin
Gastroenteritis         May–Jun   → Ondansetron, Omeprazole
Diabetes                Oct–Nov   → Metformin, Insulin
```

---

## ⛓️ Smart Contracts

### Contracts Overview

| Contract | Responsibility |
|---|---|
| `MedAccessControl.sol` | Role management (Admin, Manufacturer, Distributor, Patient) |
| `MedBatch.sol` | Drug batch registration + QR hash storage |
| `MedTransfer.sol` | Ownership transfer between supply chain participants |
| `MedAudit.sol` | Expiry tracking + immutable audit trail |

### Network Configuration

```
Development:   Ganache local   (port 7545, chainId 1337)
Testing:       Polygon Amoy Testnet
Production:    Polygon PoS Mainnet
```

### Key Contract Functions

```solidity
// MedBatch.sol
registerBatch(drugName, region, quantity, expiryDate, qrHash)
getBatch(batchId)
verifyBatch(batchId) → isValid, status

// MedTransfer.sol
initiateTransfer(batchId, to, quantity, toRegion)
acceptTransfer(transferId)
getTransferHistory(batchId)

// MedAudit.sol
getAuditTrail(batchId)
getExpiringBatches(withinDays)
```

### Running Tests

```bash
cd contracts
npx hardhat test --network ganache
```

---

##  ML Service

### 3 Intelligence Modules

**Module 1 — Demand Forecasting**
```
Models:    Random Forest · XGBoost · Facebook Prophet
Endpoint:  POST /predict/demand
Output:    predicted_qty_30d, predicted_qty_60d, predicted_qty_90d,
           confidence_interval, reorder_recommendation
```

**Module 2 — Anomaly Detection**
```
Models:    Isolation Forest · Autoencoder (Keras) · Z-Score
Endpoint:  POST /anomaly/detect
Output:    is_anomaly, anomaly_type, confidence_score,
           flagged_features, recommended_action
```

**Module 3 — Expiry Waste Prediction**
```
Models:    Gradient Boosting · Logistic Regression · Survival Analysis
Endpoint:  POST /predict/expiry
Output:    expiry_risk, probability_of_waste,
           redistribution_recommendation
```


---

##  API Reference

### Auth
```
POST  /auth/login
POST  /auth/logout
GET   /auth/me
```

### Drugs
```
GET   /drugs
GET   /drugs/:id
POST  /drugs
```

### Blockchain
```
POST  /batch/register
GET   /batch/:batchId
GET   /batch/verify/:qrHash
POST  /transfer/initiate
POST  /transfer/accept
POST  /transfer/reject
GET   /audit/:batchId
```

### ML Predictions
```
GET   /predict/demand
POST  /anomaly/detect
POST  /predict/expiry
```

### Alerts
```
GET   /alerts
PATCH /alerts/:id/resolve
```

---

##  Mobile App

### User Roles & Tab Structure

####  Patient (4 Tabs)
```
Home          ← drug search + availability + stock status
Scan QR       ← verify drug authenticity via blockchain
Prescriptions ← track active + past prescriptions
Notifications ← low stock alerts for prescribed medicines
```

####  Distributor (4 Tabs)
```
Inventory     ← stock levels, batch breakdown, incoming shipments
Transfers     ← initiate + accept + track batch transfers
Forecast      ← AI demand predictions 30/60/90 days
Chain History ← full blockchain transaction log
```

####  Manufacturer (4 Tabs)
```
Add Batch     ← register drug batch on blockchain + generate QR
Supply Chain  ← map view of all batches + regional distribution
Distributors  ← activity, stock levels, demand vs supply gaps
Alerts        ← anomaly feed + expiry warnings + resolve actions
```

---

##  Demo Flow

**End-to-end demo in 5 steps:**

```
Step 1 — Manufacturer registers a Artemether batch
         → batch written to Ganache chain
         → QR code generated

Step 2 — Manufacturer transfers batch to Madurai distributor
         → transfer pending on-chain

Step 3 — Distributor accepts transfer
         → ownership updated on-chain
         → inventory dashboard reflects new stock

Step 4 — Patient scans QR code
         → app queries blockchain
         → authenticity confirmed: manufacturer, expiry, chain of custody shown

Step 5 — Anomaly alert fires
         → ML service flags unusual stock drop on Insulin batch
         → manufacturer sees alert with confidence score 0.91
         → alert escalated for investigation
```

---

##  Security

```
✓ JWT required on all non-public endpoints
✓ RBAC middleware checks role before every write operation
✓ Private keys never exposed to mobile app
✓ All blockchain writes go through Node backend server wallet
✓ Patient role is read-only — zero write access to chain
✓ Anomaly alerts auto-escalate at confidence score > 0.85
✓ Ganache --deterministic flag keeps wallet addresses stable across restarts
```


> Built for Tamil Nadu. Designed for every healthcare supply chain.
