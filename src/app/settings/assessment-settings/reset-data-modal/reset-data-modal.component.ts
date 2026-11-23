import { Component, OnDestroy, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { ElectronService } from '../../../electron/electron.service';
import { ApplicationInstanceDbService } from '../../../indexedDb/application-instance-db.service';
import { ProgressBarStatus } from '../../../shared/progress-bar/progress-bar.component';
import { environment } from '../../../../environments/environment';
import { ResetDataService } from './reset-data.service';

export type ResetOption = 'app-settings' | 'example-items' | 'user-assessments' | 'custom-materials';
export type ResetStatus = 'selecting' | 'running' | 'succeeded' | 'failed';
export interface ResetDataResult {
  /** True when any reset step ran, so the opener should reload what it shows. */
  dataChanged: boolean;
}

export interface ResetStep {
  option: ResetOption;
  title: string;
  description: string;
  runningLabel: string;
  doneLabel: string;
  /** Share of the progress bar, from timings measured with the real example data (examples ~0.8 s, user items ~0.5 s). */
  progressWeight: number;
  failureGuidance: string;
  run: (service: ResetDataService, onProgress: (fractionDone: number) => void) => Promise<void>;
}

/**
 * The reset options in the order they run.
 * Examples go first: it is the only step that can fail on loading data, and it fails before deleting anything.
 * App settings go last, so a failure in an earlier step leaves the user's settings untouched.
 */
export const RESET_STEPS: ReadonlyArray<ResetStep> = [
  {
    option: 'example-items',
    title: 'Reset Example Items',
    description: 'Replaces MEASUR examples with fresh copies. If the examples folder contains your items, they will be moved to All Assessments.',
    runningLabel: 'Restoring example items',
    doneLabel: 'Example items restored',
    progressWeight: 55,
    failureGuidance: 'Nothing of yours was deleted. Items you saved in the Examples folder may already have moved to All Assessments.',
    run: (service, onProgress) => service.restoreExampleItems(onProgress),
  },
  {
    option: 'user-assessments',
    title: 'Delete User Items',
    description: 'Deletes your assessments, inventories, diagrams, calculators and folders.',
    runningLabel: 'Deleting your items',
    doneLabel: 'Your items deleted',
    progressWeight: 33,
    failureGuidance: 'Some of your items may already be deleted. Running this step again is safe and finishes the job.',
    run: service => service.deleteUserItems(),
  },
  {
    option: 'custom-materials',
    title: 'Delete Custom Materials',
    description: 'Deletes materials you added. Built-in materials are kept.',
    runningLabel: 'Deleting custom materials',
    doneLabel: 'Custom materials deleted',
    progressWeight: 10,
    failureGuidance: 'Some custom materials may already be deleted. Running this step again is safe and finishes the job.',
    run: service => service.deleteCustomMaterials(),
  },
  {
    option: 'app-settings',
    title: 'Reset Application Settings',
    description: 'Restores default units, costs and other settings.',
    runningLabel: 'Restoring application settings',
    doneLabel: 'Application settings restored',
    progressWeight: 2,
    failureGuidance: 'Your settings may not have been reset. Running this step again is safe.',
    run: service => service.restoreDefaultAppSettings(),
  },
];

/**
 * The order options are listed in. It matches the modal's original layout so returning users don't click the wrong row
 * out of habit; it differs from the run order in RESET_STEPS on purpose.
 */
export const RESET_OPTION_DISPLAY_ORDER: ReadonlyArray<ResetOption> = ['app-settings', 'example-items', 'user-assessments', 'custom-materials'];

/** How long the success view stays up before the modal closes itself. */
export const RESET_SUCCESS_CLOSE_DELAY_MS = 5000;

@Component({
  selector: 'app-reset-data-modal',
  templateUrl: './reset-data-modal.component.html',
  styleUrls: ['./reset-data-modal.component.css'],
  standalone: false,
  providers: [ResetDataService]
})
export class ResetDataModalComponent implements OnDestroy {
  private dialogRef: DialogRef<ResetDataResult> = inject<DialogRef<ResetDataResult>>(DialogRef);
  private router: Router = inject(Router);
  private resetDataService: ResetDataService = inject(ResetDataService);
  electronService: ElectronService = inject(ElectronService);

  /** Options in display order (see RESET_OPTION_DISPLAY_ORDER). */
  readonly displayedSteps: ReadonlyArray<ResetStep> = RESET_OPTION_DISPLAY_ORDER.map(option => RESET_STEPS.find(step => step.option === option));
  readonly appVersion: string = environment.version;

  resetAll: boolean = false;
  selectedOptions: Set<ResetOption> = new Set<ResetOption>();
  status: ResetStatus = 'selecting';

  progressPercent: number = 0;
  progressBarStatus: ProgressBarStatus = 'active';
  progressLabel: string = '';
  completedSteps: Array<ResetStep> = [];
  /** Steps still to run. The first one is running, or failed when status is 'failed'. */
  pendingSteps: Array<ResetStep> = [];
  closeCountdownSeconds: number = RESET_SUCCESS_CLOSE_DELAY_MS / 1000;
  /** Undefined on web, where automatic backup isn't available. */
  isAutomaticBackupOn: boolean | undefined;
  /** True while "Reset All Data" waits for other MEASUR tabs or windows to close. The modal can be closed then. */
  resetAllBlocked: boolean = false;

  // Derived: setInterval returns a number in the browser but NodeJS.Timeout under Node typings, and no shared named type exists.
  private closeCountdownTimer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    if (this.electronService.isElectron) {
      this.isAutomaticBackupOn = inject(ApplicationInstanceDbService).applicationInstanceData.getValue()?.isAutomaticBackupOn === true;
    }
  }

  ngOnDestroy() {
    this.stopCloseCountdown();
  }

  /** @returns The step that failed, or undefined unless the reset failed. */
  get failedStep(): ResetStep | undefined {
    return this.status === 'failed' ? this.pendingSteps[0] : undefined;
  }

  /** @returns The selected steps after the failed one, which did not run. */
  get stepsNotRun(): Array<ResetStep> {
    return this.pendingSteps.slice(1);
  }

  /** @returns The Reset button's text: "Reset All Data", or the number of options selected. */
  get resetButtonLabel(): string {
    if (this.resetAll) {
      return 'Reset All Data';
    }
    const count: number = this.selectedOptions.size;
    return count === 1 ? 'Reset 1 option' : `Reset ${count} options`;
  }

  /**
   * @param option A reset option.
   * @returns True when the option is selected.
   */
  isSelected(option: ResetOption): boolean {
    return this.selectedOptions.has(option);
  }

  /**
   * Checks or unchecks an option. "reset-all" selects or clears all four; unchecking any one turns Reset All off.
   * @param option The option row the user clicked.
   */
  toggleResetSystemSettingsOption(option: ResetOption | 'reset-all') {
    if (option === 'reset-all') {
      this.resetAll = !this.resetAll;
      this.selectedOptions = this.resetAll ? new Set(RESET_STEPS.map(step => step.option)) : new Set<ResetOption>();
      return;
    }
    if (this.selectedOptions.has(option)) {
      this.selectedOptions.delete(option);
    } else {
      this.selectedOptions.add(option);
    }
    // "Reset All" deletes the whole database (contacts, backup settings, logs too), so it is only on when chosen explicitly.
    // Checking the four options one by one runs the four steps instead.
    if (this.selectedOptions.size < RESET_STEPS.length) {
      this.resetAll = false;
    }
  }

  /** Runs every selected reset, one after another, showing progress. */
  async resetSystemSettingsAccept() {
    if (this.resetAll) {
      this.status = 'running';
      this.progressPercent = 100;
      this.progressLabel = 'Deleting all data. MEASUR will restart.';
      await this.resetAllData();
      return;
    }
    this.completedSteps = [];
    this.pendingSteps = RESET_STEPS.filter(step => this.selectedOptions.has(step.option));
    await this.runPendingSteps();
  }

  /** Re-runs the failed step and the steps after it. Every step is safe to run again. */
  async retryFailedSteps() {
    await this.runPendingSteps();
  }

  /** Closes the modal, unless a reset is still running (a blocked "Reset All Data" can be closed: it finishes on its own). */
  close() {
    if (this.status === 'running' && !this.resetAllBlocked) {
      return;
    }
    this.stopCloseCountdown();
    this.dialogRef.close({ dataChanged: this.status !== 'selecting' });
  }

  /** Closes the modal without resetting and opens Data Storage and Backup. */
  openDataBackupPage() {
    this.close();
    this.router.navigate(['/data-and-backup']);
  }

  /**
   * Runs `pendingSteps` in order. Stops at the first failure and keeps the modal open with guidance.
   * Caches reload once at the end (also after a failure, since earlier steps may have changed data).
   */
  private async runPendingSteps() {
    this.status = 'running';
    this.progressBarStatus = 'active';
    const totalWeight: number = [...this.completedSteps, ...this.pendingSteps].reduce((sum, step) => sum + step.progressWeight, 0);
    const completedWeight = () => this.completedSteps.reduce((sum, step) => sum + step.progressWeight, 0);
    this.progressPercent = 100 * completedWeight() / totalWeight;

    let failed: boolean = false;
    while (this.pendingSteps.length > 0) {
      const step: ResetStep = this.pendingSteps[0];
      this.progressLabel = `${step.runningLabel}...`;
      try {
        await step.run(this.resetDataService, fractionDone => {
          this.progressPercent = 100 * (completedWeight() + step.progressWeight * fractionDone) / totalWeight;
        });
      } catch (error) {
        console.error(`Reset step "${step.option}" failed`, error);
        failed = true;
        break;
      }
      this.completedSteps.push(step);
      this.pendingSteps.shift();
      this.progressPercent = 100 * completedWeight() / totalWeight;
    }

    try {
      await this.resetDataService.refreshCaches();
    } catch (error) {
      // The data is already saved; only what screens show until the next reload is stale.
      console.error('Reloading data after reset failed', error);
    }

    if (failed) {
      this.status = 'failed';
      this.progressBarStatus = 'error';
      this.progressLabel = `${this.pendingSteps[0].title} failed`;
    } else {
      this.status = 'succeeded';
      this.progressBarStatus = 'complete';
      this.progressPercent = 100;
      this.progressLabel = 'Reset complete';
      this.startCloseCountdown();
    }
  }

  private startCloseCountdown() {
    this.closeCountdownSeconds = RESET_SUCCESS_CLOSE_DELAY_MS / 1000;
    this.closeCountdownTimer = setInterval(() => {
      this.closeCountdownSeconds--;
      if (this.closeCountdownSeconds <= 0) {
        this.close();
      }
    }, 1000);
  }

  private stopCloseCountdown() {
    clearInterval(this.closeCountdownTimer);
    this.closeCountdownTimer = undefined;
  }

  /** Deletes the whole database, then restarts MEASUR. If another tab or window holds it back, explains that and allows closing. */
  async resetAllData() {
    try {
      await this.resetDataService.deleteAllData(() => this.resetAllBlocked = true);
    } catch (error) {
      // As before: restart anyway, so the user lands in a working app rather than a stuck window.
      console.error('Deleting all data failed', error);
    }
    this.finishDelete();
  }

  finishDelete() {
    if (this.electronService.isElectron) {
      this.electronService.sendAppRelaunch();
    } else {
      location.reload()
    }
  }
}
