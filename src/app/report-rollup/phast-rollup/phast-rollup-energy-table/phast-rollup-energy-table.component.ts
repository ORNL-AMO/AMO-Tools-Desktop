import { Component, OnInit, Input } from '@angular/core';
import { ReportRollupService, PhastCompare, PhastResultsData } from '../../report-rollup.service';
import { SuiteDbService } from '../../../suiteDb/suite-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { CalculatedByPhast, PhastResults, PHAST } from '../../../shared/models/phast/phast';
import { PhastResultsService } from '../../../phast/phast-results.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { setTimeout } from 'timers';
import * as _ from 'lodash';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { DesignedEnergyService } from '../../../phast/designed-energy/designed-energy.service';
import { MeteredEnergyService } from '../../../phast/metered-energy/metered-energy.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-phast-rollup-energy-table',
  templateUrl: './phast-rollup-energy-table.component.html',
  styleUrls: ['./phast-rollup-energy-table.component.css']
})
export class PhastRollupEnergyTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  steamTotalEnergy: number = 0;
  electricityTotalEnergy: number = 0;
  fuelSummary: Array<PhastRollupEnergySummaryItem>;
  electricitySummary: PhastRollupEnergySummaryItem;
  steamSummary: Array<PhastRollupEnergySummaryItem>;
  timeoutVal: any;
  tmpArr: Array<{ assessment: Assessment, settings: Settings }>;
  electricityHeatingValue: number = 0;
  baseEnergyUnit: string;
  energyCostUnit: string;
  energyPerMassUnit: string;
  energyPerTimeUnit: string;
  resultsSub: Subscription;
  constructor(private convertUnitsService: ConvertUnitsService, private indexedDbService: IndexedDbService, private phastResultsService: PhastResultsService, private reportRollupService: ReportRollupService, private suiteDbService: SuiteDbService,
    private designedEnergyService: DesignedEnergyService, private meteredEnergyService: MeteredEnergyService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.checkSettings(this.settings);
    this.resultsSub = this.reportRollupService.phastResults.subscribe(val => {
      if (val.length) {
        this.tmpArr = new Array();
        this.getUnits();
        this.electricityHeatingValue = this.convertUnitsService.value(9800).from('Btu').to(this.settings.phastRollupUnit);
        val.forEach(result => {
          let tmpSettings = this.reportRollupService.checkSettings(result.settings);
          let test = _.find(this.tmpArr, (val) => {
            return val.assessment.id == result.assessmentId
          })
          if (test == undefined) {
            this.tmpArr.push({
              assessment: result.assessment,
              settings: result.settings
            })
            this.initResults();
            this.getData(this.tmpArr);
          }
        })
      }
    })
  }

  ngOnDestroy(){
    this.resultsSub.unsubscribe();
  }


  getData(dataArr: Array<any>) {
    dataArr.forEach(data => {
      let tmpResults: PhastResults = this.phastResultsService.getResults(data.assessment.phast, data.settings);
      tmpResults.grossHeatInput = this.convertUnitsService.value(tmpResults.grossHeatInput).from(data.settings.energyResultUnit).to(this.settings.phastRollupUnit);
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
      }

      this.electricitySummary = {
        name: 'Electricity',
        energyUsed: this.electricityTotalEnergy,
        hhv: this.electricityHeatingValue,
        cost: data.assessment.phast.operatingCosts.electricityCost
      }
    })
  }

  getSteam(assessment: Assessment, settings: Settings, tmpResults: PhastResults): PhastRollupEnergySummaryItem {
    let tmpItem: PhastRollupEnergySummaryItem = {
      name: assessment.name,
      energyUsed: tmpResults.grossHeatInput,
      hhv: 0,
      cost: assessment.phast.operatingCosts.steamCost
    }
    let steamHeatingValue = 0;
    let meteredResults, designedResults;
    if (assessment.phast.meteredEnergy) {
      if (assessment.phast.meteredEnergy.meteredEnergySteam) {
        meteredResults = this.meteredEnergyService.meteredSteam(assessment.phast.meteredEnergy.meteredEnergySteam, assessment, settings);
        steamHeatingValue = assessment.phast.meteredEnergy.meteredEnergySteam.totalHeatSteam;
        steamHeatingValue = this.convertUnitsService.value(steamHeatingValue).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
      }
    }

    // if (assessment.phast.designedEnergy) {
    //   if (assessment.phast.designedEnergy.designedEnergySteam) {
    //     designedResults = this.designedEnergyService.designedEnergySteam(assessment.phast.designedEnergy.designedEnergySteam, assessment, settings);
    //     if (!steamHeatingValue) {
    //       let hhvSum = _.sumBy(assessment.phast.designedEnergy.designedEnergySteam, 'totalHeat')
    //       hhvSum = this.convertUnitsService.value(hhvSum).from(settings.energyResultUnit).to(this.settings.phastRollupUnit)
    //       steamHeatingValue = hhvSum / assessment.phast.designedEnergy.designedEnergySteam.length;
    //     }
    //   }
    // }
    tmpItem.hhv = steamHeatingValue;

    return tmpItem;
  }


  getFuel(assessment: Assessment, settings: Settings, tmpResults: PhastResults): PhastRollupEnergySummaryItem {
    let tmpItem: PhastRollupEnergySummaryItem = {
      name: '',
      energyUsed: 0,
      hhv: 0,
      cost: 0
    }
    if (assessment.phast.losses.flueGasLosses[0].flueGasType == 'By Mass') {
      let gas = this.suiteDbService.selectSolidLiquidFlueGasMaterialById(assessment.phast.losses.flueGasLosses[0].flueGasByMass.gasTypeId);
      tmpItem.name = gas.substance;
      tmpItem.hhv = this.convertHHV(gas.heatingValue, settings);
    } else if (assessment.phast.losses.flueGasLosses[0].flueGasType == 'By Volume') {
      let gas = this.suiteDbService.selectGasFlueGasMaterialById(assessment.phast.losses.flueGasLosses[0].flueGasByVolume.gasTypeId);
      tmpItem.name = gas.substance;
      tmpItem.hhv = this.convertHHV(gas.heatingValue, settings);
    }
    tmpItem.energyUsed = tmpResults.grossHeatInput;
    //TODO
    tmpItem.cost = assessment.phast.operatingCosts.fuelCost;
    return tmpItem;
  }

  convertHHV(val: number, settings: Settings): number {
    if (settings.unitsOfMeasure == 'Metric') {
      val = this.convertUnitsService.value(val).from('kJ').to(settings.phastRollupUnit);
    } else {
      val = this.convertUnitsService.value(val).from('Btu').to(settings.phastRollupUnit);
    }
    return val;
  }

  initResults() {
    this.electricityTotalEnergy = 0;
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
    if (this.settings.phastRollupUnit != 'kWh') {
      this.baseEnergyUnit = this.settings.phastRollupUnit + '/hr'
    } else {
      this.baseEnergyUnit = this.settings.phastRollupUnit;
    }
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.energyCostUnit = '/GJ';
      this.energyPerMassUnit = this.settings.phastRollupUnit + '/kg';
      this.energyPerTimeUnit = this.settings.phastRollupUnit + '/kWh';
    } else if (this.settings.unitsOfMeasure == 'Imperial') {
      this.energyCostUnit = '/MMBtu';
      this.energyPerMassUnit = this.settings.phastRollupUnit + '/lb';
      this.energyPerTimeUnit = this.settings.phastRollupUnit + '/kWh';
    }
  }
}

export interface PhastRollupEnergySummaryItem {
  name: string,
  energyUsed: number,
  hhv: number,
  cost: number
}