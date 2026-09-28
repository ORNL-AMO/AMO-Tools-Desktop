import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { FsatService } from './fsat.service';
import { Settings } from '../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { FSAT, Modification } from '../shared/models/fans';
import { CompareService } from './compare.service';
import { ConvertFsatService } from './convert-fsat.service';
import * as _ from 'lodash';
import { AnalyticsService } from '../shared/analytics/analytics.service';

@Component({
    selector: 'app-fsat',
    templateUrl: './fsat.component.html',
    styleUrls: ['./fsat.component.css'],
    standalone: false
})
export class FsatComponent implements OnInit, OnDestroy {
  @ViewChild('changeModificationModal', { static: false }) public changeModificationModal: ModalDirective;
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @ViewChild('addNewModal', { static: false }) public addNewModal: ModalDirective;
  @ViewChild('updateUnitsModal', { static: false }) public updateUnitsModal: ModalDirective;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  fsat: FSAT;
  assessment: Assessment;
  mainTab: string;
  stepTab: string;
  settings: Settings;
  modificationExists: boolean;
  modificationIndex: number;
  showAdd: boolean;
  showUpdateUnitsModal: boolean = false;
  oldSettings: Settings;
  modListOpen: boolean = false;
  showWelcomeScreen: boolean = false;
  showExportModal: boolean = false;
  smallScreenTab: string = 'form';

  private subs: Subscription[] = [];

  constructor(
    private fsatService: FsatService,
    private settingsDbService: SettingsDbService,
    private assessmentDbService: AssessmentDbService,
    private compareService: CompareService,
    private cd: ChangeDetectorRef,
    private convertFsatService: ConvertFsatService,
    private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    this.analyticsService.sendEvent('view-fan-assessment');

    this.subs.push(this.fsatService.assessment.subscribe(val => {
      this.assessment = val;
      if (val) {
        this.initModificationState(this.fsatService.fsat.getValue());
      }
    }));
    this.subs.push(this.fsatService.fsat.subscribe(val => {
      this.fsat = val;
    }));
    this.subs.push(this.fsatService.settings.subscribe(val => {
      this.settings = val;
    }));
    this.subs.push(this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    }));
    this.subs.push(this.fsatService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.getContainerHeight();
    }));
    this.subs.push(this.fsatService.assessmentTab.subscribe(() => {
      this.getContainerHeight();
    }));
    this.subs.push(this.fsatService.showUpdateUnitsModal.subscribe(val => {
      this.showUpdateUnitsModal = val.show;
      this.oldSettings = val.oldSettings;
      this.cd.detectChanges();
    }));
    this.subs.push(this.fsatService.smallScreenTab.subscribe(val => {
      this.smallScreenTab = val;
    }));
    this.subs.push(this.fsatService.openNewModal.subscribe(val => {
      this.showAdd = val;
      if (val) {
        this.showAddNewModal();
      }
    }));
    this.subs.push(this.fsatService.openModificationModal.subscribe(val => {
      if (val) {
        this.selectModificationModal();
      }
    }));
    this.subs.push(this.fsatService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    }));
    this.subs.push(this.compareService.selectedModification.subscribe(mod => {
      if (mod && this.fsat) {
        this.modificationIndex = _.findIndex(this.fsat.modifications, (val) => {
          return val.fsat.name === mod.name;
        });
      } else {
        this.modificationIndex = undefined;
      }
      this.fsatService.modificationIndex.next(this.modificationIndex);
    }));
    this.subs.push(this.fsatService.fsatEdited.subscribe(fsat => {
      this.save(fsat);
    }));
    this.subs.push(this.fsatService.settingsEdited.subscribe(settings => {
      this.saveSettings(settings);
    }));
    this.subs.push(this.fsatService.addNewModRequested.subscribe(({ exploreOpportunities }) => {
      const current: FSAT = this.fsatService.fsat.getValue();
      const settings: Settings = this.fsatService.settings.getValue();
      const tmpModification: Modification = this.fsatService.getNewMod(current, settings);
      tmpModification.exploreOpportunities = exploreOpportunities;
      this.saveNewMod(tmpModification);
    }));

    this.checkShowWelcomeScreen();
  }

  ngOnDestroy() {
    this.compareService.baselineFSAT = undefined;
    this.compareService.modifiedFSAT = undefined;
    this.compareService.selectedModification.next(undefined);
    this.subs.forEach(sub => sub.unsubscribe());
    this.fsatService.initData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  private initModificationState(fsat: FSAT) {
    if (!fsat) {
      return;
    }
    if (fsat.modifications && fsat.modifications.length !== 0) {
      this.modificationExists = true;
      this.modificationIndex = 0;
      this.compareService.setCompareVals(fsat, 0);
    } else {
      this.modificationExists = false;
      this.modificationIndex = undefined;
      this.compareService.setCompareVals(fsat);
    }
    this.fsatService.modificationExists.next(this.modificationExists);
    this.fsatService.modificationIndex.next(this.modificationIndex);
  }

  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = this.header.nativeElement.clientHeight;
        let footerHeight = 0;
        if (this.footer) {
          footerHeight = this.footer.nativeElement.clientHeight;
        }
        let containerHeight = contentHeight - headerHeight - footerHeight;
        if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
          containerHeight = containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
        }
        this.fsatService.containerHeight.next(containerHeight);
      }, 100);
    }
  }

  async saveSettings(newSettings: Settings) {
    await firstValueFrom(this.settingsDbService.updateWithObservable(newSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
  }

  showAddNewModal() {
    this.addNewModal.show();
  }
  closeAddNewModal() {
    this.fsatService.openNewModal.next(false);
    this.addNewModal.hide();
  }

  saveNewMod(mod: Modification) {
    const current: FSAT = this.fsatService.fsat.getValue();
    const modifications: Modification[] = [...(current.modifications || []), mod];
    const updated: FSAT = { ...current, modifications };
    this.modificationIndex = modifications.length - 1;
    this.fsatService.modificationIndex.next(this.modificationIndex);
    this.fsatService.setFsat(updated);
    this.closeAddNewModal();
  }

  async save(fsat: FSAT) {
    if (fsat.modifications) {
      if (fsat.modifications.length === 0) {
        this.modificationExists = false;
      } else {
        this.modificationExists = true;
        fsat.modifications.forEach(mod => {
          mod.fsat = this.updateModificationCO2Savings(fsat, mod.fsat);
        });
      }
    } else {
      this.modificationExists = false;
    }
    this.fsatService.modificationExists.next(this.modificationExists);
    this.compareService.setCompareVals(fsat, this.modificationIndex);
    fsat.setupDone = this.checkSetupDone(fsat);
    this.assessment.fsat = (JSON.parse(JSON.stringify(fsat)));
    await firstValueFrom(this.assessmentDbService.updateWithObservable(this.assessment));
    let assessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(assessments);
    this.fsatService.updateData.next(true);
  }

  updateModificationCO2Savings(baselineFsat: FSAT, modFsat: FSAT) {
    if (baselineFsat.fsatOperations.cO2SavingsData) {
      if (!modFsat.fsatOperations.cO2SavingsData) {
        modFsat.fsatOperations.cO2SavingsData = baselineFsat.fsatOperations.cO2SavingsData;
      } else {
        modFsat.fsatOperations.cO2SavingsData.zipcode = baselineFsat.fsatOperations.cO2SavingsData.zipcode;
        modFsat.fsatOperations.cO2SavingsData.eGridSubregion = baselineFsat.fsatOperations.cO2SavingsData.eGridSubregion;
        if (!modFsat.fsatOperations.cO2SavingsData.totalEmissionOutputRate) {
          modFsat.fsatOperations.cO2SavingsData.totalEmissionOutputRate = baselineFsat.fsatOperations.cO2SavingsData.totalEmissionOutputRate;
        }
      }
    }
    return modFsat;
  }

  checkSetupDone(fsat: FSAT): boolean {
    return this.fsatService.checkValid(fsat, true, this.settings).isValid;
  }

  selectModificationModal() {
    this.fsatService.modalOpen.next(true);
    this.modListOpen = true;
    this.changeModificationModal.show();
  }
  closeSelectModification() {
    this.fsatService.modalOpen.next(false);
    this.modListOpen = false;
    this.fsatService.openModificationModal.next(false);
    this.changeModificationModal.hide();
    this.fsatService.updateData.next(true);
  }

  getCanContinue() {
    return this.fsatService.getCanContinueFromStep(this.fsat, this.settings);
  }

  continue() {
    this.fsatService.continue();
  }

  back() {
    this.fsatService.back();
  }

  goToReport() {
    this.fsatService.goToMainTab('report');
  }

  initUpdateUnitsModal(oldSettings: Settings) {
    this.fsatService.showUpdateUnitsModal.next({ show: true, oldSettings });
  }

  closeUpdateUnitsModal(updated?: boolean) {
    if (updated) {
      this.fsatService.stepTab.next('baseline');
    }
    this.fsatService.showUpdateUnitsModal.next({ show: false });
  }

  selectUpdateAction(shouldUpdateData: boolean) {
    if (shouldUpdateData == true) {
      this.updateData();
    } else {
      this.save(this.fsat);
    }
    this.closeUpdateUnitsModal(shouldUpdateData);
  }

  updateData() {
    const converted: FSAT = this.convertFsatService.convertExistingData(this.fsat, this.oldSettings, this.settings);
    converted.existingDataUnits = this.settings.unitsOfMeasure;
    this.fsatService.setFsat(converted);
    this.refreshSettings();
  }

  private refreshSettings() {
    const refreshed: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    if (refreshed) {
      this.fsatService.settings.next(refreshed);
    }
  }

  checkShowWelcomeScreen() {
    if (!this.settingsDbService.globalSettings.disableFansTutorial) {
      this.showWelcomeScreen = true;
      this.fsatService.modalOpen.next(true);
    }
  }

  async closeWelcomeScreen() {
    this.settingsDbService.globalSettings.disableFansTutorial = true;
    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
    this.showWelcomeScreen = false;
    this.fsatService.modalOpen.next(false);
  }

  setSmallScreenTab(selectedTab: string) {
    this.fsatService.smallScreenTab.next(selectedTab);
  }

  closeExportModal(input: boolean) {
    this.fsatService.showExportModal.next(input);
  }
}
