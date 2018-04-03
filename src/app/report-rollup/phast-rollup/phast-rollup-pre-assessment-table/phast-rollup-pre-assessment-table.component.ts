import { Component, OnInit, Input } from '@angular/core';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from '../../../shared/models/settings';
import { Calculator } from '../../../shared/models/calculators';
import { PreAssessmentService } from '../../../calculator/furnaces/pre-assessment/pre-assessment.service';
import { PreAssessment } from '../../../calculator/furnaces/pre-assessment/pre-assessment';
import { MeteredEnergy } from '../../../shared/models/phast/meteredEnergy';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-phast-rollup-pre-assessment-table',
  templateUrl: './phast-rollup-pre-assessment-table.component.html',
  styleUrls: ['./phast-rollup-pre-assessment-table.component.css']
})
export class PhastRollupPreAssessmentTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  calculator: Calculator;

  preAssessments: Array<PreAssessment>;
  graphColors: Array<string>;

  data: Array<{ name: string, type: string, totalEnergyUse: number, totalEnergyCost: number, percentEnergyUse: number, percentEnergyCost: number, color: string }>;
  unit: string
  totalEnergyUse: number;
  totalEnergyCost: number;
  directorySettings: Settings;

  constructor(private preAssessmentService: PreAssessmentService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.totalEnergyUse = 0;
    this.totalEnergyCost = 0;
    this.unit = this.settings.energyResultUnit;
    this.graphColors = graphColors;
    this.getDirectorySettings();
  }

  getDirectorySettings() {
    this.indexedDbService.getDirectorySettings(this.calculator.directoryId).then(results => {
      if (results.length != 0) {
        this.directorySettings = results[0];
        this.getData();
      }
    });
  }

  getData(): void {
    if (this.calculator !== undefined) {
      if (this.calculator.preAssessments !== undefined) {
        this.preAssessments = this.calculator.preAssessments;
      }
    }
    this.data = new Array<{ name: string, type: string, totalEnergyUse: number, totalEnergyCost: number, percentEnergyUse: number, percentEnergyCost: number, color: string }>();
    if (this.preAssessments !== undefined) {

      for (let i = this.preAssessments.length - 1; i >= 0; i--) {
        let name: string, type: string, totalEnergyUse: number, totalEnergyCost: number, percentEnergyUse: number, percentEnergyCost: number, color: string;

        if (this.preAssessments[i].type == 'Designed') {
          let tmpResult = this.preAssessmentService.calculateDesigned(this.preAssessments[i], this.directorySettings);
          let energyCost = this.getEnergyCost(this.preAssessments[i], totalEnergyUse);
          let tmpData = { name: tmpResult.name, type: 'Designed', totalEnergyUse: tmpResult.value, totalEnergyCost: energyCost, percentEnergyUse: tmpResult.percent, percentEnergyCost: -1, color: this.graphColors[((this.preAssessments.length - 1) - i) % (this.graphColors.length - 1)] };
          this.data.push(tmpData);
          this.totalEnergyUse += tmpResult.value;
          this.totalEnergyCost += energyCost;
        }
        else if (this.preAssessments[i].type == 'Metered') {
          let collectionTime = this.getEnergyCollectionTime(this.preAssessments[i]);
          let tmpResult = this.preAssessmentService.calculateMetered(this.preAssessments[i], this.directorySettings);
          let totalEnergyUse = tmpResult.value;
          let energyCost = this.getEnergyCost(this.preAssessments[i], totalEnergyUse);
          let tmpData = { name: tmpResult.name, type: 'Metered', totalEnergyUse: totalEnergyUse, totalEnergyCost: energyCost, percentEnergyUse: tmpResult.percent, percentEnergyCost: -1, color: this.graphColors[((this.preAssessments.length - 1) - i) % (this.graphColors.length - 1)] };
          this.data.push(tmpData);
          this.totalEnergyUse += tmpResult.value;
          this.totalEnergyCost += energyCost;

        }
      }
      this.getPercentages();
    }
  }

  getEnergyCost(assessment: PreAssessment, energyUse: number): number {
    let cost: number;
    if (assessment.settings.energySourceType === 'Fuel') {
      if (this.directorySettings.fuelCost === undefined) {
        cost = 0;
      }
      else {
        cost = energyUse * this.directorySettings.fuelCost;
      }
    }
    else if (assessment.settings.energySourceType === 'Steam') {
      if (this.directorySettings.steamCost === undefined) {
        cost = 0;
      }
      else {
        cost = energyUse * this.directorySettings.steamCost;
      }
    }
    else if (assessment.settings.energySourceType === 'Electricity') {
      if (this.directorySettings.electricityCost === undefined) {
        cost = 0;
      }
      else {
        cost = energyUse * this.directorySettings.electricityCost;
      }
    }
    else {
      cost = 0;
    }
    return cost;
  }

  getPercentages(): void {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i].percentEnergyUse = (this.data[i].totalEnergyUse / this.totalEnergyUse);
      this.data[i].percentEnergyCost = (this.data[i].totalEnergyCost / this.totalEnergyCost);
    }
  }

  getEnergyCollectionTime(source: PreAssessment): number {
    if (source.meteredEnergy.meteredEnergyFuel) {
      return source.meteredEnergy.meteredEnergyFuel.collectionTime;
    }
    else if (source.meteredEnergy.meteredEnergySteam) {
      return source.meteredEnergy.meteredEnergySteam.collectionTime;
    }
    else if (source.meteredEnergy.meteredEnergyElectricity) {
      return source.meteredEnergy.meteredEnergyElectricity.electricityCollectionTime;
    }
    else {
      return 0;
    }
  }

  // getData() {
  //   if (this.calculator) {
  //     if (this.calculator.preAssessments) {

  //       this.preAssessments = this.calculator.preAssessments;
  //     }
  //   }
  //   this.data = new Array<{ name: string, percent: number, color: string }>();
  //   if (this.preAssessments) {
  //     let tmpArray = new Array<{ name: string, percent: number, value: number, color: string }>();
  //     tmpArray = this.preAssessmentService.getResults(this.preAssessments, this.directorySettings, 'value');
  //     for (let i = tmpArray.length - 1; i >= 0; i--) {
  //       this.data.unshift({
  //         name: tmpArray[i].name,
  //         percent: Math.round(tmpArray[i].percent * 100) / 100,
  //         color: this.graphColors[(tmpArray.length - 1) - i]
  //       });
  //     }
  //   }
  // }
}
