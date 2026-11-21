/**
 * Global test setup.
 *
 * jsdom ships <dialog> but historically did not implement showModal()/close(),
 * and its close() does not always dispatch the `close` event synchronously.
 * Native dialogs in this app rely on that event, so provide a deterministic
 * implementation for every test file.
 */
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement): void {
    this.open = true;
  };

  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement): void {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}
