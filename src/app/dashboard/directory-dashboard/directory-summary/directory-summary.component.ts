import { Component, OnInit, ViewChild } from '@angular/core';
import { DirectoryDashboardService } from '../directory-dashboard.service';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { FormGroup } from '@angular/forms';
import { DashboardService } from '../../dashboard.service';
import { Subscription } from 'rxjs';
import { Directory } from '../../../shared/models/directory';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { PsatService } from '../../../psat/psat.service';
import * as _ from 'lodash';
import { Assessment } from '../../../shared/models/assessment';
import { ExecutiveSummaryService } from '../../../phast/phast-report/executive-summary.service';
import { ExecutiveSummary } from '../../../shared/models/phast/phast';
import { PsatOutputs } from '../../../shared/models/psat';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FsatService } from '../../../fsat/fsat.service';
import { FsatOutput } from '../../../shared/models/fans';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { SsmtService } from '../../../ssmt/ssmt.service';
import { SettingsService } from '../../../settings/settings.service';
import { ModalDirective } from 'ngx-bootstrap';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-directory-summary',
  templateUrl: './directory-summary.component.html',
  styleUrls: ['./directory-summary.component.css']
})
export class DirectorySummaryComponent implements OnInit {


  @ViewChild('settingsModal', { static: false }) public settingsModal: ModalDirective;

  directory: Directory;
  directorySettings: Settings;
  totalSummary: AssessmentTypeSummary;
  phastSummary: AssessmentTypeSummary;
  psatSummary: AssessmentTypeSummary;
  fsatSummary: AssessmentTypeSummary;
  ssmtSummary: AssessmentTypeSummary;

  settingsForm: FormGroup;
  updateSidebarDataSub: Subscription;
  directoryIdSub: Subscription;
  counter: NodeJS.Timeout;
  constructor(private directoryDashboardService: DirectoryDashboardService, private directoryDbService: DirectoryDbService,
    private dashboardService: DashboardService, private settingsDbService: SettingsDbService, private psatService: PsatService,
    private executiveSummaryService: ExecutiveSummaryService, private convertUnitsService: ConvertUnitsService, private fsatService: FsatService,
    private ssmtService: SsmtService, private settingsService: SettingsService, private indexedDbService: IndexedDbService
  ) { }

  ngOnInit() {
    this.directoryIdSub = this.directoryDashboardService.selectedDirectoryId.subscribe(idVal => {
      this.directory = this.directoryDbService.getById(idVal);
      this.directorySettings = this.settingsDbService.getByDirectoryId(idVal);
      this.calculateSummary();
    })

    this.updateSidebarDataSub = this.dashboardService.updateSidebarData.subscribe(val => {
      this.directory = this.directoryDbService.getById(this.directory.id);
      this.calculateSummary();
    });
  }

  ngOnDestroy() {
    this.updateSidebarDataSub.unsubscribe();
    this.directoryIdSub.unsubscribe();
  }

  calculateSummary() {
    if (this.counter) {
      clearTimeout(this.counter)
    }
    this.counter = setTimeout(() => {
      this.calculatePsatSummary();
      this.calculatePhastSummary();
      this.calculateFsatSummary();
      this.calculateSsmtSummary();
      let convertedFsatEnergy: number = this.convertUnitsService.value(this.fsatSummary.totalEnergyUsed).from('mWh').to(this.directorySettings.energyResultUnit);
      let convertedPsatEnergy: number = this.convertUnitsService.value(this.psatSummary.totalEnergyUsed).from('mWh').to(this.directorySettings.energyResultUnit);
      this.totalSummary = {
        totalAssessments: this.psatSummary.totalAssessments + this.phastSummary.totalAssessments + this.fsatSummary.totalAssessments + this.ssmtSummary.totalAssessments,
        totalCost: this.psatSummary.totalCost + this.phastSummary.totalCost + this.fsatSummary.totalCost + this.ssmtSummary.totalCost,
        totalEnergyUsed: convertedPsatEnergy + this.phastSummary.totalEnergyUsed + convertedFsatEnergy + this.ssmtSummary.totalEnergyUsed
      }
    }, 150);
  }

  calculatePsatSummary() {
    let psatAssessments: Array<Assessment> = _.filter(this.directory.assessments, (assessment) => { return assessment.type == 'PSAT' });
    let totalEnergyUsed: number = 0;
    let totalCost: number = 0;
    psatAssessments.forEach(assessment => {
      if (assessment.psat.setupDone) {
        let assessmentSettings: Settings = this.settingsDbService.getByAssessmentId(assessment);
        let result: PsatOutputs = this.psatService.resultsExisting(assessment.psat.inputs, assessmentSettings);
        totalEnergyUsed = result.annual_energy + totalEnergyUsed;
        totalCost = result.annual_cost + totalCost;
      }
    });
    this.psatSummary = {
      totalAssessments: psatAssessments.length,
      totalCost: totalCost,
      totalEnergyUsed: totalEnergyUsed
    }
  }

  calculatePhastSummary() {
    let phastAssessments: Array<Assessment> = _.filter(this.directory.assessments, (assessment) => { return assessment.type == 'PHAST' });
    let totalEnergyUsed: number = 0;
    let totalCost: number = 0;
    phastAssessments.forEach(assessment => {
      if (assessment.phast.setupDone) {
        let assessmentSettings: Settings = this.settingsDbService.getByAssessmentId(assessment);
        let result: ExecutiveSummary = this.executiveSummaryService.getSummary(assessment.phast, false, assessmentSettings, assessment.phast);
        result.annualEnergyUsed = this.convertUnitsService.value(result.annualEnergyUsed).from(assessmentSettings.energyResultUnit).to(this.directorySettings.energyResultUnit);
        totalEnergyUsed = totalEnergyUsed + result.annualEnergyUsed;
        totalCost = totalCost + result.annualCost;
      }
    });
    this.phastSummary = {
      totalAssessments: phastAssessments.length,
      totalCost: totalCost,
      totalEnergyUsed: totalEnergyUsed
    }
  }

  calculateFsatSummary() {
    let fsatAssessments: Array<Assessment> = _.filter(this.directory.assessments, (assessment) => { return assessment.type == 'FSAT' });
    let totalEnergyUsed: number = 0;
    let totalCost: number = 0;
    fsatAssessments.forEach(assessment => {
      if (assessment.fsat.setupDone) {
        let assessmentSettings: Settings = this.settingsDbService.getByAssessmentId(assessment);
        let result: FsatOutput = this.fsatService.getResults(assessment.fsat, true, assessmentSettings);
        totalEnergyUsed = totalEnergyUsed + result.annualEnergy;
        totalCost = totalCost + result.annualCost;
      }
    });
    this.fsatSummary = {
      totalAssessments: fsatAssessments.length,
      totalCost: totalCost,
      totalEnergyUsed: totalEnergyUsed
    }
  }

  calculateSsmtSummary() {
    let ssmtAssessments: Array<Assessment> = _.filter(this.directory.assessments, (assessment) => { return assessment.type == 'SSMT' });
    let totalEnergyUsed: number = 0;
    let totalCost: number = 0;
    ssmtAssessments.forEach(assessment => {
      if (assessment.ssmt.setupDone) {
        let assessmentSettings: Settings = this.settingsDbService.getByAssessmentId(assessment);
        let results: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateModel(assessment.ssmt, assessmentSettings, true, 0);
        results.outputData.operationsOutput.boilerFuelUsage = this.convertUnitsService.value(results.outputData.operationsOutput.boilerFuelUsage).from(assessmentSettings.steamEnergyMeasurement).to(this.directorySettings.energyResultUnit)
        totalEnergyUsed = results.outputData.operationsOutput.boilerFuelUsage + totalEnergyUsed;
        totalCost = results.outputData.operationsOutput.totalOperatingCost + totalCost;
      }
    });
    this.ssmtSummary = {
      totalAssessments: ssmtAssessments.length,
      totalCost: totalCost,
      totalEnergyUsed: totalEnergyUsed
    }
  }


  showSettingsModal() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.directorySettings);
    this.settingsModal.show();
  }

  hideSettingsModal() {
    this.settingsModal.hide();
  }

  updateSettings() {
    let id = this.directorySettings.id;
    this.directorySettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.directorySettings.directoryId = this.directory.id;
    this.directorySettings.id = id;
    this.indexedDbService.putSettings(this.directorySettings).then(() => {
      this.settingsDbService.setAll().then(() => {
        this.calculateSummary();
        this.settingsModal.hide();
      });
    });
  }
}


export interface AssessmentTypeSummary {
  totalAssessments: number;
  totalEnergyUsed: number;
  totalCost: number;
}