// Shared by the handlers in this directory that interpolate visitor input into
// a mail subject.
//
// A subject is a header field, so a CR/LF inside a name or company lets a
// visitor append headers of their own ("Marco\nBcc: someone@elsewhere.nl").
// z.string().trim() only strips whitespace at the edges, so a newline in the
// middle of the value survives validation and reaches the header.
//
// HTML escaping is deliberately NOT applied here: that is the encoding for the
// mail body, and in a subject it would only mangle legitimate names ("Acme &
// Co" arriving as "Acme &amp; Co"). What matters for a header is that no line
// break or control character survives.
//
// The underscore prefix keeps this file out of Vercel's function routing (see
// .vercelignore), and the importing handlers need the .js extension: api/ is
// plain ESM without the bundler aliases the client has.

/** All C0/C1 control characters, so CR, LF, TAB and DEL included. */
const CONTROL_CHARS = /\p{Cc}+/gu;

export function sanitizeSubject(subject: string): string {
  return subject.replace(CONTROL_CHARS, " ").trim();
}
