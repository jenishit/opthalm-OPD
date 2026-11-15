"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CATEGORY_ICON } from "@/lib/inventory-category";
import type { InventoryCategory, InventoryItem } from "@/types/inventory-types";

/** The product photo when it has one (and it loads), otherwise the category icon. */
export function ProductThumb({ item, className }: { item: Pick<InventoryItem, "category" | "image_url" | "name">; className?: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const Icon = CATEGORY_ICON[item.category as InventoryCategory] ?? CATEGORY_ICON.other;
  const url = item.image_url && item.image_url !== failedUrl ? item.image_url : null;
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-sage-soft text-sage", className)}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary https hosts, so next/image's allow-list doesn't fit
        <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailedUrl(url)} className="size-full object-cover" />
      ) : (
        <Icon size={18} />
      )}
    </span>
  );
}
