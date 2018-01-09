import { Component, OnInit, Input } from '@angular/core';
import { ReportRollupService, PhastCompare } from '../../report-rollup.service';
import { SuiteDbService } from '../../../suiteDb/suite-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { CalculatedByPhast, PhastResults } from '../../../shared/models/phast/phast';
import { PhastResultsService } from '../../../phast/phast-results.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { setTimeout } from 'timers';
import * as _ from 'lodash';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-phast-rollup-energy-table',
  templateUrl: './phast-rollup-energy-table.component.html',
  styleUrls: ['./phast-rollup-energy-table.component.css']
})
export class PhastRollupEnergyTableComponent implements OnInit {
  @Input()
  settings: Settings;

  steamTotalEnergy: number = 0;
  electricityTotalEnergy: number = 0;
  fuelSummary: Array<PhastRollupEnergySummaryItem>;
  electricitySummary: PhastRollupEnergySummaryItem;
  steamSummary: Array<PhastRollupEnergySummaryItem>;
  timeoutVal: any;
  tmpArr: Array<{ assessment: PhastCompare, settings: Settings }>;
  electricityHeatingValue: number = 0;
  baseEnergyUnit: string;
  energyCostUnit: string;
  energyPerMassUnit: string;
  energyPerTimeUnit: string;
  constructor(private convertUnitsService: ConvertUnitsService, private indexedDbService: IndexedDbService, private phastResultsService: PhastResultsService, private reportRollupService: ReportRollupService, private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.checkSettings(this.settings);
    this.getUnits();
    this.electricityHeatingValue = this.convertUnitsService.value(9800).from('Btu').to(this.settings.energyResultUnit);
    this.reportRollupService.selectedPhasts.subscribe(val => {
      if (val.length) {
        this.tmpArr = new Array();
        val.forEach(assessment => {
          this.indexedDbService.getAssessmentSettings(assessment.assessmentId).then(settingsArr => {
            let tmpSettings = this.reportRollupService.checkSettings(settingsArr[0]);
            let test = _.find(this.tmpArr, (val) => {
              return val.assessment.assessmentId == assessment.assessmentId
            })
            if (test == undefined) {
              this.tmpArr.push({
                assessment: assessment,
                settings: tmpSettings
              })
              this.initResults();
              this.getData(this.tmpArr);
            }
          })
        })
      }
    })
  }

  getData(dataArr: Array<any>) {
    dataArr.forEach(data => {
      let tmpResults: PhastResults = this.phastResultsService.getResults(data.assessment.baseline, data.settings);
      tmpResults.grossHeatInput = this.convertUnitsService.value(tmpResults.grossHeatInput).from(data.settings.energyResultUnit).to(this.settings.energyResultUnit);
      if (data.settings.energySourceType == 'Fuel') {
        let tmpItem = this.getFuel(data.assessment, data.settings, tmpResults);
        let test = _.find(this.fuelSummary, (val) => { return val.name == tmpItem.name });
        if (test == undefined) {
          this.fuelSummary.push(tmpItem);
        } else {
          test.energyUsed += tmpItem.energyUsed;
        }
      }

      else if (data.settings.energySourceType == 'Electricity') {
        this.electricityTotalEnergy += tmpResults.grossHeatInput;
      }

      else if (data.settings.energySourceType == 'Steam') {
        let tmpItem = this.getSteam(data.assessment, data.settings, tmpResults);
        this.steamSummary.push(tmpItem);
        //this.steamTotalEnergy += tmpResults.grossHeatInput;
      }

      // this.steamSummary = {
      //   name: 'Steam',
      //   energyUsed: this.steamTotalEnergy,
      //   hhv: 1,
      //   cost: data.assessment.baseline.operatingCosts.steamCost
      // }
      this.electricitySummary = {
        name: 'Electricity',
        energyUsed: this.electricityTotalEnergy,
        hhv: this.electricityHeatingValue,
        cost: data.assessment.baseline.operatingCosts.electricityCost
      }
    })
  }

  getSteam(assessment: PhastCompare, settings: Settings, tmpResults: PhastResults): PhastRollupEnergySummaryItem {
    let tmpItem: PhastRollupEnergySummaryItem = {
      name: assessment.name,
      energyUsed: tmpResults.grossHeatInput,
      hhv: 0,
      cost: assessment.baseline.operatingCosts.steamCost
    }


    return tmpItem;
  }


  getFuel(assessment: PhastCompare, settings: Settings, tmpResults: PhastResults): PhastRollupEnergySummaryItem {
    let tmpItem: PhastRollupEnergySummaryItem = {
      name: '',
      energyUsed: 0,
      hhv: 0,
      cost: 0
    }
    if (assessment.baseline.losses.flueGasLosses[0].flueGasType == 'By Mass') {
      let gas = this.suiteDbService.selectSolidLiquidFlueGasMaterialById(assessment.baseline.losses.flueGasLosses[0].flueGasByMass.gasTypeId);
      tmpItem.name = gas.substance;
      tmpItem.hhv = this.convertHHV(gas.heatingValue, settings);
    } else if (assessment.baseline.losses.flueGasLosses[0].flueGasType == 'By Volume') {
      let gas = this.suiteDbService.selectGasFlueGasMaterialById(assessment.baseline.losses.flueGasLosses[0].flueGasByVolume.gasTypeId);
      tmpItem.name = gas.substance;
      tmpItem.hhv = this.convertHHV(gas.heatingValue, settings);
    }
    tmpItem.energyUsed = tmpResults.grossHeatInput;
    //TODO
    tmpItem.cost = assessment.baseline.operatingCosts.fuelCost;
    return tmpItem;
  }

  convertHHV(val: number, settings: Settings): number {
    if (settings.unitsOfMeasure == 'Metric') {
      val = this.convertUnitsService.value(val).from('kJ').to(settings.energyResultUnit);
    } else {
      val = this.convertUnitsService.value(val).from('Btu').to(settings.energyResultUnit);
    }
    return val;
  }

  initResults() {
    this.fuelSummary = new Array();
    this.steamSummary = new Array();
    this.electricitySummary = {
      name: 'Electricity',
      energyUsed: this.electricityTotalEnergy,
      hhv: 0,
      cost: 0
    }
  }


  getUnits() {
    if (this.settings.energyResultUnit != 'kWh') {
      this.baseEnergyUnit = this.settings.energyResultUnit + '/hr'
    } else {
      this.baseEnergyUnit = this.settings.energyResultUnit;
    }
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.energyCostUnit = '/GJ';
      this.energyPerMassUnit = this.settings.energyResultUnit + '/kg';
      this.energyPerTimeUnit = this.settings.energyResultUnit + '/kWh';
    } else if (this.settings.unitsOfMeasure == 'Imperial') {
      this.energyCostUnit = '/MMBtu';
      this.energyPerMassUnit = this.settings.energyResultUnit + '/lb';
      this.energyPerTimeUnit = this.settings.energyResultUnit + '/kWh';
    }
  }
}

export interface PhastRollupEnergySummaryItem {
  name: string,
  energyUsed: number,
  hhv: number,
  cost: number
}