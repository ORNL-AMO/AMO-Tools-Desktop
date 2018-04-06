import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';
import { PhastService } from './phast.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ActivatedRoute } from '@angular/router';
import { Settings } from '../shared/models/settings';
import { PHAST, Modification } from '../shared/models/phast/phast';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { SettingsService } from '../settings/settings.service';
import { LossesService } from './losses/losses.service';
import { StepTab, LossTab } from './tabs';
import { setTimeout } from 'timers';
import { ModalDirective } from 'ngx-bootstrap';
import { PhastCompareService } from './phast-compare.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-phast',
  templateUrl: './phast.component.html',
  styleUrls: ['./phast.component.css']
})
export class PhastComponent implements OnInit {
  @ViewChild('changeModificationModal') public changeModificationModal: ModalDirective;
  @ViewChild('addNewModal') public addNewModal: ModalDirective;
  //elementRefs used for getting container height for scrolling
  @ViewChild('header') header: ElementRef;
  @ViewChild('footer') footer: ElementRef;
  @ViewChild('content') content: ElementRef;
  containerHeight: number;


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  assessment: Assessment;
  saveClicked: boolean = false;
  settings: Settings;
  isAssessmentSettings: boolean;
  stepTab: StepTab;
  _phast: PHAST;

  mainTab: string = 'system-setup';
  specTab: StepTab;
  isModalOpen: boolean = false;
  selectedLossTab: LossTab;
  calcTab: string;
  assessmentTab: string = 'explore-opportunities';
  screenshotHeight: number = 0;
  sankeyPhast: PHAST;
  modificationIndex: number;
  mainTabSubscription: Subscription;
  actvatedRouteSubscription: Subscription;
  stepTabSubscription: Subscription;
  specTabSubscription: Subscription;
  lossesTabSubscription: Subscription;
  assessmentTabSubscription: Subscription;
  calcTabSubscription: Subscription;
  screenshotSubscription: Subscription;
  openModListSubscription: Subscription;
  selectedModSubscription: Subscription;
  addNewSubscription: Subscription;
  constructor(
    private assessmentService: AssessmentService,
    private phastService: PhastService,
    private indexedDbService: IndexedDbService,
    private activatedRoute: ActivatedRoute,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private settingsService: SettingsService,
    private lossesService: LossesService,
    private phastCompareService: PhastCompareService) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = 'bottom-right';
    this.toastyConfig.limit = 1;
  }

  ngOnInit() {
    //initialize booleans indicating assessment setup or 'done'
    this.lossesService.initDone();
    //get assessmentId from route phast/:id
    this.actvatedRouteSubscription = this.activatedRoute.params.subscribe(params => {
      let tmpAssessmentId = params['id'];
      //get assessment from iDb using assessmentId
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
        //use copy of phast object of as modal provided to forms
        this._phast = (JSON.parse(JSON.stringify(this.assessment.phast)));
        if (this._phast.modifications) {
          if (this._phast.modifications.length != 0) {
            if (!this._phast.modifications[0].exploreOpportunities) {
              this.phastService.assessmentTab.next('modify-conditions');
            }
            if (this._phast.setupDone) {
              this.phastCompareService.setCompareVals(this._phast, 0);
            }
          }
        }
        //get settings
        this.getSettings();
      })
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
      })
      //subscription for stepTab
      this.stepTabSubscription = this.phastService.stepTab.subscribe(val => {
        this.stepTab = val;
        //on tab change get container height
        this.getContainerHeight();
      })
      //specTab used for: system basics, operating hours and operating costs
      this.specTabSubscription = this.phastService.specTab.subscribe(val => {
        this.specTab = val;
      })
      //tabs used for heat balance
      this.lossesTabSubscription = this.lossesService.lossesTab.subscribe(tab => {
        this.selectedLossTab = this.lossesService.getTab(tab);
      })
      //modify conditions or explore opps tab
      this.assessmentTabSubscription = this.phastService.assessmentTab.subscribe(tab => {
        this.assessmentTab = tab;
        this.getContainerHeight();
      })
    });
    //calculator tab
    this.calcTabSubscription = this.phastService.calcTab.subscribe(val => {
      this.calcTab = val;
    });
    //screenShotHeight used for calculating container height, set in core.component
    //remove when screenshot is removed
    this.screenshotSubscription = this.assessmentService.screenShotHeight.subscribe(val => {
      this.screenshotHeight = val;
      this.getContainerHeight();
    })

    this.openModListSubscription = this.lossesService.openModificationModal.subscribe(val => {
      if (val) {
        this.selectModificationModal()
      }
    })
    this.selectedModSubscription = this.phastCompareService.selectedModification.subscribe(mod => {
      if (mod && this._phast) {
        this.modificationIndex = _.findIndex(this._phast.modifications, (val) => {
          return val.phast.name == mod.name
        })
      } else {
        this.modificationIndex = undefined;
      }
    })

    this.addNewSubscription = this.lossesService.openNewModal.subscribe(val => {
      if (val) {
        this.showAddNewModal();
      }
    })
  }


  ngAfterViewInit() {
    //after init show disclaimer toasty
    this.disclaimerToast();
    setTimeout(() => {
      //intialize container height after content is rendered
      this.getContainerHeight();
    }, 100);
  }

  ngOnDestroy() {
    //reset tabs when leaving phast assessment
    this.lossesService.lossesTab.next(1);
    this.phastService.initTabs();
    this.mainTabSubscription.unsubscribe();
    this.actvatedRouteSubscription.unsubscribe();
    this.stepTabSubscription.unsubscribe();
    this.specTabSubscription.unsubscribe();
    this.lossesTabSubscription.unsubscribe();
    this.assessmentTabSubscription.unsubscribe();
    this.calcTabSubscription.unsubscribe();
    this.screenshotSubscription.unsubscribe();
    this.openModListSubscription.unsubscribe();
    this.selectedModSubscription.unsubscribe();
    this.phastCompareService.selectedModification.next(undefined);
    this.phastCompareService.setNoModification();
    this.addNewSubscription.unsubscribe();
  }
  //function used for getting container height, container height used for scrolling
  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight - this.screenshotHeight;
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
    this.lossesService.updateTabs.next(true);
    //set current phast as selected sankey in sankey tab
    this.sankeyPhast = this._phast;
  }

  getSettings() {
    //get assessment settings
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
          //sets which tabs will be used based on settings
          this.lossesService.setTabs(this.settings);
          this.isAssessmentSettings = true;
          this.checkSetupDone();
        } else {
          //if no settings found for assessment, check directory settings
          this.getParentDirectorySettings(this.assessment.directoryId);
        }
      }
    )
  }
  //assessment doesn't have it's own settings, get directory settings to start
  getParentDirectorySettings(parentId: number) {
    this.indexedDbService.getDirectorySettings(parentId).then(
      results => {
        if (results.length != 0) {
          //create new settings for this assessment
          let settingsForm = this.settingsService.getFormFromSettings(results[0]);
          let tmpSettings: Settings = this.settingsService.getSettingsFromForm(settingsForm);
          tmpSettings.createdDate = new Date();
          tmpSettings.modifiedDate = new Date();
          tmpSettings.assessmentId = this.assessment.id;
          this.indexedDbService.addSettings(tmpSettings).then(
            results => {
              //try getting assessment settings again
              this.getSettings();
            })
        }
        else {
          //if no settings for directory check parent directory
          this.indexedDbService.getDirectory(parentId).then(
            results => {
              //get parent directory and recursively call this function until you have settings
              this.getParentDirectorySettings(results.parentDirectoryId);
            }
          )
        }
      }
    )
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
    if (this.stepTab.step == 1 && this.mainTab != 'assessment') {
      if (this.specTab.next)
        this.phastService.goToSpec(this.specTab.next);
      else {
        this.phastService.goToStep(this.stepTab.next);
      }
    }
    else if (this.stepTab.step == 2 || this.mainTab == 'assessment') {
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
    if (this.mainTab == 'system-setup') {
      if (this.stepTab.step == 1) {
        if (this.specTab.back) {
          this.phastService.goToSpec(this.specTab.back);
        }
      } else if (this.stepTab.step == 2) {
        if (this.selectedLossTab.back) {
          this.lossesService.lossesTab.next(this.selectedLossTab.back);
        } else {
          this.phastService.goToStep(this.stepTab.back);
        }
      } else if (this.stepTab.back) {
        this.phastService.goToStep(this.stepTab.back);
      }
    } else if (this.mainTab == 'assessment') {
      if (this.assessmentTab == 'modify-conditions') {
        if (this.selectedLossTab.back) {
          this.lossesService.lossesTab.next(this.selectedLossTab.back);
        } else {
          this.phastService.mainTab.next('system-setup');
        }
      } else {
        this.phastService.mainTab.next('system-setup');
      }
    } else if (this.mainTab == 'system-setup') {
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
    this.indexedDbService.putAssessment(this.assessment);
  }

  exportData() {
    //TODO: Logic for exporting data (csv?)
  }
  //disclaimer for phast
  disclaimerToast() {
    let toastOptions: ToastOptions = {
      title: 'Disclaimer:',
      msg: 'Please keep in mind that this application is still in beta. Please let us know if you have any suggestions for improving our app.',
      showClose: true,
      timeout: 10000000,
      theme: 'default'
    }
    this.toastyService.info(toastOptions);
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
    this.phastCompareService.setCompareVals(this._phast, this._phast.modifications.length - 1);
    this.closeAddNewModal();
  }
}
