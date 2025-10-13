import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import products from "./routes/products";
import orders from "./routes/orders";

dotenv.config();

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());

app.use("/api", products);
app.use("/api", orders);

app.get("/health", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
