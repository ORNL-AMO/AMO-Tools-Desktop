import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { ActivatedRoute } from '@angular/router';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Subscription } from 'rxjs';
import { SsmtService } from './ssmt.service';
import { Settings } from '../shared/models/settings';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { SSMT, Modification, BoilerInput, HeaderInput, TurbineInput, SsmtValid } from '../shared/models/steam/ssmt';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CompareService } from './compare.service';
import * as _ from 'lodash';
import { AssessmentService } from '../dashboard/assessment.service';
import { SettingsService } from '../settings/settings.service';
import { ConvertSsmtService } from './convert-ssmt.service';
import { EGridService } from '../shared/helper-services/e-grid.service';

@Component({
  selector: 'app-ssmt',
  templateUrl: './ssmt.component.html',
  styleUrls: ['./ssmt.component.css']
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

  showUpdateUnitsModal: boolean = false;
  oldSettings: Settings;

  stepTabs: Array<string> = [
    'system-basics',
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
  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;

  ssmtOptions: Array<any>;
  selectedSSMT: {ssmt: SSMT, name};

  sankeyLabelStyle: string = 'both';
  showSankeyLabelOptions: boolean;

  constructor(
    private egridService: EGridService,
    private activatedRoute: ActivatedRoute,
    private indexedDbService: IndexedDbService,
    private ssmtService: SsmtService,
    private settingsDbService: SettingsDbService,
    private assessmentDbService: AssessmentDbService,
    private compareService: CompareService,
    private assessmentService: AssessmentService,
    private cd: ChangeDetectorRef,
    private settingsService: SettingsService,
    private convertSsmtService: ConvertSsmtService
  ) { }

  ngOnInit() {
    this.egridService.getAllSubRegions();
    this.activatedRoute.params.subscribe(params => {
      this.assessment = this.assessmentDbService.getById(parseInt(params['id']))
      this._ssmt = (JSON.parse(JSON.stringify(this.assessment.ssmt)));
      if (this._ssmt.modifications) {
        if (this._ssmt.modifications.length !== 0) {
          this.modificationExists = true;
          this.modificationIndex = 0;
          this.compareService.setCompareVals(this._ssmt, 0);
        } else {
          this.modificationExists = false;
          this.compareService.setCompareVals(this._ssmt);
        }
      } else {
        this._ssmt.modifications = new Array<Modification>();
        this.modificationExists = false;
        this.compareService.setCompareVals(this._ssmt);
      }
      this.getSettings();
      this.initSankeyList();
      let tmpTab = this.assessmentService.getTab();
      if (tmpTab) {
        this.ssmtService.mainTab.next(tmpTab);
      }
    });
    this.subscribeTabs();

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
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
      this.checkForInputCrash();
    }, 100);
  }

  ngOnChanges() {
    this.checkForInputCrash(); 
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
    this.ssmtService.mainTab.next('system-setup');
    this.ssmtService.stepTab.next('system-basics');
    this.ssmtService.assessmentTab.next('explore-opportunities');
    this.ssmtService.steamModelTab.next('operations');
    this.calcTabSubscription.unsubscribe();
    this.ssmtService.saveSSMT.next(undefined);
    this.saveSsmtSub.unsubscribe();
  }

  subscribeTabs() {
    this.mainTabSubscription = this.ssmtService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.checkTutorials();
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

  saveSettings(newSettings: Settings) {
    this.settings = newSettings;
    this.indexedDbService.putSettings(this.settings).then(() => {
      this.settingsDbService.setAll().then(() => {
      });
    });
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

  save() {
    this.checkForInputCrash();
    this._ssmt = this.updateModificationCO2Savings(this._ssmt);
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
    this.indexedDbService.putAssessment(this.assessment).then(results => {
      this.assessmentDbService.setAll().then(() => {
        this.ssmtService.updateData.next(true);
      });
    });
  }

  updateModificationCO2Savings(ssmt: SSMT) {
    if (ssmt.co2SavingsData && ssmt.modifications) {
      ssmt.modifications.forEach(mod => {
        if (!mod.ssmt.co2SavingsData) {
          mod.ssmt.co2SavingsData = ssmt.co2SavingsData;
        } else {
          mod.ssmt.co2SavingsData.zipcode = ssmt.co2SavingsData.zipcode;
          mod.ssmt.co2SavingsData.eGridSubregion = ssmt.co2SavingsData.eGridSubregion;
          if (!mod.ssmt.co2SavingsData.totalEmissionOutputRate) {
            mod.ssmt.co2SavingsData.totalEmissionOutputRate = ssmt.co2SavingsData.totalEmissionOutputRate;
          }
          if (!mod.ssmt.co2SavingsData.totalFuelEmissionOutputRate) {
            mod.ssmt.co2SavingsData.totalFuelEmissionOutputRate = ssmt.co2SavingsData.totalFuelEmissionOutputRate;
          }
        }
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
    if (this.mainTab === 'system-setup') {
      if (this.stepTab !== 'system-basics') {
        let assessmentTabIndex: number = this.stepTabIndex - 1;
        let nextTab: string = this.stepTabs[assessmentTabIndex];
        this.ssmtService.stepTab.next(nextTab);
      }
    } else if (this.mainTab === 'assessment') {
      this.ssmtService.mainTab.next('system-setup');
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

    if (this.stepTab === 'operations' || this.stepTab === 'system-basics') {
      return true;
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
      }, 100);
    }
  }

  checkTutorials() {
    if (this.mainTab == 'system-setup') {
      if (!this.settingsDbService.globalSettings.disableSsmtSystemSetupTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('ssmt-system-setup-tutorial');
      }
    } else if (this.mainTab == 'assessment') {
      if (!this.settingsDbService.globalSettings.disableSsmtAssessmentTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('ssmt-assessment-tutorial');
      }
    } else if (this.mainTab == 'diagram') {
      if (!this.settingsDbService.globalSettings.disableSsmtDiagramTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('ssmt-diagram-tutorial');
      }
    } else if (this.mainTab == 'report') {
      if (!this.settingsDbService.globalSettings.disableSsmtReportTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('ssmt-report-tutorial');
      }
    }
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
      this.ssmtService.mainTab.next('system-setup');
      this.ssmtService.stepTab.next('system-basics');
    }
    this.showUpdateUnitsModal = false;
    this.cd.detectChanges();
  }

  selectUpdateAction(shouldUpdateData: boolean) {
    if(shouldUpdateData == true) {
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

  checkForInputCrash() {
    if (this._ssmt.outputData == undefined) {
      let title: string = 'Invalid Inputs';
      let body: string = 'Steam Properties cannot be calculated. Please check input values.';
      this.openToast(title, body);
    }     
    this.cd.detectChanges();   
  }

  openToast(title: string, body: string) {
    this.toastData.title = title;
    this.toastData.body = body;
    this.showToast = true;
  }

  hideToast() {
    this.showToast = false;
    this.toastData = {
      title: '',
      body: '',
      setTimeoutVal: undefined
    }
  }
}
