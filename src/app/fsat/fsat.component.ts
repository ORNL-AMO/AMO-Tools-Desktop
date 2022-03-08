import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Assessment } from '../shared/models/assessment';
import { FsatService } from './fsat.service';
import { Settings } from '../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { Subscription } from 'rxjs';
import { FSAT, Modification, BaseGasDensity, FanMotor, FanSetup, FieldData, FsatOperations } from '../shared/models/fans';
import * as _ from 'lodash';
import { CompareService } from './compare.service';
import { AssessmentService } from '../dashboard/assessment.service';
import { FsatFluidService } from './fsat-fluid/fsat-fluid.service';
import { FanMotorService } from './fan-motor/fan-motor.service';
import { FanFieldDataService } from './fan-field-data/fan-field-data.service';
import { FanSetupService } from './fan-setup/fan-setup.service';
import { SettingsService } from '../settings/settings.service';
import { ConvertFsatService } from './convert-fsat.service';
import { EGridService } from '../shared/helper-services/e-grid.service';

@Component({
  selector: 'app-fsat',
  templateUrl: './fsat.component.html',
  styleUrls: ['./fsat.component.css']
})
export class FsatComponent implements OnInit {
  @ViewChild('changeModificationModal', { static: false }) public changeModificationModal: ModalDirective;

  @ViewChild('fsat203Modal', { static: false }) public fsat203Modal: ModalDirective;
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;

  @ViewChild('addNewModal', { static: false }) public addNewModal: ModalDirective;
  containerHeight: number;
  @ViewChild('updateUnitsModal', { static: false }) public updateUnitsModal: ModalDirective;

  showUpdateUnitsModal: boolean = false;
  oldSettings: Settings;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  stepTabs: Array<string> = [
    'system-basics',
    'fan-setup',
    'fan-motor',
    'fan-field-data'
  ];

  _fsat: FSAT;
  assessment: Assessment;
  mainTab: string;
  stepTab: string;
  stepTabIndex: number;
  settings: Settings;
  assessmentTab: string;
  mainTabSub: Subscription;
  stepTabSub: Subscription;
  assessmentTabSub: Subscription;
  modificationExists: boolean;
  modificationIndex: number;
  selectedModSubscription: Subscription;
  addNewSub: Subscription;
  showAdd: boolean;
  isModalOpen: boolean;
  openModSub: Subscription;
  modalOpenSubscription: Subscription;
  calcTab: string;
  calcTabSubscription: Subscription;


  fsatOptions: Array<any>;
  fsatOptionsLength: number;

  sankeyLabelStyle: string = 'both';
  showSankeyLabelOptions: boolean;
  fsat1: {fsat: FSAT, name: string};
  fsat2: {fsat: FSAT, name: string};
  //exploreOppsToast: boolean = false;
  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;
  constructor(private activatedRoute: ActivatedRoute,
    private indexedDbService: IndexedDbService,
    private fsatService: FsatService,
    private settingsDbService: SettingsDbService,
    private assessmentDbService: AssessmentDbService,
    private compareService: CompareService,
    private assessmentService: AssessmentService,
    private fsatFluidService: FsatFluidService,
    private fanMotorService: FanMotorService,
    private fanFieldDataService: FanFieldDataService,
    private fanSetupService: FanSetupService,
    private cd: ChangeDetectorRef,
    private settingsService: SettingsService,
    private egridService: EGridService,
    private convertFsatService: ConvertFsatService) {
  }

  ngOnInit() {
    this.egridService.getAllSubRegions();
    this.activatedRoute.params.subscribe(params => {
      this.assessment = this.assessmentDbService.getById(parseInt(params['id']))
      this._fsat = (JSON.parse(JSON.stringify(this.assessment.fsat)));
      if (this._fsat.modifications) {
        if (this._fsat.modifications.length !== 0) {
          this.modificationExists = true;
          this.modificationIndex = 0;
          this.compareService.setCompareVals(this._fsat, 0);
        } else {
          this.modificationExists = false;
          this.compareService.setCompareVals(this._fsat);
        }
      } else {
        this._fsat.modifications = new Array<Modification>();
        this.modificationExists = false;
        this.compareService.setCompareVals(this._fsat);
      }
      this.getSettings();
      this.initSankeyList();
      let tmpTab: string = this.assessmentService.tab;
      if (tmpTab) {
        this.fsatService.mainTab.next(tmpTab);
      }
    });
    this.mainTabSub = this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
      this.checkTutorials();
    });
    this.stepTabSub = this.fsatService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.stepTabIndex = _.findIndex(this.stepTabs, function (tab) { return tab === val; });
      this.getContainerHeight();
    });
    this.assessmentTabSub = this.fsatService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
      this.getContainerHeight();
    });

    this.addNewSub = this.fsatService.openNewModal.subscribe(val => {
      this.showAdd = val;
      if (val) {
        this.showAddNewModal();
      }
    });
    this.openModSub = this.fsatService.openModificationModal.subscribe(val => {
      if (val) {
        this.selectModificationModal();
      }
    });
    this.selectedModSubscription = this.compareService.selectedModification.subscribe(mod => {
      if (mod && this._fsat) {
        this.modificationIndex = _.findIndex(this._fsat.modifications, (val) => {
          return val.fsat.name === mod.name;
        });
      } else {
        this.modificationIndex = undefined;
      }
    });
      this.modalOpenSubscription = this.fsatService.modalOpen.subscribe(isOpen => {
      this.isModalOpen = isOpen;
    });
    this.calcTabSubscription = this.fsatService.calculatorTab.subscribe(val => {
      this.calcTab = val;
    });
  }

  ngOnDestroy() {
    this.compareService.baselineFSAT = undefined;
    this.compareService.modifiedFSAT = undefined;
    this.compareService.selectedModification.next(undefined);
    this.mainTabSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.stepTabSub.unsubscribe();
    this.openModSub.unsubscribe();
    this.selectedModSubscription.unsubscribe();
    this.addNewSub.unsubscribe();
    this.fsatService.initData();
    this.modalOpenSubscription.unsubscribe();
    this.calcTabSubscription.unsubscribe();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  checkTutorials() {
    if (this.mainTab === 'system-setup') {
      if (!this.settingsDbService.globalSettings.disableFsatSetupTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('fsat-system-setup');
      }
    } else if (this.mainTab === 'assessment') {
      if (!this.settingsDbService.globalSettings.disableFsatAssessmentTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('fsat-assessment-tutorial');
      }
    } else if (this.mainTab === 'report') {
      if (!this.settingsDbService.globalSettings.disableFsatReportTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('fsat-report-tutorial');
      }
    }
  }

  initSankeyList() {
    this.fsatOptions = new Array<any>();
    this.fsatOptions.push({ name: 'Baseline', fsat: this._fsat });
    this.fsat1 = this.fsatOptions[0];
    this.showSankeyLabelOptions = ((this.fsat1.name == 'Baseline' || this.fsat1.name == null) && this.fsat1.fsat.setupDone) || (this.fsat1.fsat.valid && this.fsat1.fsat.valid.isValid);
    if (this._fsat.modifications) {
      this._fsat.modifications.forEach(mod => {
        this.fsatOptions.push({ name: mod.fsat.name, fsat: mod.fsat });
      });
      this.fsat2 = this.fsatOptions[1];
    }
    this.fsatOptionsLength = this.fsatOptions.length;
  }

  setSankeyLabelStyle(style: string) {
    this.sankeyLabelStyle = style;
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

  saveSettings(newSettings: Settings) {
    this.settings = newSettings;
    this.indexedDbService.putSettings(this.settings).then(() => {
      this.settingsDbService.setAll().then(() => {
      });
    });
  }


  getSettings() {
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    if (!this.settings) {
      let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, false);
      this.addSettings(settings);
    }
  }

  showAddNewModal() {
    this.addNewModal.show();
  }
  closeAddNewModal() {
    this.fsatService.openNewModal.next(false);
    this.addNewModal.hide();
  }

  saveNewMod(mod: Modification) {
    this._fsat.modifications.push(mod);
    this.compareService.setCompareVals(this._fsat, this._fsat.modifications.length - 1);
    this.save();
    this.closeAddNewModal();
  }
  saveGasDensity(newDensity: BaseGasDensity) {
    this._fsat.baseGasDensity = newDensity;
    this.save();
  }

  saveFanMotor(newFanMotor: FanMotor) {
    this._fsat.fanMotor = newFanMotor;
    this.save();
  }

  saveFanSetup(newFanSetup: FanSetup) {
    this._fsat.fanSetup = newFanSetup;
    this.save();
  }

  saveFieldData(newFieldData: FieldData) {
    this._fsat.fieldData = newFieldData;
    this.saveFsat(this._fsat);
  }

  saveFsatOperations(newFsatOperations: FsatOperations) {
    this._fsat.fsatOperations = newFsatOperations;
    this.saveFsat(this._fsat);
  }

  saveFsat(newFsat: FSAT) {
    this._fsat = newFsat;
    this.save();
  }

  save() {
    if (this._fsat.modifications) {
      if (this._fsat.modifications.length === 0) {
        this.modificationExists = false;
      } else {
        this.modificationExists = true;
        this._fsat.modifications.forEach(mod => {
          mod.fsat = this.updateModificationCO2Savings(mod.fsat);
        });
      }
    } else {
      this.modificationExists = false;
    }
    this.compareService.setCompareVals(this._fsat, this.modificationIndex);
    this._fsat.setupDone = this.checkSetupDone(this._fsat);
    this.assessment.fsat = (JSON.parse(JSON.stringify(this._fsat)));
    this.indexedDbService.putAssessment(this.assessment).then(results => {
      this.assessmentDbService.setAll().then(() => {
        this.fsatService.updateData.next(true);
      });
    });
  }

  updateModificationCO2Savings(modFsat: FSAT) {
    if (this._fsat.fsatOperations.cO2SavingsData) {
      if (!modFsat.fsatOperations.cO2SavingsData) {
        modFsat.fsatOperations.cO2SavingsData = this._fsat.fsatOperations.cO2SavingsData;
      } else {
        modFsat.fsatOperations.cO2SavingsData.zipcode = this._fsat.fsatOperations.cO2SavingsData.zipcode;
        modFsat.fsatOperations.cO2SavingsData.eGridSubregion = this._fsat.fsatOperations.cO2SavingsData.eGridSubregion;
        if (!modFsat.fsatOperations.cO2SavingsData.totalEmissionOutputRate) {
          modFsat.fsatOperations.cO2SavingsData.totalEmissionOutputRate = this._fsat.fsatOperations.cO2SavingsData.totalEmissionOutputRate;
        }
      }
    }
    return modFsat;
  }


  checkSetupDone(fsat: FSAT): boolean {
    return this.fsatService.checkValid(fsat, true, this.settings).isValid;
  }

  selectModificationModal() {
    this.isModalOpen = true;
    this.changeModificationModal.show();
  }
  closeSelectModification() {
    this.isModalOpen = false;
    this.fsatService.openModificationModal.next(false);
    this.changeModificationModal.hide();
    this.fsatService.updateData.next(true);
  }

  getCanContinue() {
    if (this.stepTab === 'system-basics') {
      return true;
    } else if (this.stepTab === 'fsat-fluid') {
      let isValid: boolean = this.fsatFluidService.isFanFluidValid(this._fsat.baseGasDensity, this.settings);
      if (isValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab === 'fan-setup') {
      let isValid: boolean = this.fanSetupService.isFanSetupValid(this._fsat.fanSetup, false);
      if (isValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab === 'fan-motor') {
      let isValid: boolean = this.fanMotorService.isFanMotorValid(this._fsat.fanMotor);
      if (isValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab === 'fan-field-data') {
      let isValid: boolean = this.fanFieldDataService.isFanFieldDataValid(this._fsat.fieldData);
      if (isValid) {
        return true;
      } else {
        return false;
      }
    }
  }

  continue() {
    if (this.stepTab === 'fan-field-data') {
      this.fsatService.mainTab.next('assessment');
    } else {
      let assessmentTabIndex: number = this.stepTabIndex + 1;
      let nextTab: string = this.stepTabs[assessmentTabIndex];
      this.fsatService.stepTab.next(nextTab);
    }
  }

  back() {
    if (this.stepTab !== 'system-basics' && this.mainTab == 'system-setup') {
      let assessmentTabIndex: number = this.stepTabIndex - 1;
      let nextTab: string = this.stepTabs[assessmentTabIndex];
      this.fsatService.stepTab.next(nextTab);
    } else if (this.mainTab == 'assessment') {
      this.fsatService.mainTab.next('system-setup');
    }
  }

  goToReport() {
    this.fsatService.mainTab.next('report');
  }

  addNewMod() {
    let tmpModification: Modification = this.fsatService.getNewMod(this._fsat, this.settings);
    tmpModification.exploreOpportunities = (this.assessmentTab == 'explore-opportunities');
    this.saveNewMod(tmpModification);
  }

  
  addSettings(settings: Settings) {
    let newSettings: Settings = this.settingsService.getNewSettingFromSetting(settings);
    newSettings.assessmentId = this.assessment.id;
    this.indexedDbService.addSettings(newSettings).then(id => {
      this.settingsDbService.setAll().then(() => {
        this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
      });
    });
  }

  initUpdateUnitsModal(oldSettings: Settings) {
    this.oldSettings = oldSettings;
    this.showUpdateUnitsModal = true;
    this.cd.detectChanges();
  }

  closeUpdateUnitsModal(updated?: boolean) {
    if (updated) {
      this.fsatService.mainTab.next('system-setup');
      this.fsatService.stepTab.next('system-basics');
    }
    this.showUpdateUnitsModal = false;
    this.cd.detectChanges();
  }

  selectUpdateAction(shouldUpdateData: boolean) {
    if(shouldUpdateData == true) {
      this.updateData();
    } else {
      this.save();
    }
    this.closeUpdateUnitsModal(shouldUpdateData);
  }

  updateData() {
    this._fsat = this.convertFsatService.convertExistingData(this._fsat, this.oldSettings, this.settings);
    this._fsat.existingDataUnits = this.settings.unitsOfMeasure;
    this.save();
    this.getSettings();
  }
}
