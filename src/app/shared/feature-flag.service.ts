import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { BrowserStorageAvailable } from './browser-storage.service';
import { FEATURE_FLAGS_KEY } from './models/app';

const DEFAULT_FEATURE_FLAGS = {
  showOperationalImpacts: false,
};

/**
 * Service to manage feature flags controls by dev team or users across the application. Currently includes:
 * - showOperationalImpacts: Controls the visibility of operational impacts features, including CO2 impacts and savings.
 * - NOTE currently implemented using local storage to get around settings module issues. Could be managed elsewhere in the future
 */

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private localStorageService: LocalStorageService = inject(LocalStorageService);
  readonly showOperationalImpacts = signal<boolean>(DEFAULT_FEATURE_FLAGS.showOperationalImpacts);

  setFeatureFlags(browserStorageOptions: BrowserStorageAvailable): void {
    if (browserStorageOptions.localStorage) {
      try {
        const showFeatures = this.localStorageService.retrieve(FEATURE_FLAGS_KEY) || [];
        this.setShowOperationalImpacts(showFeatures.includes('showOperationalImpacts'));
      } catch (e) {
        this.setShowOperationalImpacts(DEFAULT_FEATURE_FLAGS.showOperationalImpacts);
      }
    } else {
      this.setShowOperationalImpacts(DEFAULT_FEATURE_FLAGS.showOperationalImpacts);
    }
  }

  setShowOperationalImpacts(enabled: boolean): void {
    this.localStorageService.store(FEATURE_FLAGS_KEY, enabled ? ['showOperationalImpacts'] : []);
    this.showOperationalImpacts.set(enabled);
  }

  restoreUserFlagsToDefault(): void {
    this.localStorageService.clearUserControlledKey(FEATURE_FLAGS_KEY);
    this.setShowOperationalImpacts(DEFAULT_FEATURE_FLAGS.showOperationalImpacts);
  }
}
