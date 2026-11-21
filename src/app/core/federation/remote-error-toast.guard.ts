import { Injectable } from '@angular/core';

/**
 * Ensures the remote failure toast is shown once per app instance.
 *
 * The error page can be re-created when the user navigates away and back, so a
 * component-level flag is not enough. A root-provided guard keeps the toast from
 * piling up on re-entry; a full retry reloads the document and resets it.
 */
@Injectable({ providedIn: 'root' })
export class RemoteErrorToastGuard {
  private shown = false;

  /** Returns true only for the first caller. */
  claim(): boolean {
    if (this.shown) {
      return false;
    }
    this.shown = true;
    return true;
  }
}
