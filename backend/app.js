require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/batches", require("./src/routes/batches"));
app.use("/api/transfers", require("./src/routes/transfers"));
app.use("/api/audit", require("./src/routes/audit"));
app.use("/api/ml", require("./src/routes/ml"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// Error handler
app.use((err, _req, res, _next) => {
  const message = err.reason || err.shortMessage || err.message || "Internal server error";
  const status = err.status || 500;
  console.error("[API Error]", message);
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
