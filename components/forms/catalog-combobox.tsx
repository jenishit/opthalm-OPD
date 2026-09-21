"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { IntakeExamFormData } from "@/lib/schemas/shared.schema";
import { Search, Plus, Check, Loader2 } from "lucide-react";
import { getConditions, createCondition, getDiagnoses, createDiagnosis, getMedicines, createMedicine } from "@/lib/api/catalogs";

interface CatalogComboboxProps {
  catalogType: "conditions" | "diagnoses" | "medicines";
  placeholder: string;
  onSelect: (id: string, name: string, fullItem: any) => void;
}

// A simplified custom combobox since shadcn command/popover isn't fully installed yet
export function CatalogCombobox({ catalogType, placeholder, onSelect }: CatalogComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Create Form State
  const [createName, setCreateName] = useState("");
  const [createCode, setCreateCode] = useState(""); // for ICD-10

  const searchCatalog = async (q: string) => {
    setLoading(true);
    try {
      if (catalogType === "conditions") setItems(await getConditions(q));
      else if (catalogType === "diagnoses") setItems(await getDiagnoses(q));
      else if (catalogType === "medicines") setItems(await getMedicines(q));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Run search on open and when typing
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => searchCatalog(search), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, search, catalogType]);

  const handleCreate = async () => {
    if (!createName) return;
    setLoading(true);
    try {
      let newItem;
      if (catalogType === "conditions") {
        newItem = await createCondition(createName);
      } else if (catalogType === "diagnoses") {
        newItem = await createDiagnosis(createName, createCode || "Unknown");
      } else if (catalogType === "medicines") {
        newItem = await createMedicine({ generic_name: createName, brand: "New Brand", strength: "1%", form: "eye drop" });
      }

      if (newItem) {
        onSelect(newItem.id, catalogType === "medicines" ? (newItem as any).generic_name : (newItem as any).name, newItem);
        setIsOpen(false);
        setIsCreating(false);
        setSearch("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div
        className="flex items-center w-full rounded-xl border border-input bg-card px-3 py-2 text-sm cursor-text transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
        <input
          type="text"
          className="flex-1 bg-transparent outline-none border-none p-0 text-sm text-foreground placeholder:text-muted-foreground focus:ring-0"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            setIsCreating(false);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-border/60 bg-card max-h-60 flex flex-col overflow-hidden">
          {/* Backdrop to close */}
          <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />

          <div className="overflow-auto flex-1 p-1.5">
            {loading && !isCreating && (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
              </div>
            )}

            {!loading && !isCreating && items.length === 0 && search.length > 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found for &quot;{search}&quot;
              </div>
            )}

            {!loading && !isCreating && items.map((item) => {
              const name = catalogType === "medicines"
                ? `${item.generic_name} (${item.brand}) ${item.strength}`
                : item.name;

              return (
                <div
                  key={item.id}
                  className="px-3 py-2 cursor-pointer rounded-xl hover:bg-primary/5 text-sm text-foreground flex justify-between items-center gap-3 group"
                  onClick={() => {
                    onSelect(item.id, name, item);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  <span>{name}</span>
                  {catalogType === "diagnoses" && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{item.icd10_code}</span>}
                </div>
              );
            })}
          </div>

          {/* Create New Action */}
          {!isCreating ? (
            <div
              className="border-t border-border/60 p-2.5 text-sm text-primary font-medium hover:bg-muted/60 cursor-pointer flex items-center justify-center gap-1.5"
              onClick={() => {
                setCreateName(search);
                setIsCreating(true);
              }}
            >
              <Plus className="h-4 w-4" /> Create new {catalogType.slice(0, -1)}
            </div>
          ) : (
            <div className="border-t border-border/60 p-3 bg-muted/40 flex flex-col gap-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Create New</div>
              <input
                type="text"
                placeholder="Name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
              />
              {catalogType === "diagnoses" && (
                <input
                  type="text"
                  placeholder="ICD-10 Code"
                  value={createCode}
                  onChange={(e) => setCreateCode(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                />
              )}
              <div className="flex gap-2 justify-end mt-1">
                <button type="button" onClick={() => setIsCreating(false)} className="text-xs px-3 py-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Cancel</button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={loading || !createName}
                  className="text-xs px-3.5 py-1.5 bg-primary text-primary-foreground rounded-full font-medium shadow-organic-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save & Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
