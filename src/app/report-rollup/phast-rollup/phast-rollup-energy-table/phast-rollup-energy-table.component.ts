import { Component, OnInit, Input } from '@angular/core';
import { ReportRollupService } from '../../report-rollup.service';
import { SuiteDbService } from '../../../suiteDb/suite-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { PhastResults, PHAST } from '../../../shared/models/phast/phast';
import * as _ from 'lodash';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PhastResultsData } from '../../report-rollup-models';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../../shared/models/materials';
import { PhastReportRollupService } from '../../phast-report-rollup.service';

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

  fuelSummary: Array<PhastRollupEnergySummaryItem>;
  electricitySummary: PhastRollupEnergySummaryItem;
  steamSummary: Array<PhastRollupEnergySummaryItem>;
  baseEnergyUnit: string;
  energyCostUnit: string;
  energyPerMassUnit: string;
  energyPerTimeUnit: string;
  constructor(private convertUnitsService: ConvertUnitsService, private reportRollupService: ReportRollupService, private suiteDbService: SuiteDbService,
    private phastReportRollupService: PhastReportRollupService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.checkSettings(this.settings);
    this.setUnits();
    let phastResults: Array<PhastResultsData> = JSON.parse(JSON.stringify(this.phastReportRollupService.selectedPhastResults));
    let fuelResults: Array<PhastResultsData> = phastResults.filter(resultItem => { return resultItem.settings.energySourceType == 'Fuel' });
    this.setFuelSummary(fuelResults);
    let electricityResults: Array<PhastResultsData> = phastResults.filter(resultItem => { return resultItem.settings.energySourceType == 'Electricity' });
    this.setElectricitySummary(electricityResults);
    let steamResults: Array<PhastResultsData> = phastResults.filter(resultItem => { return resultItem.settings.energySourceType == 'Steam' });
    this.setSteamSummary(steamResults);
  }

  setFuelSummary(fuelResults: Array<PhastResultsData>) {
    this.fuelSummary = new Array();
    fuelResults.forEach(result => {
      result.baselineResultData.grossHeatInput = this.convertUnitsService.value(result.baselineResultData.grossHeatInput).from(result.settings.energyResultUnit).to(this.settings.phastRollupUnit);
      let fuelItem: PhastRollupEnergySummaryItem = this.getFuel(result.assessment.phast, result.settings, result.baselineResultData);
      //combine values for same fuel type
      let findFuelItemExists: PhastRollupEnergySummaryItem = _.find(this.fuelSummary, (val) => { return val.name === fuelItem.name; });
      if (findFuelItemExists === undefined) {
        this.fuelSummary.push(fuelItem);
      } else {
        findFuelItemExists.energyUsed += fuelItem.energyUsed;
      }
    });
  }

  setElectricitySummary(electricityResults: Array<PhastResultsData>) {
    let electricityTotalEnergy: number = 0;
    let electricityCost: number = 0;
    electricityResults.forEach(result => {
      result.baselineResultData.grossHeatInput = this.convertUnitsService.value(result.baselineResultData.grossHeatInput).from(result.settings.energyResultUnit).to(this.settings.phastRollupUnit);
      electricityTotalEnergy += result.baselineResultData.grossHeatInput;
      electricityCost += result.assessment.phast.operatingCosts.electricityCost;
    })
    this.electricitySummary = {
      name: 'Electricity',
      energyUsed: electricityTotalEnergy,
      hhv: this.convertUnitsService.value(9800).from('Btu').to(this.settings.phastRollupUnit),
      cost: electricityCost / electricityResults.length
    };
  }

  setSteamSummary(steamResults: Array<PhastResultsData>) {
    this.steamSummary = new Array();
    steamResults.forEach(result => {
      result.baselineResultData.grossHeatInput = this.convertUnitsService.value(result.baselineResultData.grossHeatInput).from(result.settings.energyResultUnit).to(this.settings.phastRollupUnit);
      let steamItem: PhastRollupEnergySummaryItem = this.getSteam(result.assessment, result.settings, result.baselineResultData);
      //combine values for same fuel type
      let findSteamItemExists: PhastRollupEnergySummaryItem = _.find(this.fuelSummary, (val) => { return val.name === steamItem.name; });
      if (findSteamItemExists === undefined) {
        this.steamSummary.push(steamItem);
      } else {
        findSteamItemExists.energyUsed += steamItem.energyUsed;
      }
    });
  }

  getSteam(assessment: Assessment, settings: Settings, tmpResults: PhastResults): PhastRollupEnergySummaryItem {
    let tmpItem: PhastRollupEnergySummaryItem = {
      name: assessment.name,
      energyUsed: tmpResults.grossHeatInput,
      hhv: 0,
      cost: assessment.phast.operatingCosts.steamCost
    };
    let steamHeatingValue = 0;
    if (assessment.phast.meteredEnergy && assessment.phast.meteredEnergy.meteredEnergySteam) {
      steamHeatingValue = assessment.phast.meteredEnergy.meteredEnergySteam.totalHeatSteam;
      steamHeatingValue = this.convertUnitsService.value(steamHeatingValue).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
    }

    if (assessment.phast.designedEnergy && assessment.phast.designedEnergy.steam) {
      let hhvSum: number = 0;
      assessment.phast.designedEnergy.zones.forEach(zone => {
        hhvSum += zone.designedEnergySteam.totalHeat;
      });
      if (!steamHeatingValue) {
        hhvSum = this.convertUnitsService.value(hhvSum).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
        steamHeatingValue = hhvSum / assessment.phast.designedEnergy.zones.length;
      }
    }
    tmpItem.hhv = steamHeatingValue;
    return tmpItem;
  }


  getFuel(phast: PHAST, settings: Settings, tmpResults: PhastResults): PhastRollupEnergySummaryItem {
    let tmpItem: PhastRollupEnergySummaryItem = {
      name: '',
      energyUsed: 0,
      hhv: 0,
      cost: 0
    };
    if (phast.losses.flueGasLosses[0].flueGasType === 'By Mass') {
      let gas: SolidLiquidFlueGasMaterial = this.suiteDbService.selectSolidLiquidFlueGasMaterialById(phast.losses.flueGasLosses[0].flueGasByMass.gasTypeId);
      if (gas) {
        tmpItem.name = gas.substance;
        tmpItem.hhv = this.convertHHV(gas.heatingValue, settings);
      }
    } else if (phast.losses.flueGasLosses[0].flueGasType === 'By Volume') {
      let gas: FlueGasMaterial = this.suiteDbService.selectGasFlueGasMaterialById(phast.losses.flueGasLosses[0].flueGasByVolume.gasTypeId);
      if (gas) {
        tmpItem.name = gas.substance;
        tmpItem.hhv = this.convertHHV(gas.heatingValue, settings);
      }
    }
    tmpItem.energyUsed = tmpResults.grossHeatInput;
    tmpItem.cost = phast.operatingCosts.fuelCost;
    return tmpItem;
  }

  convertHHV(val: number, settings: Settings): number {
    if (settings.unitsOfMeasure === 'Metric') {
      val = this.convertUnitsService.value(val).from('kJ').to(settings.phastRollupUnit);
    } else {
      val = this.convertUnitsService.value(val).from('Btu').to(settings.phastRollupUnit);
    }
    return val;
  }

  setUnits() {
    if (this.settings.phastRollupUnit !== 'kWh') {
      this.baseEnergyUnit = this.settings.phastRollupUnit + '/hr';
    } else {
      this.baseEnergyUnit = this.settings.phastRollupUnit;
    }
    if (this.settings.unitsOfMeasure === 'Metric') {
      this.energyCostUnit = '/GJ';
      this.energyPerMassUnit = this.settings.phastRollupUnit + '/kg';
      this.energyPerTimeUnit = this.settings.phastRollupUnit + '/kWh';
    } else if (this.settings.unitsOfMeasure === 'Imperial') {
      this.energyCostUnit = '/MMBtu';
      this.energyPerMassUnit = this.settings.phastRollupUnit + '/lb';
      this.energyPerTimeUnit = this.settings.phastRollupUnit + '/kWh';
    }
  }
}

export interface PhastRollupEnergySummaryItem {
  name: string;
  energyUsed: number;
  hhv: number;
  cost: number;
}
