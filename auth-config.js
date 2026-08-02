// ============================================================================
// PASSWORD CONFIG — shared by transactions.html and cashflow.html
// ============================================================================
// This is the ONE place to change the password for those two protected pages.
// The password itself is never stored in plain text (so it doesn't sit in
// public GitHub source) — only its SHA-256 hash is stored here, and each page
// compares the hash of what you type against this value.
//
// HOW TO CHANGE THE PASSWORD:
// 1. Open this page's browser console (press F12, click "Console") on any
//    page of this site — or just open a new blank browser tab and press F12.
// 2. Paste this single line, replacing NewPasswordHere with your new password,
//    and press Enter:
//
//    crypto.subtle.digest('SHA-256', new TextEncoder().encode('NewPasswordHere')).then(b=>console.log(Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')))
//
// 3. It will print a long hex string (the hash). Copy it.
// 4. Paste that hex string as the value of PW_HASH below (replacing the
//    current value), save this file, and push it to your repo.
// 5. Both transactions.html and cashflow.html read from this file, so
//    updating it here updates the password everywhere — no other file needs
//    to change.
//
// Current password (as of when this was set up): Rajan@991
// ============================================================================

const PW_HASH = 'aae4f67aa77a61416f948ac2927c83f5d8dd2c408f9c5ace8d4171c54db0789c';
