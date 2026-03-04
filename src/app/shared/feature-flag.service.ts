import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  readonly showOperationalImpacts = signal<boolean>(true);

  setOperationalImpactsEnabled(enabled: boolean): void {
    this.showOperationalImpacts.set(enabled);
  }

  isOperationalImpactsEnabled(): boolean {
    return this.showOperationalImpacts();
  }
}
