import * as z from "zod";
import { optionalInt, optionalMoney, positiveInt } from "./field-helpers";

export const addStockSchema = z.object({
  quantity: positiveInt("Quantity"),
  notes: z.string().trim(),
  lot: z.string().trim().max(60, "Batch number is too long"),
  expiry: z.string().refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date"),
});
export type AddStockForm = z.infer<typeof addStockSchema>;

const categories = ["frame", "lens", "contact_lens", "sunglasses", "coating", "accessory", "other"] as const;

export const addProductSchema = z.object({
  category: z.enum(categories),
  sku: z.string().trim().min(1, "SKU / barcode is required"),
  name: z.string().trim().min(1, "Product name is required"),
  brand: z.string().trim(),
  model: z.string().trim(),
  color: z.string().trim(),
  size: z.string().trim(),
  unit: z.string().trim(),
  cost_price: optionalMoney("Cost price"),
  selling_price: optionalMoney("Selling price"),
  quantity_on_hand: optionalInt("Opening stock"),
  reorder_threshold: optionalInt("Reorder threshold"),
  tracks_lots: z.boolean(),
  image_url: z
    .string()
    .trim()
    .max(500, "That link is too long")
    .refine((v) => v === "" || /^https:\/\/\S+$/i.test(v), "Use a full https:// link to the image"),
});
export type AddProductForm = z.infer<typeof addProductSchema>;
