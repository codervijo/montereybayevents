/**
 * Footer email capture.
 *
 * TODO(operator): set EMAIL_ENDPOINT to the real subscribe endpoint before this
 * ships. Until it is a non-empty URL the footer form does not submit anywhere —
 * it blocks the POST and tells the visitor signups are not open yet, so nobody
 * types an address into a black hole. Nothing else needs changing: the form
 * POSTs `{"email": "..."}` as JSON to whatever URL is set here.
 *
 * Candidates, none chosen yet: a Cloudflare Worker route on this zone, a Buttondown
 * or Kit (ConvertKit) form-submit URL, or a Formspree endpoint.
 */
export const EMAIL_ENDPOINT = "";

/** Footer form label — the whole promise, in one line. */
export const EMAIL_PITCH = "Weekly Central Coast events, one email.";
