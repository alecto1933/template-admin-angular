# Bank Request Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let vendors request a bank that is not registered, use it as the selected bank, view/edit it, and delete it with confirmation.

**Architecture:** Add an optional empty-state action slot to `UiAutocomplete`; create a standalone `BankRequestDialog` component that owns the 7-field request form; `RegisterPage` stores the single request in a signal and wires create/edit/delete.

**Tech Stack:** Angular 22 standalone components, signals, Reactive Forms, Tailwind CSS 4, Vitest.

## Global Constraints

- Copy must exist in both Indonesian and English in `TEXTS`.
- All request fields are mandatory; SWIFT is 8 or 11 alphanumeric characters, uppercased.
- Only one bank request per registration; new request replaces the old one.
- No HTTP layer: in-memory only.
- Follow existing patterns: `UiDialog`, `UiSelect`, `UiButton`, `uiInput`, `uiLabel`, `ui-error`, `ui-help`.

---

### Task 1: Autocomplete empty-state action slot

**Files:**

- Modify: `src/app/shared/ui/autocomplete/autocomplete.ts`

**Interfaces:**

- Produces: projected content slot `[autocompleteEmptyAction]` rendered only when there are no options and no loading.

- [ ] **Step 1:** In the empty branch, render `<ng-content select="[autocompleteEmptyAction]" />` after the empty text.
- [ ] **Step 2:** Keep `pointer-events-none` on the panel; projected buttons must add `pointer-events-auto` themselves.
- [ ] **Step 3:** Run `npm run build` and confirm no template errors.

### Task 2: Bank request dialog component

**Files:**

- Create: `src/app/pages/auth/bank-request-dialog.ts`
- Create: `src/app/pages/auth/bank-request-dialog.spec.ts`

**Interfaces:**

- Produces:
  - `interface BankRequest { id: string; name: string; countryIso: string; region: string; address: string; branch: string; city: string; swiftCode: string; }`
  - `interface BankRequestTexts { titleCreate; titleEdit; warningTitle; warning; fieldName; fieldCountry; fieldRegion; fieldAddress; fieldBranch; fieldCity; fieldSwift; swiftHint; errRequired; errSwift; save; cancel; }`
  - `BankRequestDialog.open(initial?: Partial<BankRequest> | null): void`
  - `BankRequestDialog.saved: output<BankRequest>()`

- [ ] **Step 1:** Write failing tests for required validation and normalized save.
- [ ] **Step 2:** Run `npm test -- --run bank-request-dialog` and confirm failure.
- [ ] **Step 3:** Implement the component: reactive form, uppercase SWIFT, edit mode via `initial.id`, warning banner, emitted request.
- [ ] **Step 4:** Run tests until green.
- [ ] **Step 5:** Commit.

### Task 3: Register page integration

**Files:**

- Modify: `src/app/pages/auth/register.page.ts`
- Modify: `src/app/pages/auth/register.page.html`

**Interfaces:**

- Consumes: `BankRequestDialog`, `BankRequest`, `UiAlertDialog`, `UiBadge`.

- [ ] **Step 1:** Add all ID/EN copy keys for the feature to `TEXTS`.
- [ ] **Step 2:** Add `bankRequest` signal, dialog viewChildren, country options, and `bankRequestTexts` computed.
- [ ] **Step 3:** Project the "Permintaan Bank Baru: query" button into the autocomplete; open the dialog on click.
- [ ] **Step 4:** On save: set the request, set `vendorForm.bankName` to the request id, and set `bankResults` to the request option so the input shows its name.
- [ ] **Step 5:** Render the saved-request panel (name, country · city, badge, Tampilkan, Hapus) under the field.
- [ ] **Step 6:** Wire edit (reopen dialog prefilled) and delete (alert dialog, clears state).
- [ ] **Step 7:** Exclude requested bank ids from static `BANKS` lookup in the `bankName` subscription.
- [ ] **Step 8:** Build, lint, and verify manually.

### Task 4: Verification

- [ ] Run `npm run build`.
- [ ] Run `npm test -- --run`.
- [ ] Run `npx prettier --check` on touched files.
