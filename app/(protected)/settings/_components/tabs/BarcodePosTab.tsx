"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ScanBarcode, Wand2, Printer } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Barcode39 } from "@/components/ui/Barcode39";
import { Toggle } from "../Toggle";
import { SaveRow } from "../SaveRow";

export function BarcodePosTab() {
  const [sku, setSku] = useState("FRM-RB-2140");

  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Barcode & POS</h3>
          <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">Configure how checkout, scanning, and receipts behave.</p>
        </div>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#f0edf6] text-[#8477a3]">
          <ScanBarcode size={18} />
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-semibold text-[#687468]">Generating barcodes</span>
        <p className="-mt-2 text-[10px] leading-[1.6] text-[#92988c]">
          Every product&apos;s barcode is generated from its SKU using Code 39 — type a SKU below to see exactly what gets
          printed on its shelf label.
        </p>
        <div className="flex flex-col gap-3 rounded-[9px] border border-[#e9e6dc] bg-[#fbfaf6] p-3.5">
          <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
            Product SKU
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. FRM-RB-2140"
              className="min-h-[37px] w-full max-w-xs rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] font-mono text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
            />
          </label>
          <div className="flex flex-col items-center gap-1.5 rounded-[7px] border border-[#e7e4da] bg-white px-4 py-4">
            {sku.trim() ? (
              <>
                <Barcode39 value={sku} className="max-w-full text-[#1b1b1b]" />
                <span className="font-mono text-[11px] tracking-[2px] text-[#4c5c4f]">{sku.toUpperCase()}</span>
              </>
            ) : (
              <span className="py-4 text-[10px] text-[#a0a399]">Enter a SKU to preview its barcode</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] text-[#a0a399]">Symbology: Code 39 · scannable with any standard barcode reader</span>
            <Button
              size="sm"
              onClick={() => toast.info(`Label for ${sku.toUpperCase()} sent to printer`)}
              className="min-h-[30px] gap-1.5 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-2.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
            >
              <Printer size={13} />
              Print label
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Auto-generate barcode for new products</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">
              When a product is added to Inventory without a barcode, generate one from its SKU automatically.
            </p>
          </div>
          <Toggle defaultOn label="Toggle auto-generate barcode" />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Products missing a barcode</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Backfill barcodes for products that were added before this was turned on.</p>
          </div>
          <Button
            size="sm"
            onClick={() => toast.success("Generated barcodes for 3 products")}
            className="min-h-[30px] gap-1.5 rounded-[7px] border border-[#214c3a] bg-[#214c3a] px-2.5 text-[11px] font-semibold text-white hover:border-[#173d2c] hover:bg-[#173d2c]"
          >
            <Wand2 size={13} />
            Generate missing
          </Button>
        </div>

        <div className="my-1 h-px bg-[#eeece4]" />

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Enable barcode scanning</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Use a connected scanner to add products at checkout and in inventory.</p>
          </div>
          <Toggle defaultOn label="Toggle barcode scanning" />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Auto-print receipt</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Print a receipt automatically once a sale is completed.</p>
          </div>
          <Toggle label="Toggle auto-print receipt" />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Require PIN for refunds</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Only authorized staff can process refunds and void completed sales.</p>
          </div>
          <Toggle label="Toggle refund PIN" />
        </div>
        <div className="my-1 h-px bg-[#eeece4]" />
        <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
          <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
            Receipt printer
            <select className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]">
              <option>Front desk — Epson TM-T88</option>
              <option>Optical counter — Star TSP143</option>
              <option>No printer connected</option>
            </select>
          </label>
          <label className="flex flex-col gap-[7px] text-[10px] font-semibold text-[#687468]">
            Till float amount
            <input
              defaultValue="$200.00"
              className="min-h-[37px] w-full rounded-[7px] border border-[#e7e4da] bg-[#fffefa] px-2.5 py-[9px] text-[11px] text-[#4c5c4f] outline-none focus:border-[#72957c]"
            />
          </label>
        </div>
        <SaveRow onSave={() => toast.info("POS settings saved")} />
      </div>
    </>
  );
}
