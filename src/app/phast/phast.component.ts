import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';
import { PhastService } from './phast.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ActivatedRoute } from '@angular/router';
import { Settings } from '../shared/models/settings';
import { PHAST } from '../shared/models/phast/phast';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { SettingsService } from '../settings/settings.service';
import { PhastResultsService } from './phast-results.service';
import { PhastResults } from '../shared/models/phast/phast';
import { LossesService } from './losses/losses.service';
import { StepTab, LossTab } from './tabs';
import { setTimeout } from 'timers';
@Component({
  selector: 'app-phast',
  templateUrl: './phast.component.html',
  styleUrls: ['./phast.component.css']
})
export class PhastComponent implements OnInit {
  @ViewChild('header') header: ElementRef;
  @ViewChild('footer') footer: ElementRef;
  @ViewChild('content') content: ElementRef;
  containerHeight: number;

  @HostListener('window:resize', ['$event'])
  onResize(event){
    this.getContainerHeight();
  }


  assessment: Assessment;

  saveClicked: boolean = false;

  tabs: Array<string> = [
    'system-setup',
    'losses',
    'designed-energy-use',
    'aux-equipment',
    'metered-energy'
  ]
  tabIndex: number = 0;

  settings: Settings;
  isAssessmentSettings: boolean;
  continueClicked: boolean = true;
  stepTab: StepTab;
  _phast: PHAST;


  phast: PHAST;
  modification: PHAST;
  phastOptions: Array<any>;
  phastOptionsLength: number;
  phast1: PHAST;
  phast2: PHAST;



  mainTab: string = 'system-setup';
  init: boolean = true;
  saveDbToggle: string;
  specTab: StepTab;
  isModalOpen: boolean = false;
  selectedLossTab: LossTab;
  calcTab: string;
  assessmentTab: string = 'explore-opportunities';

  constructor(
    private location: Location,
    private assessmentService: AssessmentService,
    private phastService: PhastService,
    private indexedDbService: IndexedDbService,
    private activatedRoute: ActivatedRoute,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private settingsService: SettingsService,
    private phastResultsService: PhastResultsService,
    private lossesService: LossesService) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = 'bottom-right';
    // this.toastyConfig.limit = 1;
  }

  ngOnInit() {
    //this.phastService.test();
    this.lossesService.tabsSet = false;
    this.lossesService.initDone();
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
        this._phast = (JSON.parse(JSON.stringify(this.assessment.phast)));
        this.lossesService.baseline.next(this._phast);
        if (!this._phast.operatingHours) {
          this._phast.operatingHours = {
            weeksPerYear: 52,
            daysPerWeek: 7,
            shiftsPerDay: 3,
            hoursPerShift: 8,
            hoursPerYear: 8736
          }
        }
        if (!this._phast.operatingCosts) {
          this._phast.operatingCosts = {
            fuelCost: 8.00,
            steamCost: 10.00,
            electricityCost: .080
          }
        }
        this.getSettings();
      })
      let tmpTab = this.assessmentService.getTab();
      if (tmpTab) {
        this.phastService.mainTab.next(tmpTab);
      }
      this.phastService.mainTab.subscribe(val => {
        this.mainTab = val;
        this.getContainerHeight();
      })

      this.phastService.stepTab.subscribe(val => {
        this.stepTab = val;
        this.getContainerHeight();
      })

      this.phastService.specTab.subscribe(val => {
        this.specTab = val;
      })

      this.lossesService.lossesTab.subscribe(tab => {
        this.selectedLossTab = this.lossesService.getTab(tab);
      })
    });
    // let tmpTab = this.assessmentService.getTab();
    // if (tmpTab) {
    //   this.phastService.mainTab.next(tmpTab);
    // }
    // this.phastService.mainTab.subscribe(val => {
    //   this.getContainerHeight();
    //   this.mainTab = val;
    // })

    // this.phastService.stepTab.subscribe(val => {
    //   this.stepTab = val;
    // })

    // this.phastService.specTab.subscribe(val => {
    //   this.specTab = val;
    // })
    this.phastService.calcTab.subscribe(val => {
      this.calcTab = val;
    })
  }


  initSankeyList() {
    this.phastOptions = new Array<any>();
    this.phastOptions.push({ name: 'Baseline', phast: this._phast });
    this.phast1 = this.phastOptions[0];
    if (this._phast.modifications) {
      this._phast.modifications.forEach(mod => {
        this.phastOptions.push({ name: mod.phast.name, phast: mod.phast });
      })
      this.phast2 = this.phastOptions[1];
      this.phastOptionsLength = this.phastOptions.length;
    }
  }



  ngAfterViewInit() {
    this.disclaimerToast();
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  ngOnDestroy() {
    this.lossesService.lossesTab.next(1);
    this.phastService.initTabs();
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
      },100);
    }
  }



  checkSetupDone() {
    this._phast.setupDone = this.lossesService.checkSetupDone((JSON.parse(JSON.stringify(this._phast))), this.settings);
    this.lossesService.updateTabs.next(true);
    this.initSankeyList();
  }

  getSettings(update?: boolean) {
    //get assessment settings
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
          this.lossesService.setTabs(this.settings);
          this.isAssessmentSettings = true;
          this.checkSetupDone();
          this.init = false;
        } else {
          //if no settings found for assessment, check directory settings
          this.getParentDirectorySettings(this.assessment.directoryId);
        }
      }
    )
  }

  getParentDirectorySettings(parentId: number) {
    this.indexedDbService.getDirectorySettings(parentId).then(
      results => {
        if (results.length != 0) {
          let settingsForm = this.settingsService.getFormFromSettings(results[0]);
          let tmpSettings: Settings = this.settingsService.getSettingsFromForm(settingsForm);
          tmpSettings.createdDate = new Date();
          tmpSettings.modifiedDate = new Date();
          tmpSettings.assessmentId = this.assessment.id;
          //create settings for assessment
          this.indexedDbService.addSettings(tmpSettings).then(
            results => {
              this.getSettings();
            })
        }
        else {
          //if no settings for directory check parent directory
          this.indexedDbService.getDirectory(parentId).then(
            results => {
              this.getParentDirectorySettings(results.parentDirectoryId);
            }
          )
        }
      }
    )
  }

  goToReport() {
    this.phastService.mainTab.next('report');
  }

  goToAssessment() {
    this.lossesService.lossesTab.next(1);
    this.phastService.mainTab.next('assessment');
  }

  goToStep(stepNum: number) {
    if (stepNum) {
      this.phastService.goToStep(stepNum)
    }
  }

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

  lastStep() {
    if (this.mainTab == 'system-basics') {
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

  changeAssessmentTab(str: string) {
    this.assessmentTab = str;
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  openModal($event) {
    this.isModalOpen = $event;
  }

  close() {
    this.location.back();
  }

  save() {
    this.saveClicked = !this.saveClicked;
  }

  saveDb() {
    this.checkSetupDone();
    this.assessment.phast = (JSON.parse(JSON.stringify(this._phast)));
    this.lossesService.baseline.next(this._phast);
    this.indexedDbService.putAssessment(this.assessment).then(
      results => {

      }
    )
  }

  exportData() {
    //TODO: Logic for exporting data
  }

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

  addToast(msg: string) {
    let toastOptions: ToastOptions = {
      title: msg,
      timeout: 4000,
      showClose: true,
      theme: 'default'
    }
    this.toastyService.success(toastOptions);
  }


  addReportToast(msg: string) {
    let toastOptions: ToastOptions = {
      title: msg,
      timeout: 4000,
      showClose: true,
      theme: 'default'
    }
    this.toastyService.warning(toastOptions);
  }
}
