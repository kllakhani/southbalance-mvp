import { Router } from "express";
import { withSchema } from "../db";

const router = Router();

router.get("/products", async (_req, res) => {
  try {
    const q = await withSchema<{ id: string; sku: string; name: string; unit_price: number }>(
      `SELECT id, sku, name, unit_price FROM products ORDER BY sku`
    );
    res.json(q.rows);
  } catch (e: any) {
    res.status(500).json({ error: "failed_to_list_products", detail: e.message });
  }
});

router.get("/colors", async (_req, res) => {
  try {
    const q = await withSchema<{ id: number; name: string }>(
      `SELECT id, name FROM colors ORDER BY name`
    );
    res.json(q.rows);
  } catch (e: any) {
    res.status(500).json({ error: "failed_to_list_colors", detail: e.message });
  }
});

export default router;   // IMPORTANT
