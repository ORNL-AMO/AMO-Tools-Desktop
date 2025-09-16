import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { SsmtService } from './ssmt.service';
import { Settings } from '../shared/models/settings';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { SSMT, Modification, BoilerInput, HeaderInput, TurbineInput, SsmtValid } from '../shared/models/steam/ssmt';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CompareService } from './compare.service';
import * as _ from 'lodash';
import { AssessmentService } from '../dashboard/assessment.service';
import { SettingsService, SteamImperialDefaults, SteamMetricDefaults } from '../settings/settings.service';
import { ConvertSsmtService } from './convert-ssmt.service';
import { EGridService } from '../shared/helper-services/e-grid.service';
import { SteamService } from '../calculator/steam/steam.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { SnackbarService } from '../shared/snackbar-notification/snackbar.service';

@Component({
    selector: 'app-ssmt',
    templateUrl: './ssmt.component.html',
    styleUrls: ['./ssmt.component.css'],
    standalone: false
})
export class SsmtComponent implements OnInit {
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }
  @ViewChild('addNewModal', { static: false }) public addNewModal: ModalDirective;
  @ViewChild('changeModificationModal', { static: false }) public changeModificationModal: ModalDirective;
  @ViewChild('updateUnitsModal', { static: false }) public updateUnitsModal: ModalDirective;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  showUpdateUnitsModal: boolean = false;
  oldSettings: Settings;

  stepTabs: Array<string> = [
    'baseline',
    'operations',
    'boiler',
    'header',
    'turbine'
  ];

  containerHeight: number;
  assessment: Assessment;
  _ssmt: SSMT;
  mainTab: string;
  mainTabSubscription: Subscription;
  steamModelerErrorSubscription: Subscription;
  stepTab: string;
  stepTabSubscription: Subscription;
  modelTabSubscription: Subscription;
  modelTab: string;
  assessmentTabSubscription: Subscription;
  assessmentTab: string;
  settings: Settings;
  modificationExists: boolean;
  modificationIndex: number;

  addNewModificationSubscription: Subscription;
  openModificationSelectSubscription: Subscription;
  showAddModal: boolean;
  selectedModSubscription: Subscription;
  isModalOpen: boolean;
  modalOpenSubscription: Subscription;
  stepTabIndex: number;

  calcTab: string;
  calcTabSubscription: Subscription;

  saveSsmtSub: Subscription;
  modListOpen: boolean = false;

  ssmtOptions: Array<any>;
  selectedSSMT: { ssmt: SSMT, name };

  sankeyLabelStyle: string = 'both';
  showSankeyLabelOptions: boolean;
  showWelcomeScreen: boolean = false;
  modificationModalOpen: boolean = false;
  smallScreenTab: string = 'form';
  showExportModal: boolean = false;
  showExportModalSub: Subscription;
  constructor(
    private egridService: EGridService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ssmtService: SsmtService,
    private settingsDbService: SettingsDbService,
    private assessmentDbService: AssessmentDbService,
    private compareService: CompareService,
    private assessmentService: AssessmentService,
    private cd: ChangeDetectorRef,
    private settingsService: SettingsService,
    private steamService: SteamService,
    private convertSsmtService: ConvertSsmtService,
    private analyticsService: AnalyticsService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit() {
    this.analyticsService.sendEvent('view-steam-assessment');
    this.egridService.getAllSubRegions();
    this.activatedRoute.params.subscribe(params => {
      this.assessment = this.assessmentDbService.findById(parseInt(params['id']))
      if (!this.assessment || (this.assessment && this.assessment.type !== 'SSMT')) {
        this.router.navigate(['/not-found'], { queryParams: { measurItemType: 'assessment' } });
      } else {
        this.assessment.ssmt = (JSON.parse(JSON.stringify(this.assessment.ssmt)));
        if (this.assessment.ssmt.modifications) {
          if (this.assessment.ssmt.modifications.length !== 0) {
            this.modificationExists = true;
            this.modificationIndex = 0;
            this.compareService.setCompareVals(this.assessment.ssmt, 0);
          } else {
            this.modificationExists = false;
            this.compareService.setCompareVals(this.assessment.ssmt);
          }
        } else {
          this.assessment.ssmt.modifications = new Array<Modification>();
          this.modificationExists = false;
          this.compareService.setCompareVals(this.assessment.ssmt);
        }
        this._ssmt = (JSON.parse(JSON.stringify(this.assessment.ssmt)));
        this.getSettings();
        this.initSankeyList();
        let tmpTab = this.assessmentService.getStartingTab();
        if (tmpTab) {
          this.ssmtService.mainTab.next(tmpTab);
        }
      }
    });
    this.subscribeTabs();

    this.steamModelerErrorSubscription = this.steamService.steamModelerError.subscribe(error => {
      if (error) {
        this.snackbarService.setSnackbarMessage(`Invalid Inputs: ${error}`, 'danger');
      }
    });
    
    this.addNewModificationSubscription = this.ssmtService.openNewModificationModal.subscribe(val => {
      this.showAddModal = val;
      if (val) {
        this.showAddNewModal();
      }
    });

    this.selectedModSubscription = this.compareService.selectedModification.subscribe(mod => {
      if (mod && this._ssmt) {
        this.modificationIndex = _.findIndex(this._ssmt.modifications, (val) => {
          return val.ssmt.name === mod.name;
        });
      } else {
        this.modificationIndex = undefined;
      }
    });

    this.openModificationSelectSubscription = this.ssmtService.openModificationSelectModal.subscribe(val => {
      this.modificationModalOpen = val;
      if (val) {
        this.selectModificationModal();
      }
    });

    this.modalOpenSubscription = this.ssmtService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    this.calcTabSubscription = this.ssmtService.calcTab.subscribe(val => {
      this.calcTab = val;
    });

    this.saveSsmtSub = this.ssmtService.saveSSMT.subscribe(newSSMT => {
      if (newSSMT) {
        this.saveSsmt(newSSMT);
      }
    });

    this.showExportModalSub = this.ssmtService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    });

    this.checkShowWelcomeScreen();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  ngOnDestroy() {
    this.mainTabSubscription.unsubscribe();
    this.stepTabSubscription.unsubscribe();
    this.modelTabSubscription.unsubscribe();
    this.assessmentTabSubscription.unsubscribe();
    this.selectedModSubscription.unsubscribe();
    this.openModificationSelectSubscription.unsubscribe();
    this.modalOpenSubscription.unsubscribe();
    this.addNewModificationSubscription.unsubscribe();
    this.ssmtService.mainTab.next('baseline');
    this.ssmtService.stepTab.next('baseline');
    this.ssmtService.assessmentTab.next('explore-opportunities');
    this.ssmtService.steamModelTab.next('operations');
    this.calcTabSubscription.unsubscribe();
    this.ssmtService.saveSSMT.next(undefined);
    this.saveSsmtSub.unsubscribe();
    this.steamModelerErrorSubscription.unsubscribe();
    this.showExportModalSub.unsubscribe();
  }

  subscribeTabs() {
    this.mainTabSubscription = this.ssmtService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    });
    this.stepTabSubscription = this.ssmtService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.stepTabIndex = _.findIndex(this.stepTabs, function (tab) { return tab === val; });

      this.getContainerHeight();
    });
    this.modelTabSubscription = this.ssmtService.steamModelTab.subscribe(val => {
      this.modelTab = val;
      this.getContainerHeight();
    });
    this.assessmentTabSubscription = this.ssmtService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
      this.getContainerHeight();
    });
  }

  async saveSettings(newSettings: Settings) {
    this.settings = newSettings;
    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
  }

  initSankeyList() {
    this.ssmtOptions = new Array<any>();
    this.ssmtOptions.push({ name: 'Baseline', ssmt: this.assessment.ssmt });
    this.selectedSSMT = this.ssmtOptions[0];
    this.showSankeyLabelOptions = ((this.selectedSSMT.ssmt.name == 'Baseline' || this.selectedSSMT.ssmt.name == null) && this.selectedSSMT.ssmt != undefined) || (this.selectedSSMT.ssmt.valid && this.selectedSSMT.ssmt.valid.isValid);
    if (this._ssmt.modifications) {
      this._ssmt.modifications.forEach(mod => {
        this.ssmtOptions.push({ name: mod.ssmt.name, ssmt: mod.ssmt });
      });
    }
  }

  setSankeyLabelStyle(style: string) {
    this.sankeyLabelStyle = style;
  }

  getSettings() {
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    if (!this.settings) {
      let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, false);
      this.addSettings(settings);
    }
  }

  async save() {
    this._ssmt = this.updateModificationWithBaseline(this._ssmt);
    if (this._ssmt.modifications) {
      if (this._ssmt.modifications.length === 0) {
        this.modificationExists = false;
      } else {
        this.modificationExists = true;
      }
    } else {
      this.modificationExists = false;
    }
    this.checkSetupDone();
    this.compareService.setCompareVals(this._ssmt, this.modificationIndex);
    this.assessment.ssmt = (JSON.parse(JSON.stringify(this._ssmt)));
    this.initSankeyList();

    await firstValueFrom(this.assessmentDbService.updateWithObservable(this.assessment));
    let assessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(assessments);
    this.ssmtService.updateData.next(true);
  }

  updateModificationWithBaseline(ssmt: SSMT) {
    if (ssmt.modifications) {
      ssmt.modifications.forEach(mod => {
        if (ssmt.co2SavingsData) {
          if (!mod.ssmt.co2SavingsData) {
            mod.ssmt.co2SavingsData = ssmt.co2SavingsData;
          } else {
            mod.ssmt.co2SavingsData.zipcode = ssmt.co2SavingsData.zipcode;
            mod.ssmt.co2SavingsData.eGridSubregion = ssmt.co2SavingsData.eGridSubregion;
            if (mod.ssmt.co2SavingsData.totalEmissionOutputRate === undefined) {
              mod.ssmt.co2SavingsData.totalEmissionOutputRate = ssmt.co2SavingsData.totalEmissionOutputRate;
            }
            if (mod.ssmt.co2SavingsData.totalFuelEmissionOutputRate === undefined) {
              mod.ssmt.co2SavingsData.totalFuelEmissionOutputRate = ssmt.co2SavingsData.totalFuelEmissionOutputRate;
            }
          }
        }
        mod.ssmt.generalSteamOperations.sitePowerImport = ssmt.generalSteamOperations.sitePowerImport;
      });
    }
    return ssmt;
  }

  checkSetupDone() {
    let ssmtValid: SsmtValid = this.ssmtService.checkValid(this._ssmt, this.settings);
    this._ssmt.setupDone = ssmtValid.isValid;
  }

  saveBoiler(boilerData: BoilerInput) {
    this._ssmt.boilerInput = boilerData;
    this.save();
  }

  saveHeaderData(headerInput: HeaderInput) {
    this._ssmt.headerInput = headerInput;
    this.save();
  }

  saveTurbineData(turbineData: TurbineInput) {
    this._ssmt.turbineInput = turbineData;
    this.save();
  }

  saveSetup(newSSMT: SSMT) {
    this.saveSsmt(newSSMT);
  }

  saveSsmt(newSSMT: SSMT) {
    this._ssmt = newSSMT;
    this.save();
  }

  back() {
    if (this.mainTab === 'baseline') {
      if (this.stepTab !== 'baseline') {
        let assessmentTabIndex: number = this.stepTabIndex - 1;
        let nextTab: string = this.stepTabs[assessmentTabIndex];
        this.ssmtService.stepTab.next(nextTab);
      }
    } else if (this.mainTab === 'assessment') {
      this.ssmtService.mainTab.next('baseline');
    }
  }

  goToReport() {
    this.ssmtService.mainTab.next('report');
  }

  continue() {
    if (this.stepTab === 'turbine') {
      this.ssmtService.mainTab.next('assessment');
    } else {
      let assessmentTabIndex: number = this.stepTabIndex + 1;
      let nextTab: string = this.stepTabs[assessmentTabIndex];
      this.ssmtService.stepTab.next(nextTab);
    }
  }

  getCanContinue() {
    let ssmtValid: SsmtValid = this.ssmtService.checkValid(this._ssmt, this.settings);

    if (this.stepTab === 'baseline') {
      return true;
    } else if (this.stepTab === 'operations') {
      if (ssmtValid.operationsValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab === 'boiler') {
      if (ssmtValid.boilerValid && ssmtValid.operationsValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab === 'header') {
      if (ssmtValid.boilerValid && ssmtValid.headerValid && ssmtValid.operationsValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab === 'turbine') {
      if (ssmtValid.boilerValid && ssmtValid.headerValid && ssmtValid.turbineValid && ssmtValid.operationsValid) {
        return true;
      } else {
        return false;
      }
    }
  }

  showAddNewModal() {
    this.addNewModal.show();
  }

  closeAddNewModal() {
    this.ssmtService.modalOpen.next(false);
    this.ssmtService.openNewModificationModal.next(false);
    this.addNewModal.hide();
  }

  saveNewMod(modification: Modification) {
    this._ssmt.modifications.push(modification);
    this.modificationIndex = this._ssmt.modifications.length - 1;
    this.save();
    this.closeAddNewModal();
  }

  selectModificationModal() {
    this.ssmtService.modalOpen.next(true);
    this.modListOpen = true;
    this.changeModificationModal.show();
  }

  closeSelectModification() {
    this.ssmtService.modalOpen.next(false);
    this.ssmtService.openModificationSelectModal.next(false);
    this.changeModificationModal.hide();
    this.modListOpen = false;
    this.ssmtService.updateData.next(true);
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
        this.containerHeight = contentHeight - headerHeight - footerHeight;
        if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
          this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
        }
      }, 100);
    }
  }

  async addSettings(settings: Settings) {
    let newSettings: Settings = this.settingsService.getNewSettingFromSetting(settings);
    newSettings = this.setSettingsUnitType(newSettings);
    newSettings.assessmentId = this.assessment.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(newSettings));
    let updatedSettings = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);

  }

  setSettingsUnitType(settings: Settings): Settings {
    let hasImperialUnits: boolean = this.checkHasMatchingUnitTypes(settings, SteamImperialDefaults);
    let hasMetricUnits: boolean = this.checkHasMatchingUnitTypes(settings, SteamMetricDefaults);

    if (settings.unitsOfMeasure === 'Custom' && hasImperialUnits) {
      settings.unitsOfMeasure = 'Imperial';
    } else if (settings.unitsOfMeasure === 'Custom' && hasMetricUnits) {
      settings.unitsOfMeasure = 'Metric';
    } else if (!hasMetricUnits && !hasImperialUnits) {
      settings.unitsOfMeasure = 'Custom';
    }
    return settings;
  }

  checkHasMatchingUnitTypes(settings: Settings, unitDefaults: any): boolean {
    let hasMatchingTemperatureMeasurement: boolean = settings.steamTemperatureMeasurement === unitDefaults.steamTemperatureMeasurement;
    let hasMatchingPressureMeasurement: boolean = settings.steamPressureMeasurement === unitDefaults.steamPressureMeasurement;
    let hasMatchingSpecificEnthalpyMeasurement: boolean = settings.steamSpecificEnthalpyMeasurement === unitDefaults.steamSpecificEnthalpyMeasurement;
    let hasMatchingSpecificEntropyMeasurement: boolean = settings.steamSpecificEntropyMeasurement === unitDefaults.steamSpecificEntropyMeasurement;
    let hasMatchingSpecificVolumeMeasurement: boolean = settings.steamSpecificVolumeMeasurement === unitDefaults.steamSpecificVolumeMeasurement;
    let hasMatchingMassFlowMeasurement: boolean = settings.steamMassFlowMeasurement === unitDefaults.steamMassFlowMeasurement;
    let hasMatchingPowerMeasurement: boolean = settings.steamPowerMeasurement === unitDefaults.steamPowerMeasurement;
    let hasMatchingVolumeMeasurement: boolean = settings.steamVolumeMeasurement === unitDefaults.steamVolumeMeasurement;
    let hasMatchingVolumeFlowMeasurement: boolean = settings.steamVolumeFlowMeasurement === unitDefaults.steamVolumeFlowMeasurement;
    let hasMatchingVacuumPressure: boolean = settings.steamVacuumPressure === unitDefaults.steamVacuumPressure;


    let hasMatchingUnitTypes: boolean = hasMatchingTemperatureMeasurement
      && hasMatchingPressureMeasurement
      && hasMatchingSpecificEnthalpyMeasurement
      && hasMatchingSpecificEntropyMeasurement
      && hasMatchingSpecificVolumeMeasurement
      && hasMatchingMassFlowMeasurement
      && hasMatchingPowerMeasurement
      && hasMatchingVolumeMeasurement
      && hasMatchingVolumeFlowMeasurement
      && hasMatchingVacuumPressure

    return hasMatchingUnitTypes;
  }

  initUpdateUnitsModal(oldSettings: Settings) {
    this.oldSettings = oldSettings;
    this.showUpdateUnitsModal = true;
    this.cd.detectChanges();
  }

  closeUpdateUnitsModal(updated?: boolean) {
    if (updated) {
      this.ssmtService.mainTab.next('baseline');
      this.ssmtService.stepTab.next('baseline');
    }
    this.showUpdateUnitsModal = false;
    this.cd.detectChanges();
  }

  selectUpdateAction(shouldUpdateData: boolean) {
    if (shouldUpdateData == true) {
      this.updateData();
    }
    else {
      this.save();
    }
    this.closeUpdateUnitsModal(shouldUpdateData);
  }

  updateData() {
    this._ssmt = this.convertSsmtService.convertExistingData(this._ssmt, this.oldSettings, this.settings);
    this._ssmt.existingDataUnits = this.settings.unitsOfMeasure;
    this.save();
    this.getSettings();
  }


  checkShowWelcomeScreen() {
    if (!this.settingsDbService.globalSettings.disableSteamTutorial) {
      this.showWelcomeScreen = true;
      this.ssmtService.modalOpen.next(true);
    }
  }

  async closeWelcomeScreen() {
    this.settingsDbService.globalSettings.disableSteamTutorial = true;
    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
    this.showWelcomeScreen = false;
    this.ssmtService.modalOpen.next(false);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  closeExportModal(input: boolean) {
    this.ssmtService.showExportModal.next(input);
  }

}
