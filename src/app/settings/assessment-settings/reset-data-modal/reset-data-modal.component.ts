import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DashboardService } from '../../../dashboard/dashboard.service';
import { catchError } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { ElectronService } from '../../../electron/electron.service';
import { AppErrorService } from '../../../shared/errors/app-error.service';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { ResetDataService } from './reset-data.service';

@Component({
  selector: 'app-reset-data-modal',
  templateUrl: './reset-data-modal.component.html',
  styleUrls: ['./reset-data-modal.component.css'],
  standalone: false,
  providers: [ResetDataService]
})
export class ResetDataModalComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<boolean>();
  @ViewChild('resetSystemSettingsModal', { static: false }) public resetSystemSettingsModal: ModalDirective;

  resetAll: boolean = false;
  resetAppSettings: boolean = false;
  resetExampleItems: boolean = false;
  resetUserAssessments: boolean = false;
  resetCustomMaterials: boolean = false;
  deleting: boolean = false;
  hidingModal: any;
  constructor(private dashboardService: DashboardService,
    private electronService: ElectronService,
    private dbService: NgxIndexedDBService,
    private appErrorService: AppErrorService,
    private featureFlagService: FeatureFlagService,
    private resetDataService: ResetDataService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.showResetSystemSettingsModal();
  }

  showResetSystemSettingsModal() {
    this.resetSystemSettingsModal.show();
  }

  hideResetSystemSettingsModal() {
    this.dashboardService.updateDashboardData.next(true);
    this.resetSystemSettingsModal.hide();
    this.closeModal.emit(true);
  }

  toggleResetSystemSettingsOption(option: string) {
    switch (option) {
      case "reset-all": {
        this.resetAll = !this.resetAll;
        if (this.resetAll) {
          this.resetAppSettings = true;
          this.resetExampleItems = true;
          this.resetUserAssessments = true;
          this.resetCustomMaterials = true;
        }
        else {
          this.resetAppSettings = false;
          this.resetExampleItems = false;
          this.resetUserAssessments = false;
          this.resetCustomMaterials = false;
        }
        break;
      }
      case "app-settings": {
        this.resetAppSettings = !this.resetAppSettings;
        break;
      }
      case "example-items": {
        this.resetExampleItems = !this.resetExampleItems;
        break;
      }
      case "user-assessments": {
        this.resetUserAssessments = !this.resetUserAssessments;
        break;
      }
      case "custom-materials": {
        this.resetCustomMaterials = !this.resetCustomMaterials;
        break;
      }
      default: {
        break;
      }
    }
    if (option !== 'reset-all' && !(this.resetAppSettings && this.resetExampleItems && this.resetUserAssessments && this.resetCustomMaterials)) {
      this.resetAll = false;
    }
  }

  /**
   * Runs every selected reset, one after another, then closes the modal.
   * Stops at the first failure so later (destructive) steps don't run, and reports the error.
   */
  async resetSystemSettingsAccept() {
    this.deleting = true;
    if (this.resetAll) {
      this.resetAllData();
      return;
    }
    try {
      // Examples first: the only step that can fail on loading data, and it fails before deleting anything.
      if (this.resetExampleItems) {
        await this.resetDataService.restoreExampleItems();
      }
      if (this.resetUserAssessments) {
        await this.resetDataService.deleteUserItems();
      }
      if (this.resetCustomMaterials) {
        await this.resetDataService.deleteCustomMaterials();
      }
      // App settings last, so a failure in an earlier step leaves the user's settings untouched.
      if (this.resetAppSettings) {
        await this.resetDataService.restoreDefaultAppSettings();
      }
    } catch (e) {
      this.deleting = false;
      this.appErrorService.handleAppError('Error restoring system settings', e);
    } finally {
      // One cache reload after every step (and after a failure, since earlier steps may have changed data).
      // It runs last, after the example import's own un-awaited reloads, so screens show the final state.
      await this.resetDataService.refreshCaches();
      // On success "deleting" stays true so the spinner, not the option list, shows while the modal fades out.
      this.hideResetSystemSettingsModal();
    }
  }

  async resetAllData() {
    this.featureFlagService.restoreUserFlagsToDefault();
    try {
      this.dbService.deleteDatabase()
        .pipe(
          catchError(e => this.appErrorService.handleObservableAppError('Error Resetting Data', e
          ))
        )
        .subscribe(
          {
            next: (v) => {
              this.finishDelete();
            },
            error: (e) => {
              console.log(e);
              this.finishDelete();
            },
            complete: () => {
              this.finishDelete();
            }
          });
    } catch (e) {
      this.finishDelete();
    }
  }

  finishDelete() {
    if (this.electronService.isElectron) {
      this.electronService.sendAppRelaunch();
    } else {
      location.reload()
    }
  }


}
