import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { markNoticeDismissed, shouldShowNotice } from "@/data/rescheduleNotice";

/**
 * Tijdelijk: vertelt bezoekers die via een oude LinkedIn-post of mailing
 * binnenkomen dat het event van 6 oktober naar 12 november is verschoven.
 * Verdwijnt vanzelf na 3 oktober 2026, zie rescheduleNotice.ts, en mag daarna
 * samen met die module weg.
 *
 * De kleuren staan als hex in plaats van als var(--evt-*), want Radix hangt de
 * dialoog via een portal onder document.body en dus buiten de .evt-wrapper
 * waar die variabelen gedefinieerd staan. Om dezelfde reden staat het
 * lettertype er expliciet bij.
 */

const EVT_FONT =
  '"Inter", "Figtree", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export default function RescheduleNotice() {
  // Lazy initial state: de vraag wordt een keer gesteld bij het monteren, niet
  // bij elke render.
  const [open, setOpen] = useState(shouldShowNotice);

  /** Het kruisje, de knop, Escape en een klik naast de dialoog komen hier. */
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) markNoticeDismissed();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* aria-modal staat er expliciet bij: deze Radix-versie zet geen
          aria-hidden op de pagina eronder, dus zonder dit blijft de
          achtergrond leesbaar voor een schermlezer terwijl de focus wel
          vastzit in de dialoog. */}
      <DialogContent
        aria-modal="true"
        className="border-[#2a2e55] bg-[#171a3d] text-white sm:max-w-[460px]"
        style={{ fontFamily: EVT_FONT }}
      >
        <DialogHeader>
          <DialogTitle className="text-[22px] leading-[1.25] font-bold text-white">
            Our event has been rescheduled to the 12th of November.
          </DialogTitle>
          <DialogDescription className="pt-2 text-[15px] leading-[1.6] text-[#c7cbe4]">
            Thursday, November 12, 2026, 12:15 to 16:30 CET, at the Zoom office in Amsterdam.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="rounded-full bg-[#e3f58c] px-7 py-3 text-[15px] font-semibold text-[#12142f] transition-colors hover:bg-[#d7ec72] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e3f58c]"
          >
            Got it
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
