import { Component, OnInit, Input } from '@angular/core';
import { ReportRollupService } from '../../report-rollup.service';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { PhastResults, PHAST } from '../../../shared/models/phast/phast';
import * as _ from 'lodash';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PhastResultsData } from '../../report-rollup-models';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../../shared/models/materials';
import { PhastReportRollupService } from '../../phast-report-rollup.service';
import { SqlDbApiService } from '../../../tools-suite-api/sql-db-api.service';
import { FlueGasMaterialDbService } from '../../../indexedDb/flue-gas-material-db.service';
import { firstValueFrom } from 'rxjs';
import { SolidLiquidMaterialDbService } from '../../../indexedDb/solid-liquid-material-db.service';

@Component({
  selector: 'app-phast-rollup-energy-table',
  templateUrl: './phast-rollup-energy-table.component.html',
  styleUrls: ['./phast-rollup-energy-table.component.css'],
  standalone: false
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
  constructor(private convertUnitsService: ConvertUnitsService, private reportRollupService: ReportRollupService,
    private phastReportRollupService: PhastReportRollupService, private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService) { }

  ngOnInit() {
    this.settings = this.reportRollupService.checkSettings(this.settings);
    this.setUnits();
    let phastResults: Array<PhastResultsData> = JSON.parse(JSON.stringify(this.phastReportRollupService.selectedPhastResults));
    let fuelResults: Array<PhastResultsData> = phastResults.filter(resultItem => { return resultItem.settings.energySourceType != 'Steam' });
    this.setFuelSummary(fuelResults);
    let electricityResults: Array<PhastResultsData> = phastResults.filter(resultItem => { return resultItem.settings.energySourceType == 'Electricity' });
    this.setElectricitySummary(electricityResults);
    let steamResults: Array<PhastResultsData> = phastResults.filter(resultItem => { return resultItem.settings.energySourceType == 'Steam' });
    this.setSteamSummary(steamResults);
  }

  setFuelSummary(fuelResults: Array<PhastResultsData>) {
    this.fuelSummary = new Array();
    fuelResults.forEach(async result => {
      let fuelItem: PhastRollupEnergySummaryItem = await this.getFuel(result);
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
      if (result.settings.furnaceType === 'Electric Arc Furnace (EAF)') {
        electricityTotalEnergy += this.convertUnitsService.value(result.baselineResultData.hourlyEAFResults.electricEnergyUsed).from(result.settings.energyResultUnit).to(this.settings.phastRollupUnit);
      } else {
        electricityTotalEnergy += this.convertUnitsService.value(result.baselineResultData.electricalHeatDelivered).from(result.settings.energyResultUnit).to(this.settings.phastRollupUnit);
      }
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


  async getFuel(resultsData: PhastResultsData): Promise<PhastRollupEnergySummaryItem> {
    let rollupEnergyItem: PhastRollupEnergySummaryItem = {
      name: '',
      energyUsed: 0,
      hhv: 0,
      cost: 0
    };

    if (resultsData.settings.energySourceType === 'Electricity') {
      let totalFuelEnergyUsed = resultsData.baselineResultData.energyInputHeatDelivered + resultsData.baselineResultData.totalExhaustGas;
      rollupEnergyItem.energyUsed = this.convertUnitsService.value(totalFuelEnergyUsed).from(resultsData.settings.energyResultUnit).to(this.settings.phastRollupUnit);
      rollupEnergyItem.name = 'Fuel';
      rollupEnergyItem.hhv = undefined;

      if (resultsData.settings.furnaceType === 'Electric Arc Furnace (EAF)') {
        rollupEnergyItem.energyUsed = this.phastReportRollupService.convertEAFFuelEnergy(resultsData.baselineResultData.hourlyEAFResults.totalFuelEnergyUsed, resultsData.settings, this.settings.phastRollupUnit);
        rollupEnergyItem.name = 'Fuel';
        let electrodeHHV = this.convertHHV(resultsData.baselineResultData.hourlyEAFResults.electrodeHeatingValue, resultsData.settings);
        let coalHHVValue = this.convertHHV(resultsData.baselineResultData.hourlyEAFResults.coalHeatingValue, resultsData.settings);
        let naturalGasHHV = this.convertHHV(resultsData.baselineResultData.hourlyEAFResults.naturalGasHeatingValue, resultsData.settings);
        rollupEnergyItem.hhv = electrodeHHV + coalHHVValue + naturalGasHHV;
      }
    } else {
      resultsData.baselineResultData.grossHeatInput = this.convertUnitsService.value(resultsData.baselineResultData.grossHeatInput).from(resultsData.settings.energyResultUnit).to(this.settings.phastRollupUnit);
      rollupEnergyItem.energyUsed = resultsData.baselineResultData.grossHeatInput;

      if (resultsData.assessment.phast.losses.flueGasLosses && resultsData.assessment.phast.losses.flueGasLosses[0].flueGasType === 'By Mass') {
        let gas: SolidLiquidFlueGasMaterial = this.solidLiquidMaterialDbService.getById(resultsData.assessment.phast.losses.flueGasLosses[0].flueGasByMass.gasTypeId);
        if (gas) {
          rollupEnergyItem.name = gas.substance;
          rollupEnergyItem.hhv = this.convertHHV(gas.heatingValue, resultsData.settings);
        }
      } else if (resultsData.assessment.phast.losses.flueGasLosses && resultsData.assessment.phast.losses.flueGasLosses[0].flueGasType === 'By Volume') {
        let gas: FlueGasMaterial = await firstValueFrom(this.flueGasMaterialDbService.getByIdWithObservable(resultsData.assessment.phast.losses.flueGasLosses[0].flueGasByVolume.gasTypeId));
        if (gas) {
          rollupEnergyItem.name = gas.substance;
          let heatingValue: number = gas.heatingValue;
          rollupEnergyItem.hhv = this.convertHHV(heatingValue, resultsData.settings);
        }
      }
    }

    rollupEnergyItem.cost = resultsData.assessment.phast.operatingCosts.fuelCost;

    return rollupEnergyItem;
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
