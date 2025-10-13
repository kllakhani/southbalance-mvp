import { Router } from "express";
import { z } from "zod";
import { withSchema } from "../db";

const router = Router();

const createOrderBody = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  shipToDcId: z.coerce.number().int(),
  createdBy: z.string().uuid(),   // users.id (uuid)
});

router.post("/orders", async (req, res) => {
  try {
    const b = createOrderBody.parse(req.body);
    const q = await withSchema<{ order_id: string }>(
      `SELECT sp_create_order($1,$2,$3,$4) AS order_id`,
      [b.customerName, b.customerEmail, b.shipToDcId, b.createdBy]
    );
    res.status(201).json({ id: q.rows[0].order_id, status: "DRAFT" });
  } catch (e: any) {
    res.status(400).json({ error: "create_order_failed", detail: e.message });
  }
});

const addItemBody = z.object({
  productId: z.string().uuid(),
  colorId: z.coerce.number().int(),
  quantity: z.coerce.number().int().positive(),
});

router.post("/orders/:id/items", async (req, res) => {
  try {
    const orderId = z.string().uuid().parse(req.params.id);
    const { productId, colorId, quantity } = addItemBody.parse(req.body);
    await withSchema(`SELECT sp_add_order_item($1,$2,$3,$4)`, [orderId, productId, colorId, quantity]);
    res.status(201).json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: "add_item_failed", detail: e.message });
  }
});

const submitBody = z.object({ queueEmails: z.boolean().default(true) });

router.post("/orders/:id/submit", async (req, res) => {
  try {
    const orderId = z.string().uuid().parse(req.params.id);
    const { queueEmails } = submitBody.parse(req.body ?? {});
    await withSchema(`SELECT sp_submit_order($1,$2)`, [orderId, queueEmails]);
    const summary = await withSchema(`SELECT * FROM vw_order_summary WHERE order_id = $1`, [orderId]);
    res.json(summary.rows[0]);
  } catch (e: any) {
    res.status(400).json({ error: "submit_failed", detail: e.message });
  }
});

router.get("/orders", async (_req, res) => {
  try {
    const q = await withSchema(`SELECT * FROM vw_order_summary ORDER BY created_at DESC`);
    res.json(q.rows);
  } catch (e: any) {
    res.status(500).json({ error: "list_orders_failed", detail: e.message });
  }
});

export default router;   // IMPORTANT
