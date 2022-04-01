import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../dashboard/assessment.service';
import { PSAT, Modification, PsatOutputs, PsatInputs } from '../shared/models/psat';
import { PsatService } from './psat.service';
import * as _ from 'lodash';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ActivatedRoute } from '@angular/router';
import { Settings } from '../shared/models/settings';
import { CompareService } from './compare.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { PsatTabService } from './psat-tab.service';
import { PumpFluidService } from './pump-fluid/pump-fluid.service';
import { FormGroup } from '@angular/forms';
import { MotorService } from './motor/motor.service';
import { FieldDataService } from './field-data/field-data.service';
import { PumpImperialDefaults, PumpMetricDefaults, SettingsService } from '../settings/settings.service';
import { EGridService } from '../shared/helper-services/e-grid.service';

@Component({
  selector: 'app-psat',
  templateUrl: './psat.component.html',
  styleUrls: ['./psat.component.css']
})
export class PsatComponent implements OnInit {
  @ViewChild('changeModificationModal', { static: false }) public changeModificationModal: ModalDirective;
  @ViewChild('addNewModal', { static: false }) public addNewModal: ModalDirective;

  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('updateUnitsModal', { static: false }) public updateUnitsModal: ModalDirective;

  showUpdateUnitsModal: boolean = false;
  oldSettings: Settings;
  containerHeight: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  assessment: Assessment;
  currentTab: string = 'system-setup';

  //used for sankey
  //TODO: move this and sankey choosing logic oput of this component
  psatOptions: Array<any>;
  psatOptionsLength: number;
  psat1: { name: string, psat: PSAT };
  psat2: { name: string, psat: PSAT };

  sankeyLabelStyle: string = 'both';
  showSankeyLabelOptions: boolean;

  _psat: PSAT;
  settings: Settings;
  isModalOpen: boolean = false;
  mainTab: string = 'system-setup';
  calcTab: string;
  modificationIndex: number = 0;
  selectedModSubscription: Subscription;
  addNewSub: Subscription;
  modificationExists: boolean = false;
  mainTabSub: Subscription;
  secondaryTabSub: Subscription;
  calcTabSub: Subscription;
  openModSub: Subscription;
  modalOpenSub: Subscription;
  showAdd: boolean;
  stepTabSubscription: Subscription;
  stepTab: string;
  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;
  showWelcomeScreen: boolean = false;
  constructor(
    private assessmentService: AssessmentService,
    private psatService: PsatService,
    private indexedDbService: IndexedDbService,
    private activatedRoute: ActivatedRoute,
    private compareService: CompareService,
    private settingsDbService: SettingsDbService,
    private assessmentDbService: AssessmentDbService,
    private psatTabService: PsatTabService,
    private pumpFluidService: PumpFluidService,
    private motorService: MotorService,
    private fieldDataService: FieldDataService,
    private cd: ChangeDetectorRef,
    private egridService: EGridService,
    private settingsService: SettingsService) {
  }

  ngOnInit() {
    this.egridService.getAllSubRegions();
    this.activatedRoute.params.subscribe(params => {
      this.assessment = this.assessmentDbService.findById(parseInt(params['id']))
      this.getSettings();
      this._psat = (JSON.parse(JSON.stringify(this.assessment.psat)));
      if (this._psat.modifications) {
        if (this._psat.modifications.length != 0) {
          this.modificationExists = true;
          this.modificationIndex = 0;
        }
        if (this._psat.setupDone) {
          this.compareService.setCompareVals(this._psat, 0);
        }
      } else {
        this._psat.modifications = new Array();
        this.modificationExists = false;
      }
      this.initSankeyList();
    })
    let tmpTab = this.assessmentService.getTab();
    if (tmpTab) {
      this.psatTabService.mainTab.next(tmpTab);
    }
    this.mainTabSub = this.psatTabService.mainTab.subscribe(val => {
      this.mainTab = val;
      if (this.mainTab == 'diagram') {
        this.psatTabService.secondaryTab.next('system-curve');
      }
      else if (this.mainTab == 'assessment') {
        if (this.currentTab != 'explore-opportunities' && this.currentTab != 'modify-conditions') {
          this.psatTabService.secondaryTab.next('explore-opportunities');
        }
      }
      this.getContainerHeight();
    })
    this.secondaryTabSub = this.psatTabService.secondaryTab.subscribe(val => {
      this.currentTab = val;
      this.getContainerHeight();
    })

    this.calcTabSub = this.psatTabService.calcTab.subscribe(val => {
      this.calcTab = val;
    })

    this.selectedModSubscription = this.compareService.selectedModification.subscribe(mod => {
      if (mod && this._psat) {
        this.modificationIndex = _.findIndex(this._psat.modifications, (val) => {
          return val.psat.name == mod.name
        })
      } else {
        this.modificationIndex = undefined;
      }
    })

    this.openModSub = this.compareService.openModificationModal.subscribe(val => {
      if (val) {
        this.selectModificationModal()
      }
    })

    this.addNewSub = this.compareService.openNewModal.subscribe(val => {
      this.showAdd = val;
      if (val) {
        this.showAddNewModal();
      }
    })

    this.stepTabSubscription = this.psatTabService.stepTab.subscribe(val => {
      this.stepTab = val;
    })

    this.modalOpenSub = this.psatService.modalOpen.subscribe(isOpen => {
      this.isModalOpen = isOpen;
    });

    this.checkShowWelcomeScreen();
  }

  ngOnDestroy() {
    this.compareService.baselinePSAT = undefined;
    this.compareService.modifiedPSAT = undefined;
    if (this.addNewSub) this.addNewSub.unsubscribe();
    if (this.openModSub) this.openModSub.unsubscribe();
    if (this.selectedModSubscription) this.selectedModSubscription.unsubscribe();
    if (this.calcTabSub) this.calcTabSub.unsubscribe();
    if (this.secondaryTabSub) this.secondaryTabSub.unsubscribe();
    if (this.mainTabSub) this.mainTabSub.unsubscribe();
    if (this.stepTabSubscription) this.stepTabSubscription.unsubscribe()
    this.psatTabService.secondaryTab.next('explore-opportunities');
    this.psatTabService.mainTab.next('system-setup');
    this.psatTabService.stepTab.next('system-basics');
    this.psatTabService.modifyConditionsTab.next('pump-fluid');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
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
      }, 100);
    }
  }

  initSankeyList() {
    this.psatOptions = new Array<any>();
    this.psatOptions.push({ name: 'Baseline', psat: this._psat });
    this.psat1 = this.psatOptions[0];
    this.showSankeyLabelOptions = ((this.psat1.name == 'Baseline' || this.psat1.name == null) && this.psat1.psat.setupDone) || (this.psat1.psat.valid && this.psat1.psat.valid.isValid);
    if (this._psat.modifications) {
      this._psat.modifications.forEach(mod => {
        this.psatOptions.push({ name: mod.psat.name, psat: mod.psat });
      })
      this.psat2 = this.psatOptions[1];
      this.psatOptionsLength = this.psatOptions.length;
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

  continue() {
    this.psatTabService.continue();
  }

  back() {
    this.psatTabService.back();
  }

  getCanContinue() {
    if (this.stepTab == 'system-basics') {
      return true;
    }
    else if (this.stepTab == 'pump-fluid') {
      let tmpForm: FormGroup = this.pumpFluidService.getFormFromObj(this._psat.inputs);
      return tmpForm.valid;
    } else if (this.stepTab == 'motor') {
      let tmpForm: FormGroup = this.motorService.getFormFromObj(this._psat.inputs);
      return tmpForm.valid;
    } else if (this.stepTab == 'field-data') {
      let tmpForm: FormGroup = this.fieldDataService.getFormFromObj(this._psat.inputs, true, this._psat.inputs.whatIfScenario);
      return tmpForm.valid;
    }
  }

  async save() {
    let tmpPumpFluidForm: FormGroup = this.pumpFluidService.getFormFromObj(this._psat.inputs);
    let tmpMotorForm: FormGroup = this.motorService.getFormFromObj(this._psat.inputs);
    let tmpFieldDataForm: FormGroup = this.fieldDataService.getFormFromObj(this._psat.inputs, true, this._psat.inputs.whatIfScenario);
    if ((tmpPumpFluidForm.valid && tmpMotorForm.valid && tmpFieldDataForm.valid) || this.modificationExists) {
      this._psat.setupDone = true;
      this.initSankeyList();
    } else {
      this._psat.setupDone = false;
    }

    if (this._psat.modifications) {
      if (this._psat.modifications.length == 0) {
        this.modificationExists = false;
      } else {
        this.modificationExists = true;
      }
      this._psat.modifications.forEach(mod => {
        if (mod.psat.inputs.whatIfScenario) {
          mod.psat.inputs.load_estimation_method = this._psat.inputs.load_estimation_method;
          mod.psat.inputs.motor_field_current = this._psat.inputs.motor_field_current;
          mod.psat.inputs.motor_field_power = this._psat.inputs.motor_field_power;
          mod.psat = this.updateModificationCO2Savings(mod.psat);
        }
      });
    } else {
      this.modificationExists = false;
    }
    this.compareService.setCompareVals(this._psat, this.modificationIndex);
    this.assessment.psat = (JSON.parse(JSON.stringify(this._psat)));

    let assessments: Assessment[] = await firstValueFrom(this.assessmentDbService.updateWithObservable(this.assessment));
    this.assessmentDbService.setAll(assessments);
    this.psatService.getResults.next(true);

    this.cd.detectChanges();
  }

  updateModificationCO2Savings(modPsat: PSAT) {
    if (this._psat.inputs.co2SavingsData) {
      if (!modPsat.inputs.co2SavingsData) {
        modPsat.inputs.co2SavingsData = this._psat.inputs.co2SavingsData;
      } else {
        modPsat.inputs.co2SavingsData.zipcode = this._psat.inputs.co2SavingsData.zipcode;
        modPsat.inputs.co2SavingsData.eGridSubregion = this._psat.inputs.co2SavingsData.eGridSubregion;
        if (!modPsat.inputs.co2SavingsData.totalEmissionOutputRate) {
          modPsat.inputs.co2SavingsData.totalEmissionOutputRate = this._psat.inputs.co2SavingsData.totalEmissionOutputRate;
        }
      }
    }
    return modPsat;
  }

  savePsat(newPSAT: PSAT) {
    this._psat = newPSAT;
    this.save();
  }

  goToReport() {
    this.psatTabService.mainTab.next('report');
  }

  selectModificationModal() {
    this.isModalOpen = true;
    this.changeModificationModal.show();
  }
  closeSelectModification() {
    this.isModalOpen = false;
    this.compareService.openModificationModal.next(false);
    this.changeModificationModal.hide();
  }
  showAddNewModal() {
    this.isModalOpen = true;
    this.addNewModal.show();
  }
  closeAddNewModal() {
    this.isModalOpen = false;
    this.compareService.openNewModal.next(false);
    this.addNewModal.hide();
  }

  saveNewMod(mod: Modification) {
    this._psat.modifications.push(mod);
    this.compareService.setCompareVals(this._psat, this._psat.modifications.length - 1);
    this.save();
    this.closeAddNewModal();
  }

  addNewMod() {
    let modName: string = 'Scenario ' + (this._psat.modifications.length + 1);
    let tmpModification: Modification = {
      psat: {
        name: modName,
      },
      notes: {
        fieldDataNotes: '',
        motorNotes: '',
        pumpFluidNotes: '',
        systemBasicsNotes: ''
      },
      exploreOpportunities: this.currentTab == 'explore-opportunities'
    }
    tmpModification.psat.inputs = (JSON.parse(JSON.stringify(this._psat.inputs)));
    tmpModification.psat.inputs.pump_style = 11;
    tmpModification.psat.inputs.whatIfScenario = true;
    let baselineResults: PsatOutputs = this.psatService.resultsExisting(this._psat.inputs, this.settings);
    tmpModification.psat.inputs.pump_specified = baselineResults.pump_efficiency;
    this.saveNewMod(tmpModification)
  }

  addSettings(settings: Settings) {
    let newSettings: Settings = this.settingsService.getNewSettingFromSetting(settings);
    newSettings = this.setSettingsUnitType(newSettings);
    newSettings.assessmentId = this.assessment.id;
    this.indexedDbService.addSettings(newSettings).then(id => {
      this.settingsDbService.setAll().then(() => {
        this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
      });
    });
  }

  setSettingsUnitType(settings: Settings): Settings {
    let hasImperialUnits: boolean = this.checkHasMatchingUnitTypes(settings, PumpImperialDefaults);
    let hasMetricUnits: boolean = this.checkHasMatchingUnitTypes(settings, PumpMetricDefaults);

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
    let hasMatchingPowerMeasurement: boolean = settings.powerMeasurement === unitDefaults.powerMeasurement; 
    let hasMatchingFlowMeasurement: boolean = settings.flowMeasurement === unitDefaults.flowMeasurement; 
    let hasMatchingDistanceMeasurement: boolean = settings.distanceMeasurement === unitDefaults.distanceMeasurement; 
    let hasMatchingPressureMeasurement: boolean = settings.pressureMeasurement === unitDefaults.pressureMeasurement; 
    let hasMatchingTemperatureMeasurement: boolean = settings.temperatureMeasurement === unitDefaults.temperatureMeasurement; 
    
    let hasMatchingUnitTypes: boolean = hasMatchingPowerMeasurement
    && hasMatchingFlowMeasurement
    && hasMatchingDistanceMeasurement
    && hasMatchingPressureMeasurement
    && hasMatchingTemperatureMeasurement;

    return hasMatchingUnitTypes;
  }

  initUpdateUnitsModal(oldSettings: Settings) {
    this.oldSettings = oldSettings;
    this.showUpdateUnitsModal = true;
    this.cd.detectChanges();
  }

  closeUpdateUnitsModal(updated?: boolean) {
    if (updated) {
      this.psatTabService.mainTab.next('system-setup');
      this.psatTabService.stepTab.next('system-basics');
    }
    this.showUpdateUnitsModal = false;
    this.cd.detectChanges();
  }

  selectUpdateAction(shouldUpdateData: boolean) {
    if (shouldUpdateData == true) {
      this.updateData();
    } else {
      this.save();
    }
    this.closeUpdateUnitsModal(shouldUpdateData);
  }

  updateData() {
    this._psat = this.psatService.convertExistingData(this._psat, this.oldSettings, this.settings);
    this._psat.existingDataUnits = this.settings.unitsOfMeasure;
    this.save();
    this.getSettings();

  }

  checkShowWelcomeScreen() {
    if (!this.settingsDbService.globalSettings.disablePsatTutorial) {
      this.showWelcomeScreen = true;
      this.psatService.modalOpen.next(true);
    }
  }

  closeWelcomeScreen() {
    this.settingsDbService.globalSettings.disablePsatTutorial = true;
    this.indexedDbService.putSettings(this.settingsDbService.globalSettings);
    this.showWelcomeScreen = false;
    this.psatService.modalOpen.next(false);
  }
}
