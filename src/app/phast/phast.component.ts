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

@Component({
  selector: 'app-phast',
  templateUrl: './phast.component.html',
  styleUrls: ['./phast.component.css']
})
export class PhastComponent implements OnInit {
  assessment: Assessment;

  currentTab: string = 'system-setup';
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
  subTab: string = 'system-basics';
  _phast: PHAST;

  mainTab: string = 'system-setup';
  constructor(
    private location: Location,
    private assessmentService: AssessmentService,
    private phastService: PhastService,
    private indexedDbService: IndexedDbService,
    private activatedRoute: ActivatedRoute,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private settingsService: SettingsService,
    private phastResultsService: PhastResultsService) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = 'bottom-right';
    // this.toastyConfig.limit = 1;
  }

  ngOnInit() {
    //this.phastService.test();
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
        this._phast = (JSON.parse(JSON.stringify(this.assessment.phast)));
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
        if (this.mainTab == 'assessment') {
          if (this.currentTab != 'losses') {
            this.phastService.secondaryTab.next('losses');
          }
        } else if (this.mainTab == 'system-setup') {
          this.phastService.secondaryTab.next('system-basics');
        }
      })

      this.phastService.secondaryTab.subscribe(val => {
        this.currentTab = val;
      })
    });
  }

  getSettings(update?: boolean) {
    //get assessment settings
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
          this.isAssessmentSettings = true;
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

  ngAfterViewInit() {
    this.disclaimerToast();
  }

  changeTab($event) {
    let tmpIndex = 0;
    this.tabs.forEach(tab => {
      if (tab == $event) {
        this.tabIndex = tmpIndex;
        this.phastService.secondaryTab.next(this.tabs[this.tabIndex]);
      } else {
        tmpIndex++;
      }
    })
  }

  goToReport() {
    this.phastService.mainTab.next('report');
  }

  continue() {
    this.tabIndex++;
    if (this.tabs[this.tabIndex] == 'losses') {
      this.phastService.mainTab.next('assessment');
    }
    this.phastService.secondaryTab.next(this.tabs[this.tabIndex]);
  }

  close() {
    this.location.back();
  }

  goBack() {
    this.tabIndex--;
    this.phastService.secondaryTab.next(this.tabs[this.tabIndex]);
  }

  save() {
    this.saveClicked = !this.saveClicked;
  }

  changeSubTab(str: string) {
    this.subTab = str;
  }

  saveDb() {
    this._phast.setupDone = this.checkSetupDone(this.settings);
    this.assessment.phast = (JSON.parse(JSON.stringify(this._phast)));
    this.indexedDbService.putAssessment(this.assessment).then(
      results => { this.addToast('Assessment Saved') }
    )
  }

  checkSetupDone(settings: Settings) {
    let isDone, chargeDone, grossHeat = false;
    if (this._phast.losses) {
      if (this._phast.losses.chargeMaterials) {
        if (this._phast.losses.chargeMaterials.length != 0) {
          let test = this.phastService.sumChargeMaterials(this._phast.losses.chargeMaterials, this.settings);
          if (test != 0) {
            chargeDone = true;
          }
        }
      }

      let categories = this.phastResultsService.getResultCategories(this.settings);
      if (categories.showEnInput1) {
        if (this._phast.losses.energyInputEAF) {
          if (this._phast.losses.energyInputEAF.length != 0) {
            let test = this.phastService.sumEnergyInputEAF(this._phast.losses.energyInputEAF, this.settings);
            if (test != 0) {
              grossHeat = true;
            }
          }
        }
      }
      else if (categories.showEnInput2) {
        if (this._phast.losses.energyInputExhaustGasLoss) {
          if (this._phast.losses.energyInputExhaustGasLoss.length != 0) {
            let test = this.phastService.sumEnergyInputExhaustGas(this._phast.losses.energyInputExhaustGasLoss, this.settings);
            if (test != 0) {
              grossHeat = true;
            }
          }
        }
      }
      else if (categories.showFlueGas) {
        if (this._phast.losses.flueGasLosses) {
          if (this._phast.losses.flueGasLosses.length != 0) {
            let flueGas = this._phast.losses.flueGasLosses[0];
            if (flueGas.flueGasType == 'By Mass') {
              let test = this.phastService.flueGasByMass(flueGas.flueGasByMass, this.settings);
              if (test != 0) {
                grossHeat = true;
              }
            } else if (flueGas.flueGasType == 'By Volume') {
              let test = this.phastService.flueGasByVolume(flueGas.flueGasByVolume, this.settings);
              if (test != 0) {
                grossHeat = true;
              }
            }
          }
        }
      }
      else if (categories.showSystemEff) {
        if (this._phast.systemEfficiency) {
          grossHeat = true;
        }
      }
    }
    isDone = (grossHeat && chargeDone);
    return isDone;
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
