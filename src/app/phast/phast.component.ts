import { Component, OnInit, ElementRef, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../dashboard/assessment.service';
import { PhastService } from './phast.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ActivatedRoute } from '@angular/router';
import { Settings } from '../shared/models/settings';
import { PHAST, Modification } from '../shared/models/phast/phast';
import { LossesService } from './losses/losses.service';
import { StepTab, LossTab } from './tabs';
import { ModalDirective } from 'ngx-bootstrap';
import { PhastCompareService } from './phast-compare.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsService } from '../settings/settings.service';
import { PhastValidService } from './phast-valid.service';
import { SavingsOpportunity } from '../shared/models/explore-opps';

@Component({
  selector: 'app-phast',
  templateUrl: './phast.component.html',
  styleUrls: ['./phast.component.css']
})
export class PhastComponent implements OnInit {
  @ViewChild('changeModificationModal', { static: false }) public changeModificationModal: ModalDirective;
  @ViewChild('addNewModal', { static: false }) public addNewModal: ModalDirective;
  //elementRefs used for getting container height for scrolling
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  containerHeight: number;
  sankeyLabelStyle: string = 'both';
  phastOptions: Array<{ name: string, phast: PHAST }>;
  showSankeyLabelOptions: boolean;
  updateUnitsModalSub: Subscription;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  assessment: Assessment;
  saveClicked: boolean = false;
  settings: Settings;
  stepTab: StepTab;
  _phast: PHAST;

  tab1Status: string;
  tab2Status: string;

  mainTab: string = 'system-setup';
  specTab: StepTab;
  isModalOpen: boolean = false;
  selectedLossTab: LossTab;
  calcTab: string;
  assessmentTab: string = 'explore-opportunities';
  sankeyPhast: PHAST;
  modificationIndex: number;
  mainTabSubscription: Subscription;
  actvatedRouteSubscription: Subscription;
  stepTabSubscription: Subscription;
  specTabSubscription: Subscription;
  lossesTabSubscription: Subscription;
  assessmentTabSubscription: Subscription;
  calcTabSubscription: Subscription;
  openModListSubscription: Subscription;
  selectedModSubscription: Subscription;
  addNewSubscription: Subscription;
  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;
  constructor(
    private assessmentService: AssessmentService,
    private phastService: PhastService,
    private phastValidService: PhastValidService,
    private indexedDbService: IndexedDbService,
    private activatedRoute: ActivatedRoute,
    private lossesService: LossesService,
    private phastCompareService: PhastCompareService,
    private cd: ChangeDetectorRef,
    private settingsDbService: SettingsDbService,
    private assessmentDbService: AssessmentDbService,
    private settingsService: SettingsService) {
  }

  ngOnInit() {
    this.tab1Status = '';
    this.tab2Status = '';

    //initialize booleans indicating assessment setup or 'done'
    this.lossesService.initDone();
    //get assessmentId from route phast/:id
    this.actvatedRouteSubscription = this.activatedRoute.params.subscribe(params => {
      this.assessment = this.assessmentDbService.getById(parseInt(params['id']));
      //use copy of phast object of as modal provided to forms
      this._phast = (JSON.parse(JSON.stringify(this.assessment.phast)));
      if (this._phast.modifications) {
        if (this._phast.modifications.length !== 0) {
          this._phast.modifications.forEach(modification => {
            this.setExploreOppsDefaults(modification);
          })
          if (!this._phast.modifications[0].exploreOpportunities) {
            this.phastService.assessmentTab.next('modify-conditions');
          }
          if (this._phast.setupDone) {
            this.phastCompareService.setCompareVals(this._phast, 0, false);
          }
        }
      }
      this.getSettings();
      this.initSankeyList();
    });
    //check to see if we need to start on a specified tab
    let tmpTab = this.assessmentService.getTab();
    if (tmpTab) {
      //set that tab
      this.phastService.mainTab.next(tmpTab);
    }
    //subscription for mainTab
    this.mainTabSubscription = this.phastService.mainTab.subscribe(val => {
      this.mainTab = val;
      //on tab change get container height
      this.getContainerHeight();
      this.checkTutorials();
    });
    //subscription for stepTab
    this.stepTabSubscription = this.phastService.stepTab.subscribe(val => {
      this.stepTab = val;
      //on tab change get container height
      this.getContainerHeight();
    });
    //specTab used for: system basics, operating hours and operating costs
    this.specTabSubscription = this.phastService.specTab.subscribe(val => {
      this.specTab = val;
    });
    //tabs used for heat balance
    this.lossesTabSubscription = this.lossesService.lossesTab.subscribe(tab => {
      this.selectedLossTab = this.lossesService.getTab(tab);
    });
    //modify conditions or explore opps tab
    this.assessmentTabSubscription = this.phastService.assessmentTab.subscribe(tab => {
      this.assessmentTab = tab;
      this.getContainerHeight();
    });
    //calculator tab
    this.calcTabSubscription = this.phastService.calcTab.subscribe(val => {
      this.calcTab = val;
    });

    this.openModListSubscription = this.lossesService.openModificationModal.subscribe(val => {
      if (val) {
        this.selectModificationModal();
      }
    });
    this.selectedModSubscription = this.phastCompareService.selectedModification.subscribe(mod => {
      if (this.mainTab === 'assessment') {
        if (mod && this._phast) {
          this.modificationIndex = _.findIndex(this._phast.modifications, (val) => {
            return val.phast.name === mod.name;
          });
          this.cd.detectChanges();
        } else {
          this.modificationIndex = undefined;
        }
      }
    });

    this.addNewSubscription = this.lossesService.openNewModal.subscribe(val => {
      if (val) {
        this.showAddNewModal();
      }
    });

    this.updateUnitsModalSub = this.settingsService.updateUnitsModalOpen.subscribe(modalOpen => {
      this.isModalOpen = modalOpen;
    })
  }

  setExploreOppsDefaults(modification: Modification) {  
    // old assessments with scenario added - prevent break on missing properties
    let exploreOppsDefault: SavingsOpportunity = {hasOpportunity: false, display: ''};
      if (modification.exploreOppsShowAirTemp == undefined) {
        modification.exploreOppsShowAirTemp = exploreOppsDefault;
      }
      if (modification.exploreOppsShowFlueGas == undefined) {
        modification.exploreOppsShowFlueGas = exploreOppsDefault;
      }
      if (modification.exploreOppsShowMaterial == undefined) {
        modification.exploreOppsShowMaterial = exploreOppsDefault;
      }
      if (modification.exploreOppsShowAllTimeOpen == undefined) {
        modification.exploreOppsShowAllTimeOpen = exploreOppsDefault;
      }
      if (modification.exploreOppsShowOpening == undefined) {
        modification.exploreOppsShowOpening = exploreOppsDefault;
      }
      if (modification.exploreOppsShowAllEmissivity == undefined) {
        modification.exploreOppsShowAllEmissivity = exploreOppsDefault;
      }
      if (modification.exploreOppsShowCooling == undefined) {
        modification.exploreOppsShowCooling = exploreOppsDefault;
      }
      if (modification.exploreOppsShowAtmosphere == undefined) {
        modification.exploreOppsShowAtmosphere = exploreOppsDefault;
      }
      if (modification.exploreOppsShowOperations == undefined) {
        modification.exploreOppsShowOperations = exploreOppsDefault;
      }
      if (modification.exploreOppsShowLeakage == undefined) {
        modification.exploreOppsShowLeakage = exploreOppsDefault;
      }
      if (modification.exploreOppsShowSlag == undefined) {
        modification.exploreOppsShowSlag = exploreOppsDefault;
      }
      if (modification.exploreOppsShowEfficiencyData == undefined) {
        modification.exploreOppsShowEfficiencyData = exploreOppsDefault;
      }
      if (modification.exploreOppsShowWall == undefined) {
        modification.exploreOppsShowWall = exploreOppsDefault;
      }
      if (modification.exploreOppsShowAllTemp == undefined) {
        modification.exploreOppsShowAllTemp = exploreOppsDefault;
      }
      if (modification.exploreOppsShowFixtures == undefined) {
        modification.exploreOppsShowFixtures = exploreOppsDefault;
      }
  }

  ngAfterViewInit() {
    //after init show disclaimer toasty
    setTimeout(() => {
      //initialize container height after content is rendered
      this.disclaimerToast();
      this.getContainerHeight();
    }, 100);
  }

  ngOnDestroy() {
    //reset tabs when leaving phast assessment
    this.mainTabSubscription.unsubscribe();
    this.actvatedRouteSubscription.unsubscribe();
    this.stepTabSubscription.unsubscribe();
    this.specTabSubscription.unsubscribe();
    this.lossesTabSubscription.unsubscribe();
    this.assessmentTabSubscription.unsubscribe();
    this.calcTabSubscription.unsubscribe();
    this.openModListSubscription.unsubscribe();
    this.selectedModSubscription.unsubscribe();
    this.addNewSubscription.unsubscribe();
    this.updateUnitsModalSub.unsubscribe();
    //reset services
    this.lossesService.lossesTab.next(1);
    this.phastService.initTabs();
    this.phastCompareService.selectedModification.next(undefined);
    this.phastCompareService.setNoModification();
  }
  //function used for getting container height, container height used for scrolling
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
  //called on init (from getSettings because need settings first) and save
  checkSetupDone() {
    //use copy so we don't modify existing
    this._phast.setupDone = this.lossesService.checkSetupDone((JSON.parse(JSON.stringify(this._phast))), this.settings);
    this._phast.valid = this.phastValidService.checkValid(JSON.parse(JSON.stringify(this._phast)), this.settings);
    this.lossesService.updateTabs.next(true);
    //set current phast as selected sankey in sankey tab
    this.sankeyPhast = this._phast;

    if (this._phast.setupDone) {
      this.tab2Status = 'success';
    }
    else {
      this.tab2Status = 'missing-data';
    }
    this.cd.detectChanges();
  }

  initSankeyList() {
    this.phastOptions = new Array<{ name: string, phast: PHAST }>();
    this.phastOptions.push({ name: 'Baseline', phast: this._phast });
    this.sankeyPhast = this.phastOptions[0].phast;
    this.showSankeyLabelOptions = ((this.sankeyPhast.name == 'Baseline' || this.sankeyPhast.name == null) && this.sankeyPhast.setupDone) || (this.sankeyPhast.valid && this.sankeyPhast.valid.isValid);
    if (this._phast.modifications) {
      this._phast.modifications.forEach(mod => {
        this.phastOptions.push({ name: mod.phast.name, phast: mod.phast });
      });
    }
  }

  validateSettings(): string {
    if (this.settings === undefined) {
      return 'input-error';
    }
    if ((this.settings.electricityCost === null || !this.settings.electricityCost) || (this.settings.fuelCost === null || !this.settings.fuelCost) || (this.settings.steamCost === null || !this.settings.steamCost)) {
      return 'missing-data';
    }
    if (this.settings.electricityCost < 0 || this.settings.fuelCost < 0 || this.settings.steamCost < 0) {
      return 'input-error';
    }
    else {
      return 'success';
    }
  }

  checkTutorials() {
    if (this.mainTab === 'system-setup') {
      if (!this.settingsDbService.globalSettings.disablePhastSetupTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('phast-setup-tutorial');
      }
    } else if (this.mainTab === 'assessment') {
      if (!this.settingsDbService.globalSettings.disablePhastAssessmentTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('phast-assessment-tutorial');
      }
    } else if (this.mainTab === 'report') {
      if (!this.settingsDbService.globalSettings.disablePhastReportTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('phast-report-tutorial');
      }
    }
  }

  getSettings() {
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    if (!this.settings) {
      let tmpSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, false);
      this.addSettings(tmpSettings);
    } else {
      this.lossesService.setTabs(this.settings);
    }
  }

  //start footer navigation functions
  goToReport() {
    this.phastService.mainTab.next('report');
  }
  goToAssessment() {
    this.lossesService.lossesTab.next(1);
    this.phastService.mainTab.next('assessment');
  }
  //logic for next step
  nextStep() {
    if (this.stepTab.step === 1 && this.mainTab !== 'assessment') {
      if (this.specTab.next)
        this.phastService.goToSpec(this.specTab.next);
      else {
        this.phastService.goToStep(this.stepTab.next);
      }
    }
    else if (this.stepTab.step === 2 || this.mainTab === 'assessment') {
      if (this.selectedLossTab.next) {
        this.lossesService.lossesTab.next(this.selectedLossTab.next);
      } else {
        this.phastService.goToStep(this.stepTab.next);
      }
    } else {
      this.phastService.goToStep(this.stepTab.next);
    }
  }
  //logic for previous step
  lastStep() {
    if (this.mainTab === 'system-setup') {
      if (this.stepTab.step === 1) {
        if (this.specTab.back) {
          this.phastService.goToSpec(this.specTab.back);
        }
      } else if (this.stepTab.step === 2) {
        if (this.selectedLossTab.back) {
          this.lossesService.lossesTab.next(this.selectedLossTab.back);
        } else {
          this.phastService.goToStep(this.stepTab.back);
        }
      } else if (this.stepTab.back) {
        this.phastService.goToStep(this.stepTab.back);
      }
    } else if (this.mainTab === 'assessment') {
      if (this.assessmentTab === 'modify-conditions') {
        if (this.selectedLossTab.back) {
          this.lossesService.lossesTab.next(this.selectedLossTab.back);
        } else {
          this.phastService.mainTab.next('system-setup');
        }
      } else {
        this.phastService.mainTab.next('system-setup');
      }
    } else if (this.mainTab === 'system-setup') {
      if (this.stepTab.back) {
        this.phastService.goToStep(this.stepTab.back);
      }
    }
  }
  //end footer navigation functions]

  //isModalOpen is used to set z-index of panels to 0 so modals will show in front
  openModal($event) {
    this.isModalOpen = $event;
  }
  //called on all changes to forms
  saveDb() {
    this.checkSetupDone();
    //set assessment.phast to _phast (object used in forms)
    this.assessment.phast = (JSON.parse(JSON.stringify(this._phast)));
    //update our assessment in the iDb
    this.indexedDbService.putAssessment(this.assessment).then(() => {
      this.assessmentDbService.setAll();
    });
  }

  exportData() {
    //TODO: Logic for exporting data (csv?)
  }

  setSankeyLabelStyle(style: string) {
    this.sankeyLabelStyle = style;
  }

  selectModificationModal() {
    this.isModalOpen = true;
    this.changeModificationModal.show();
  }
  closeSelectModification() {
    this.isModalOpen = false;
    this.lossesService.openModificationModal.next(false);
    this.changeModificationModal.hide();
  }

  showAddNewModal() {
    this.isModalOpen = true;
    this.addNewModal.show();
  }
  closeAddNewModal() {
    this.isModalOpen = false;
    this.lossesService.openNewModal.next(false);
    this.addNewModal.hide();
  }

  saveNewMod(mod: Modification) {
    this._phast.modifications.push(mod);
    this.initSankeyList();
    this.phastCompareService.setCompareVals(this._phast, this._phast.modifications.length - 1, false);
    this.closeAddNewModal();
    this.saveDb();
  }

  addNewMod() {
    let modName: string = 'Scenario ' + (this._phast.modifications.length + 1);
    let exploreOppsDefault: SavingsOpportunity = {hasOpportunity: false, display: ''};
    let tmpModification: Modification = {
      phast: {
        losses: {},
        name: modName,
      },
      notes: {
        chargeNotes: '',
        wallNotes: '',
        atmosphereNotes: '',
        fixtureNotes: '',
        openingNotes: '',
        coolingNotes: '',
        flueGasNotes: '',
        otherNotes: '',
        leakageNotes: '',
        extendedNotes: '',
        slagNotes: '',
        auxiliaryPowerNotes: '',
        exhaustGasNotes: '',
        energyInputExhaustGasNotes: '',
        operationsNotes: ''
      },
      exploreOppsShowFlueGas: exploreOppsDefault,
      exploreOppsShowAirTemp: exploreOppsDefault,
      exploreOppsShowMaterial: exploreOppsDefault,
      exploreOppsShowAllTimeOpen: exploreOppsDefault,
      exploreOppsShowOpening: exploreOppsDefault,
      exploreOppsShowAllEmissivity: exploreOppsDefault,
      exploreOppsShowCooling: exploreOppsDefault,
      exploreOppsShowAtmosphere: exploreOppsDefault,
      exploreOppsShowOperations: exploreOppsDefault,
      exploreOppsShowLeakage: exploreOppsDefault,
      exploreOppsShowSlag: exploreOppsDefault,
      exploreOppsShowEfficiencyData: exploreOppsDefault,
      exploreOppsShowWall: exploreOppsDefault,
      exploreOppsShowAllTemp: exploreOppsDefault,
      exploreOppsShowFixtures: exploreOppsDefault,
    };
    tmpModification.phast.losses = (JSON.parse(JSON.stringify(this._phast.losses)));
    tmpModification.phast.operatingCosts = (JSON.parse(JSON.stringify(this._phast.operatingCosts)));
    tmpModification.phast.operatingHours = (JSON.parse(JSON.stringify(this._phast.operatingHours)));
    tmpModification.phast.systemEfficiency = (JSON.parse(JSON.stringify(this._phast.systemEfficiency)));
    tmpModification.exploreOpportunities = true;
    this.saveNewMod(tmpModification);
  }

  disclaimerToast() {
    if (this.settingsDbService.globalSettings.disableDisclaimer != true) {
      this.toastData.title = 'Disclaimer';
      this.toastData.body = 'Please keep in mind that this application is still in beta. Let us know if you have any suggestions for improving our app.';
      this.showToast = true;
      this.cd.detectChanges();
    }
  }

  hideToast() {
    this.showToast = false;
    this.toastData = {
      title: '',
      body: '',
      setTimeoutVal: undefined
    };
    this.cd.detectChanges();
  }

  disableDisclaimer() {
    this.settingsDbService.globalSettings.disableDisclaimer = true;
    this.indexedDbService.putSettings(this.settingsDbService.globalSettings).then(() => {
      this.settingsDbService.setAll();
    });
    this.hideToast();
  }

  addSettings(settings: Settings) {
    let newSettings: Settings = this.settingsService.getNewSettingFromSetting(settings);
    newSettings.assessmentId = this.assessment.id;
    this.indexedDbService.addSettings(newSettings).then(id => {
      this.settingsDbService.setAll().then(() => {
        this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
        this.lossesService.setTabs(this.settings);
      });
    });
  }
}
