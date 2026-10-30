import { Button } from "@/components/shadcn/button";

export function SaveRow({ onSave }: { onSave: () => void }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#eeece4] pt-[17px]">
      <span className="text-[9px] text-[#a0a399]">Last saved today at 09:12 AM</span>
      <Button
        onClick={onSave}
        className="min-h-9 rounded-[7px] border border-[#214c3a] bg-[#214c3a] px-3.5 text-[11px] font-semibold text-white hover:border-[#173d2c] hover:bg-[#173d2c]"
      >
        Save changes
      </Button>
    </div>
  );
}
