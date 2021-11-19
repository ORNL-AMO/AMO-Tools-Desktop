import { Component, OnInit, ViewChild } from '@angular/core';
import { DirectoryDashboardService } from '../directory-dashboard.service';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { FormGroup } from '@angular/forms';
import { DashboardService } from '../../dashboard.service';
import { Subscription } from 'rxjs';
import { Directory } from '../../../shared/models/directory';
import { Settings, FacilityInfo } from '../../../shared/models/settings';
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
import { WasteWaterService } from '../../../waste-water/waste-water.service';
import { WasteWaterResults } from '../../../shared/models/waste-water';
import { BaselineResults, CompressedAirAssessmentResultsService } from '../../../compressed-air-assessment/compressed-air-assessment-results.service';

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
  wasteWaterSummary: AssessmentTypeSummary;
  compressedAirSummary: AssessmentTypeSummary;

  settingsForm: FormGroup;
  updateDashboardDataSub: Subscription;
  directoryIdSub: Subscription;
  counter: NodeJS.Timeout;
  constructor(private directoryDashboardService: DirectoryDashboardService, private directoryDbService: DirectoryDbService,
    private dashboardService: DashboardService, private settingsDbService: SettingsDbService, private psatService: PsatService,
    private executiveSummaryService: ExecutiveSummaryService, private convertUnitsService: ConvertUnitsService, private fsatService: FsatService,
    private ssmtService: SsmtService, private settingsService: SettingsService, private indexedDbService: IndexedDbService,
    private wasteWaterService: WasteWaterService, private compressedAirAssessmentResultsService: CompressedAirAssessmentResultsService
  ) { }

  ngOnInit() {
    this.directoryIdSub = this.directoryDashboardService.selectedDirectoryId.subscribe(idVal => {
      this.directory = this.directoryDbService.getById(idVal);
      this.directorySettings = this.settingsDbService.getByDirectoryId(idVal);
      this.calculateSummary();
    })

    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      this.directory = this.directoryDbService.getById(this.directory.id);
      this.calculateSummary();
    });
  }

  ngOnDestroy() {
    this.updateDashboardDataSub.unsubscribe();
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
      this.calculateWasteWaterSummary();
      this.calculateCompressedAirSummary();
      let convertedFsatEnergy: number = this.convertUnitsService.value(this.fsatSummary.totalEnergyUsed).from('MWh').to(this.directorySettings.energyResultUnit);
      let convertedPsatEnergy: number = this.convertUnitsService.value(this.psatSummary.totalEnergyUsed).from('MWh').to(this.directorySettings.energyResultUnit);
      let convertedWasteWaterEnergy: number = this.convertUnitsService.value(this.wasteWaterSummary.totalEnergyUsed).from('MWh').to(this.directorySettings.energyResultUnit);
      let convertedCompressedAirEnergy: number =this.convertUnitsService.value(this.compressedAirSummary.totalEnergyUsed).from('MWh').to(this.directorySettings.energyResultUnit);
      this.totalSummary = {
        totalAssessments: this.psatSummary.totalAssessments + this.phastSummary.totalAssessments + this.fsatSummary.totalAssessments + this.ssmtSummary.totalAssessments + this.wasteWaterSummary.totalAssessments + this.compressedAirSummary.totalAssessments,
        totalCost: this.psatSummary.totalCost + this.phastSummary.totalCost + this.fsatSummary.totalCost + this.ssmtSummary.totalCost + this.wasteWaterSummary.totalCost + this.compressedAirSummary.totalCost,
        totalEnergyUsed: convertedPsatEnergy + this.phastSummary.totalEnergyUsed + convertedFsatEnergy + this.ssmtSummary.totalEnergyUsed + convertedWasteWaterEnergy + convertedCompressedAirEnergy
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
        let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
        let results: { inputData: SSMTInputs, outputData: SSMTOutput } = this.ssmtService.calculateBaselineModel(assessment.ssmt, settings);
        if (results.outputData.boilerOutput != undefined) {
          results.outputData.operationsOutput.boilerFuelUsage = this.convertUnitsService.value(results.outputData.operationsOutput.boilerFuelUsage).from(settings.steamEnergyMeasurement).to(this.directorySettings.energyResultUnit)
          totalEnergyUsed = results.outputData.operationsOutput.boilerFuelUsage + totalEnergyUsed;
          totalCost = results.outputData.operationsOutput.totalOperatingCost + totalCost;
        }
      }
    });
    this.ssmtSummary = {
      totalAssessments: ssmtAssessments.length,
      totalCost: totalCost,
      totalEnergyUsed: totalEnergyUsed
    }
  }

  calculateWasteWaterSummary() {
    let wasteWaterAssessments: Array<Assessment> = _.filter(this.directory.assessments, (assessment) => { return assessment.type == 'WasteWater' });
    let totalEnergyUsed: number = 0;
    let totalCost: number = 0;
    wasteWaterAssessments.forEach(assessment => {
      if (assessment.wasteWater.setupDone) {
        let settings: Settings = this.settingsDbService.getByAssessmentId(assessment);
        let results: WasteWaterResults = this.wasteWaterService.calculateResults(assessment.wasteWater.baselineData.activatedSludgeData, assessment.wasteWater.baselineData.aeratorPerformanceData, assessment.wasteWater.baselineData.operations, settings, false);
        if (results.AeEnergyAnnual != undefined) {
          totalEnergyUsed = results.AeEnergyAnnual + totalEnergyUsed;
          totalCost = results.AeCost + totalCost;
        }
      }
    });
    this.wasteWaterSummary = {
      totalAssessments: wasteWaterAssessments.length,
      totalCost: totalCost,
      totalEnergyUsed: totalEnergyUsed
    }
  }

  calculateCompressedAirSummary(){
    let compressedAirAssessments: Array<Assessment> = _.filter(this.directory.assessments, (assessment) => { return assessment.type == 'CompressedAir' });
    let totalEnergyUsed: number = 0;
    let totalCost: number = 0;
    compressedAirAssessments.forEach(assessment => {
      if(assessment.compressedAirAssessment.setupDone){
        let assessmentSettings: Settings = this.settingsDbService.getByAssessmentId(assessment);
        let baselineResults: BaselineResults = this.compressedAirAssessmentResultsService.calculateBaselineResults(assessment.compressedAirAssessment, assessmentSettings);
        totalCost += baselineResults.total.totalAnnualOperatingCost;
        totalEnergyUsed += (baselineResults.total.energyUse / 1000);
      }
    });
    this.compressedAirSummary = {
      totalAssessments: compressedAirAssessments.length,
      totalEnergyUsed: totalEnergyUsed,
      totalCost: totalCost
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
    let facilityInfo: FacilityInfo = this.directorySettings.facilityInfo;
    this.directorySettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.directorySettings.directoryId = this.directory.id;
    this.directorySettings.id = id;
    this.directorySettings.facilityInfo = facilityInfo;
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