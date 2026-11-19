# Bank Request (Permintaan Bank Baru) — Design

Date: 2026-11-19
Scope: Vendor registration page (`src/app/pages/auth/register.page.*`)

## Goal

When a vendor cannot find their bank in the bank-name search, they can submit a new bank
request. The requested bank is used as the selected bank for this registration, with a
warning that validation may take longer.

## User Flow

1. User types a bank name that does not match any registered bank.
2. The autocomplete dropdown shows:
   - muted text "Bank tidak terdaftar"
   - an action row: `+ Permintaan Bank Baru: "<typed query>"`
3. Clicking the action closes the dropdown and opens the "Permintaan Bank Baru" modal with
   the bank name prefilled.
4. Modal shows a warning banner with the exact required wording (see Texts).
5. All fields are mandatory: Nama bank, Negara, Wilayah, Alamat, Kantor Cabang, Kota,
   Kode SWIFT.
6. Saving stores the request (in-memory), auto-selects the bank in the form, and closes the
   modal.
7. Under the bank-name field a panel shows the requested bank, a "Belum terdaftar" badge,
   and two actions:
   - **Tampilkan** — reopens the same modal in edit mode, prefilled and editable.
   - **Hapus** — opens a confirmation alert dialog; confirming removes the request and
     clears the selected bank.
8. Only one bank request can exist per registration; a new request replaces the old one.

## Validation

- Every request field is required.
- Kode SWIFT: 8 or 11 alphanumeric characters (uppercased automatically).
- Field errors appear after touch/submit, in the active language.

## Architecture

- `UiAutocomplete` gains an optional projected content slot
  `[autocompleteEmptyAction]`, rendered only in the empty-results panel. The projected
  action carries `pointer-events-auto` because the empty panel itself is
  `pointer-events-none`.
- New standalone component `BankRequestDialog` (`bank-request-dialog.ts`) owns the request
  form, validation, edit mode, and emits a saved `BankRequest`. It receives localized
  labels through a required `texts` input and country options from the parent.
- `RegisterPage` owns the single `bankRequest` signal, opens the dialog (create/edit),
  applies the saved request to `vendorForm.bankName`, and handles deletion through a
  `UiAlertDialog`.
- No HTTP layer exists in this project, so data is in-memory only.

## Data Model

```ts
interface BankRequest {
  id: string;
  name: string;
  countryIso: string;
  region: string;
  address: string;
  branch: string;
  city: string;
  swiftCode: string;
}
```

## UI Notes

- Request dialog uses `UiDialog` with `panelClass="max-w-lg"`.
- Warning uses `div uiAlert data-variant="warning"` with a `triangle-alert` icon.
- Saved panel uses warning-soft styling to signal "not yet validated".
- Delete confirmation uses `UiAlertDialog` with destructive confirm variant.
- All new copy exists in both Indonesian and English (`TEXTS.id` / `TEXTS.en`).

## Testing

- Unit test `bank-request-dialog.spec.ts`: required validation blocks save, valid input
  emits a normalized (uppercased SWIFT) request, edit mode preserves the id and prefills.
