import { Component, OnInit } from '@angular/core';
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
import { LossesService } from './losses/losses.service';
import { StepTab } from './tabs';
@Component({
  selector: 'app-phast',
  templateUrl: './phast.component.html',
  styleUrls: ['./phast.component.css']
})
export class PhastComponent implements OnInit {
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

  mainTab: string = 'system-setup';
  init: boolean = true;
  saveDbToggle: string;
  specTab: string;
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
      })

      this.phastService.stepTab.subscribe(val => {
        this.stepTab = val;
      })

      this.phastService.specTab.subscribe(val => {
        this.specTab = val;
      })
    });
  }


  ngAfterViewInit() {
    this.disclaimerToast();
  }

  ngOnDestroy() {
    this.lossesService.lossesTab.next('charge-material');
    this.phastService.initTabs();
  }

  checkSetupDone(){
    this._phast.setupDone = this.lossesService.checkSetupDone((JSON.parse(JSON.stringify(this._phast))), this.settings);
  }


  getSettings(update?: boolean) {
    //get assessment settings
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
          if (!this.settings.energyResultUnit) {
            this.settings = this.settingsService.setEnergyResultUnitSetting(this.settings);
          }
          this.isAssessmentSettings = true;
          this.checkSetupDone();
          this.init = false;
          if (update) {
            this.addToast('Settings Saved');
          }
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
              this.addToast('Settings Saved');
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

  goToAssessment(){
    this.phastService.mainTab.next('assessment');
  }

  goToStep(stepNum: number) {
    if (stepNum) {
      this.phastService.goToStep(stepNum)
    }
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
    this.saveDbToggle = 'saveDb' + Math.random();
    this.indexedDbService.putAssessment(this.assessment).then(
      results => { this.addToast('Assessment Saved') }
    )
  }


  exportData() {
    //TODO: Logic for exporting data
  }

  disclaimerToast() {
    let toastOptions: ToastOptions = {
      title: 'Disclaimer:',
      msg: ' The PHAST Tool is still in the early stages of development. Only a portion of the tools functionality is in place, some links/buttons/forms may not work and are placeholders for future work.',
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
