"use client";

import { toast } from "sonner";
import { Search, SlidersHorizontal, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { MOCK_MEMBERS } from "./mock-data";

function notify(message: string) {
  toast.info(message);
}

export function TeamTable() {
  return (
    <div className="overflow-hidden rounded-[11px] border border-[#e9e6dc] bg-[#fffefa] shadow-[0_5px_20px_rgba(42,52,41,0.035),0_1px_2px_rgba(42,52,41,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeece4] px-[18px] py-4">
        <div className="flex h-9 min-w-[215px] items-center gap-2 rounded-lg border border-[#e9e6dc] bg-[#fffefa] px-2.5 text-[#9a9d94]">
          <Search size={14} />
          <input
            placeholder="Search team members…"
            className="w-full bg-transparent text-[11px] text-[#23342c] outline-none placeholder:text-[#a4a69e]"
          />
        </div>
        <Button
          onClick={() => notify("Role filters opened")}
          className="min-h-9 gap-2 rounded-[7px] border border-[#e2dfd5] bg-[#fffefa] px-3.5 text-[11px] font-semibold text-[#48564a] hover:border-[#cbd5c8] hover:bg-[#f3f4ec]"
        >
          <SlidersHorizontal size={14} />
          Filter by role
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse whitespace-nowrap text-left">
          <thead className="bg-[#faf9f4]">
            <tr>
              {["TEAM MEMBER", "ROLE", "ACCESS SCOPE", "LAST ACTIVE", "STATUS", ""].map((h) => (
                <th key={h} className="px-[17px] py-3 text-[9px] font-bold tracking-[0.7px] text-[#969a90]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_MEMBERS.map((m) => (
              <tr key={m.email} className="hover:bg-[#fcfbf7]">
                <td className="border-t border-[#f0eee7] px-[17px] py-3">
                  <div className="flex items-center gap-[9px]">
                    <span className={"grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-bold " + m.bg + " " + m.text}>
                      {m.init}
                    </span>
                    <div className="flex flex-col gap-1">
                      <b className="text-[10px] text-[#23342c]">{m.name}</b>
                      <span className="text-[9px] text-[#979a91]">{m.email}</span>
                    </div>
                  </div>
                </td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3">
                  <span className="rounded-[5px] bg-[#f0efe8] px-2 py-1 text-[9px] text-[#6e786b]">{m.role}</span>
                </td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3 text-[10px] text-[#697368]">{m.scope}</td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3 text-[10px] text-[#697368]">{m.active}</td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3">
                  <span className="inline-flex items-center gap-[5px] rounded-[5px] bg-[#e7efe6] px-[7px] py-1 text-[9px] font-semibold leading-none text-[#3e7350]">
                    <i className="size-[5px] rounded-full bg-current opacity-80" />
                    {m.status}
                  </span>
                </td>
                <td className="border-t border-[#f0eee7] px-[17px] py-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => notify("Edit team member")}
                    className="size-[31px] rounded-lg text-[#858b82] hover:bg-[#f1f0e9] hover:text-[#214c3a]"
                  >
                    <MoreHorizontal size={17} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
