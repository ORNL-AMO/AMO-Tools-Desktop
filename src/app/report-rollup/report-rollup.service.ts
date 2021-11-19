import { Injectable } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { BehaviorSubject } from 'rxjs';
import { Directory } from '../shared/models/directory';
import * as _ from 'lodash';
import { SettingsService } from '../settings/settings.service';
import { Settings } from '../shared/models/settings';
import { Calculator } from '../shared/models/calculators';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { ReportItem, } from './report-rollup-models';
import { PsatReportRollupService } from './psat-report-rollup.service';
import { PhastReportRollupService } from './phast-report-rollup.service';
import { FsatReportRollupService } from './fsat-report-rollup.service';
import { SsmtReportRollupService } from './ssmt-report-rollup.service';
import { TreasureHuntReportRollupService } from './treasure-hunt-report-rollup.service';
import { WasteWaterReportRollupService } from './waste-water-report-rollup.service';
import { CompressedAirReportRollupService } from './compressed-air-report-rollup.service';

@Injectable()
export class ReportRollupService {

  reportAssessments: BehaviorSubject<Array<ReportItem>>;
  assessmentsArray: Array<ReportItem>;
  calcsArray: Array<Calculator>;
  selectedCalcs: BehaviorSubject<Array<Calculator>>;
  showSummaryModal: BehaviorSubject<string>;
  settings: BehaviorSubject<Settings>;
  constructor(
    private settingsService: SettingsService,
    private directoryDbService: DirectoryDbService,
    private assessmentDbService: AssessmentDbService,
    private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService,

    private psatReportRollupService: PsatReportRollupService,
    private phastReportRollupService: PhastReportRollupService,
    private fsatReportRollupService: FsatReportRollupService,
    private ssmtReportRollupService: SsmtReportRollupService,
    private treasureHuntReportRollupService: TreasureHuntReportRollupService,
    private wasteWaterReportRollupService: WasteWaterReportRollupService,
    private compressedAirReportRollupService: CompressedAirReportRollupService

  ) {
    this.initSummary();
  }

  initSummary() {
    this.psatReportRollupService.initSummary();
    this.phastReportRollupService.initSummary();
    this.fsatReportRollupService.initSummary();
    this.ssmtReportRollupService.initSummary();
    this.treasureHuntReportRollupService.initSummary();
    this.wasteWaterReportRollupService.initSummary();
    this.compressedAirReportRollupService.initSummary();
    this.reportAssessments = new BehaviorSubject<Array<ReportItem>>(new Array<ReportItem>());
    this.calcsArray = new Array<Calculator>();
    this.selectedCalcs = new BehaviorSubject<Array<Calculator>>(new Array<Calculator>());
    this.showSummaryModal = new BehaviorSubject<string>(undefined);
    this.settings = new BehaviorSubject<Settings>(undefined);
  }

  pushAssessment(assessment: Assessment) {
    let settings = this.settingsDbService.getByAssessmentId(assessment);
    let tmpSettings = this.checkSettings(settings);
    this.assessmentsArray.push({ assessment: assessment, settings: tmpSettings });
  }

  getReportData(directory: Directory) {
    this.assessmentsArray = new Array<ReportItem>();
    this.calcsArray = new Array<Calculator>();
    let selected = directory.assessments.filter((val) => { return val.selected; });
    selected.forEach(assessment => {
      this.pushAssessment(assessment);
    });
    if (directory.calculators) {
      directory.calculators.forEach(calc => {
        if (calc.selected == true && calc.preAssessments) {
          this.calcsArray.push(calc);
        }
      })
      this.selectedCalcs.next(this.calcsArray);
    }
    directory.subDirectory.forEach(subDir => {
      if (subDir.selected) {
        this.getChildDirectoryAssessments(subDir.id);
        this.getChildDirectories(subDir);
      }
    });
    let phastArray: Array<ReportItem> = _.filter(this.assessmentsArray, (assessmentItem) => { return assessmentItem.assessment.type === 'PHAST' });
    this.phastReportRollupService.phastAssessments.next(phastArray);
    let psatArray: Array<ReportItem> = _.filter(this.assessmentsArray, (assessmentItem) => { return assessmentItem.assessment.type === 'PSAT' });
    this.psatReportRollupService.psatAssessments.next(psatArray);
    let fsatArray: Array<ReportItem> = _.filter(this.assessmentsArray, (assessmentItem) => { return assessmentItem.assessment.type === 'FSAT' });
    this.fsatReportRollupService.fsatAssessments.next(fsatArray);
    let ssmtArray: Array<ReportItem> = _.filter(this.assessmentsArray, (assessmentItem) => { return assessmentItem.assessment.type === 'SSMT' });
    this.ssmtReportRollupService.ssmtAssessments.next(ssmtArray);
    let treasureHuntArray: Array<ReportItem> = _.filter(this.assessmentsArray, (assessmentItem) => { return assessmentItem.assessment.type === 'TreasureHunt' });
    this.treasureHuntReportRollupService.treasureHuntAssessments.next(treasureHuntArray);
    let wasteWaterArray: Array<ReportItem> = _.filter(this.assessmentsArray, (assessmentItem) => { return assessmentItem.assessment.type === 'WasteWater' });
    this.wasteWaterReportRollupService.wasteWaterAssessments.next(wasteWaterArray);
    let compressedAirArray: Array<ReportItem> = _.filter(this.assessmentsArray, (assessmentItem) => { return assessmentItem.assessment.type === 'CompressedAir' });
    this.compressedAirReportRollupService.compressedAirAssessments.next(compressedAirArray);
    this.reportAssessments.next(this.assessmentsArray);
  }

  getChildDirectories(subDir: Directory) {
    let calcs = this.calculatorDbService.getByDirectoryId(subDir.id);
    if (calcs) {
      for (let i = 0; i < calcs.length; i++) {
        if (calcs[i].preAssessments) {
          this.calcsArray.push(calcs[i]);
        }
      }
      this.selectedCalcs.next(this.calcsArray);
    }
    let subDirResults = this.directoryDbService.getSubDirectoriesById(subDir.id);
    if (subDirResults) {
      subDirResults.forEach(dir => {
        this.getChildDirectoryAssessments(dir.id);
        this.getChildDirectories(dir);
      });
    }
  }

  getChildDirectoryAssessments(dirId: number) {
    let results = this.assessmentDbService.getByDirectoryId(dirId);
    results.forEach(assessment => {
      this.pushAssessment(assessment);
    });
  }

  checkSettings(settings: Settings) {
    if (!settings.energyResultUnit) {
      settings = this.settingsService.setEnergyResultUnitSetting(settings);
    }
    if (!settings.phastRollupUnit) {
      settings = this.settingsService.setPhastResultUnit(settings);
    }
    if (!settings.temperatureMeasurement) {
      if (settings.unitsOfMeasure === 'Metric') {
        settings.temperatureMeasurement = 'C';
      } else {
        settings.temperatureMeasurement = 'F';
      }
    }
    return settings;
  }

  setReportRollupSettings(directoryId: number) {
    let settings: Settings = this.settingsDbService.getByDirectoryId(directoryId);
    settings = this.checkSettings(settings);
    this.settings.next(settings);
  }

  transform(value: number, sigFigs: number, scientificNotation?: boolean): any {
    if (isNaN(value) === false && value != null && value !== undefined) {
      //string value of number in scientific notation
      let newValString = value.toPrecision(sigFigs);
      //converted to number to get trailing/leading zeros
      let newValNumber = parseFloat(newValString);
      //convert back to string
      let numWithZerosAndCommas = newValNumber.toLocaleString();
      if (scientificNotation) {
        return newValString;
      } else {
        return numWithZerosAndCommas;
      }
    } else {
      return value;
    }
  }

}
