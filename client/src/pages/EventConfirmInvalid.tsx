import SessionShell, {
  SessionBody,
  SessionHeading,
} from "@/components/SessionShell";
import { EVENT_CONFIRM_COPY } from "@/data/eventConfirm";

/** /e/invalid, waar een onbekend of verlopen token op uitkomt. */
export default function EventConfirmInvalid() {
  const C = EVENT_CONFIRM_COPY;
  return (
    <SessionShell documentTitle={C.documentTitle} footerNote={C.footerNote}>
      <SessionHeading greeting={null} title={C.invalid.title} />
      <SessionBody>{C.invalid.body}</SessionBody>
    </SessionShell>
  );
}
