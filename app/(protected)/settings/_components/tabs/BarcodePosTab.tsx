"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ScanBarcode } from "lucide-react";
import { Barcode39 } from "@/components/ui/Barcode39";
import { Toggle } from "../Toggle";
import { SaveRow } from "../SaveRow";
import { getPosConfig, updatePosConfig } from "@/services/clinic-services";
import { ApiError } from "@/services/http";
import type { ClinicPosConfig } from "@/types/clinic-types";

export function BarcodePosTab() {
  const [sku, setSku] = useState("FRM-RB-2140");
  const [config, setConfig] = useState<ClinicPosConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getPosConfig()
      .then((data) => {
        if (active) setConfig(data);
      })
      .catch((error) => {
        console.error("Failed to load POS config", error);
        toast.error("Failed to load POS settings");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function set<K extends keyof ClinicPosConfig>(key: K, value: ClinicPosConfig[K]) {
    setConfig((c) => (c ? { ...c, [key]: value } : c));
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      const saved = await updatePosConfig(config);
      setConfig(saved);
      setLastSaved(new Date().toISOString());
      toast.success("POS settings saved");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to save POS settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-[11px] text-[#92988c]">
        <Loader2 size={15} className="animate-spin" /> Loading POS settings…
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-[14px]">
        <div>
          <h3 className="m-0 font-['Playfair_Display',serif] text-base font-semibold text-[#2a3b30]">Barcode & POS</h3>
          <p className="m-0 mt-[5px] text-[10px] text-[#96998f]">Configure how checkout and scanning behave.</p>
        </div>
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-[#f0edf6] text-[#8477a3]">
          <ScanBarcode size={18} />
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-semibold text-[#687468]">Barcode preview</span>
        <p className="-mt-2 text-[10px] leading-[1.6] text-[#92988c]">
          Every product&apos;s barcode is generated from its SKU using Code 39 — type a SKU below to preview what gets
          printed on its shelf label. This is a local preview only, not a saved setting.
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
          <span className="text-[9px] text-[#a0a399]">Symbology: Code 39 · scannable with any standard barcode reader</span>
        </div>

        <div className="my-1 h-px bg-[#eeece4]" />

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Auto-generate barcode for new products</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">
              When a product is added to Inventory without a barcode, generate one from its SKU automatically.
            </p>
          </div>
          <Toggle
            on={config.auto_generate_barcode}
            onToggle={(v) => set("auto_generate_barcode", v)}
            label="Toggle auto-generate barcode"
          />
        </div>

        <div className="my-1 h-px bg-[#eeece4]" />

        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Enable barcode scanning</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Use a connected scanner to add products at checkout and in inventory.</p>
          </div>
          <Toggle
            on={config.enable_barcode_scanning}
            onToggle={(v) => set("enable_barcode_scanning", v)}
            label="Toggle barcode scanning"
          />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Auto-print receipt</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Print a receipt automatically once a sale is completed.</p>
          </div>
          <Toggle on={config.auto_print_receipt} onToggle={(v) => set("auto_print_receipt", v)} label="Toggle auto-print receipt" />
        </div>
        <div className="flex items-center justify-between gap-[15px] py-1">
          <div>
            <b className="text-[11px] text-[#23342c]">Require PIN for refunds</b>
            <p className="mt-[5px] text-[10px] text-[#92988c]">Only authorized staff can process refunds and void completed sales.</p>
          </div>
          <Toggle on={config.require_refund_pin} onToggle={(v) => set("require_refund_pin", v)} label="Toggle refund PIN" />
        </div>
        <SaveRow onSave={handleSave} saving={saving} lastSaved={lastSaved} />
      </div>
    </>
  );
}
