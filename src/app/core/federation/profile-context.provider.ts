import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { PROFILE_CONTEXT, ProfileContext } from '@/core/federation/federation.contract';
import { TranslationService } from '@/core/i18n/translation.service';
import { PreferencesService } from '@/core/state/preferences.service';
import { SessionService } from '@/core/state/session.service';

/**
 * Provides the profile-management contract through the shared string token.
 *
 * Readers stay live because they delegate to the host signals instead of
 * snapshotting their current values. The remote resolves the token with
 * `Injector.get(PROFILE_CONTEXT, null)`.
 */
export function provideProfileContext(): Provider {
  return {
    provide: PROFILE_CONTEXT,
    useFactory: (
      i18n: TranslationService,
      preferences: PreferencesService,
      session: SessionService,
    ): ProfileContext => ({
      lang: () => i18n.lang(),
      theme: () => preferences.theme(),
      user: () => session.user(),
      assetBase: environment.remoteAssetBase,
    }),
    deps: [TranslationService, PreferencesService, SessionService],
  };
}
