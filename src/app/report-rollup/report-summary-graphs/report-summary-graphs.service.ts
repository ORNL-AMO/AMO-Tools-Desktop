import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { CompressedAirReportRollupService } from '../compressed-air-report-rollup.service';
import { FsatReportRollupService } from '../fsat-report-rollup.service';
import { PhastReportRollupService } from '../phast-report-rollup.service';
import { PsatReportRollupService } from '../psat-report-rollup.service';
import { ReportUtilityTotal } from '../report-rollup-models';
import { PieChartDataItem } from '../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import { SsmtReportRollupService } from '../ssmt-report-rollup.service';
import { WasteWaterReportRollupService } from '../waste-water-report-rollup.service';
import * as _ from 'lodash';
import { BarChartDataItem } from '../rollup-summary-bar-chart/rollup-summary-bar-chart.component';

@Injectable()
export class ReportSummaryGraphsService {
  reportSummaryGraphData: BehaviorSubject<Array<PieChartDataItem>>;
  energyChartData: BehaviorSubject<Array<PieChartDataItem>>;
  costBarChart: BehaviorSubject<Array<BarChartDataItem>>;
  energyBarChart: BehaviorSubject<Array<BarChartDataItem>>;
  carbonBarChart: BehaviorSubject<Array<BarChartDataItem>>;

  constructor(private convertUnitsService: ConvertUnitsService, private compressedAirReportRollupService: CompressedAirReportRollupService,
    private fsatReportRollupService: FsatReportRollupService, private phastReportRollupService: PhastReportRollupService,
    private psatReportRollupService: PsatReportRollupService, private ssmtReportRollupService: SsmtReportRollupService,
    private wasteWaterReportRollupService: WasteWaterReportRollupService) {
    this.reportSummaryGraphData = new BehaviorSubject<Array<PieChartDataItem>>(new Array<PieChartDataItem>());
    this.energyChartData = new BehaviorSubject<Array<PieChartDataItem>>(new Array<PieChartDataItem>());
    this.costBarChart = new BehaviorSubject<Array<BarChartDataItem>>(new Array<BarChartDataItem>());
    this.energyBarChart = new BehaviorSubject<Array<BarChartDataItem>>(new Array<BarChartDataItem>());
    this.carbonBarChart = new BehaviorSubject<Array<BarChartDataItem>>(new Array<BarChartDataItem>());
  }

  clearData() {
    this.reportSummaryGraphData.next(new Array<PieChartDataItem>());
    this.energyChartData.next(new Array<PieChartDataItem>());
    this.costBarChart.next(new Array<BarChartDataItem>());
    this.energyBarChart.next(new Array<BarChartDataItem>());
    this.carbonBarChart.next(new Array<BarChartDataItem>());
  }

  setRollupChartsData(settings: Settings) {
    let compressedAirTotals: ReportUtilityTotal = JSON.parse(JSON.stringify(this.compressedAirReportRollupService.totals));
    compressedAirTotals.totalEnergy = this.convertUnitsService.value(compressedAirTotals.totalEnergy).from(settings.compressedAirRollupUnit).to(settings.commonRollupUnit);
    compressedAirTotals.electricityEnergy = this.convertUnitsService.value(compressedAirTotals.electricityEnergy).from(settings.compressedAirRollupUnit).to(settings.commonRollupUnit);
    compressedAirTotals.energySavingsPotential = this.convertUnitsService.value(compressedAirTotals.energySavingsPotential).from(settings.compressedAirRollupUnit).to(settings.commonRollupUnit);

    let fsatTotals: ReportUtilityTotal = JSON.parse(JSON.stringify(this.fsatReportRollupService.totals));
    fsatTotals.totalEnergy = this.convertUnitsService.value(fsatTotals.totalEnergy).from(settings.fansRollupUnit).to(settings.commonRollupUnit);
    fsatTotals.electricityEnergy = this.convertUnitsService.value(fsatTotals.electricityEnergy).from(settings.fansRollupUnit).to(settings.commonRollupUnit);
    fsatTotals.energySavingsPotential = this.convertUnitsService.value(fsatTotals.energySavingsPotential).from(settings.fansRollupUnit).to(settings.commonRollupUnit);

    let phastTotals: ReportUtilityTotal = JSON.parse(JSON.stringify(this.phastReportRollupService.totals));
    phastTotals.totalEnergy = this.convertUnitsService.value(phastTotals.totalEnergy).from(settings.phastRollupUnit).to(settings.commonRollupUnit);
    phastTotals.electricityEnergy = this.convertUnitsService.value(phastTotals.electricityEnergy).from(settings.phastRollupUnit).to(settings.commonRollupUnit);
    phastTotals.energySavingsPotential = this.convertUnitsService.value(phastTotals.energySavingsPotential).from(settings.phastRollupUnit).to(settings.commonRollupUnit);
    phastTotals.fuelEnergy = this.convertUnitsService.value(phastTotals.fuelEnergy).from(settings.phastRollupUnit).to(settings.commonRollupUnit);

    let ssmtTotals: ReportUtilityTotal = JSON.parse(JSON.stringify(this.ssmtReportRollupService.totals));
    ssmtTotals.totalEnergy = this.convertUnitsService.value(ssmtTotals.totalEnergy).from(settings.steamRollupUnit).to(settings.commonRollupUnit);
    // phastTotals.electricityEnergy = this.convertUnitsService.value(phastTotals.electricityEnergy).from(settings.phastRollupUnit).to(settings.commonRollupUnit);
    ssmtTotals.energySavingsPotential = this.convertUnitsService.value(ssmtTotals.energySavingsPotential).from(settings.steamRollupUnit).to(settings.commonRollupUnit);
    ssmtTotals.fuelEnergy = this.convertUnitsService.value(ssmtTotals.fuelEnergy).from(settings.steamRollupUnit).to(settings.commonRollupUnit);

    let wasteWaterTotals: ReportUtilityTotal = JSON.parse(JSON.stringify(this.wasteWaterReportRollupService.totals));
    wasteWaterTotals.totalEnergy = this.convertUnitsService.value(wasteWaterTotals.totalEnergy).from(settings.wasteWaterRollupUnit).to(settings.commonRollupUnit);
    wasteWaterTotals.electricityEnergy = this.convertUnitsService.value(wasteWaterTotals.electricityEnergy).from(settings.wasteWaterRollupUnit).to(settings.commonRollupUnit);
    wasteWaterTotals.energySavingsPotential = this.convertUnitsService.value(wasteWaterTotals.energySavingsPotential).from(settings.wasteWaterRollupUnit).to(settings.commonRollupUnit);

    let psatTotals: ReportUtilityTotal = JSON.parse(JSON.stringify(this.psatReportRollupService.totals));
    psatTotals.totalEnergy = this.convertUnitsService.value(psatTotals.totalEnergy).from(settings.pumpsRollupUnit).to(settings.commonRollupUnit);
    psatTotals.electricityEnergy = this.convertUnitsService.value(psatTotals.electricityEnergy).from(settings.pumpsRollupUnit).to(settings.commonRollupUnit);
    psatTotals.energySavingsPotential = this.convertUnitsService.value(psatTotals.energySavingsPotential).from(settings.pumpsRollupUnit).to(settings.commonRollupUnit);

    let allTotals: Array<ReportUtilityTotal> = [psatTotals, wasteWaterTotals, ssmtTotals, phastTotals, fsatTotals, compressedAirTotals];
    let totalFuel: number = _.sumBy(allTotals, 'fuelEnergy');
    let totalElectricity: number = _.sumBy(allTotals, 'electricityEnergy');
    let totalEnergy: number = _.sumBy(allTotals, 'totalEnergy');
    //to add the cost by fuel/electricity you will have to update the ReportUtilityTotal object to track costs
    //by fuel and electricity in the same way the energy is
    let energyChartData: Array<PieChartDataItem> = [
      {
        equipmentName: 'Fuel',
        energyUsed: totalFuel,
        annualCost: 0,
        energySavings: totalFuel - totalEnergy,
        costSavings: 0,
        percentCost: 0,
        percentEnergy: totalFuel / totalEnergy * 100,
        color: '#bf3d00',
        currencyUnit: settings.currency
      },
      {
        equipmentName: 'Electricity',
        energyUsed: totalElectricity,
        annualCost: 0,
        energySavings: totalElectricity - totalEnergy,
        costSavings: 0,
        percentCost: 0,
        percentEnergy: totalElectricity / totalEnergy * 100,
        color: '#FFE400',
        currencyUnit: settings.currency
      }
    ];
    this.energyChartData.next(energyChartData);
    let reportSummaryGraphData: Array<PieChartDataItem> = new Array();
    let reportSummaryCostData: Array<BarChartDataItem> = new Array();
    let reportSummaryEnergyData: Array<BarChartDataItem> = new Array();
    let reportSummaryCarbonData: Array<BarChartDataItem> = new Array();
    if (compressedAirTotals.totalEnergy != 0) {
      let pieChartItem: PieChartDataItem = this.getUtilityPieChartItem(compressedAirTotals, 'Compressed Air', '#7030A0', settings.currency);
      reportSummaryGraphData.push(pieChartItem);
      let energyBarChartItem: BarChartDataItem = this.getEnergyBarChartItem(compressedAirTotals, 'Compressed Air', '#7030A0', settings.commonRollupUnit);
      reportSummaryEnergyData.push(energyBarChartItem);
    }
    if (compressedAirTotals.totalCost != 0) {
      let costBarChartItem: BarChartDataItem = this.getCostBarChartItem(compressedAirTotals, 'Compressed Air', '#7030A0', settings.currency);
      reportSummaryCostData.push(costBarChartItem);
    }
    if (compressedAirTotals.carbonEmissions != 0) {
      let carbonBarChartItem: BarChartDataItem = this.getCO2BarChartItem(compressedAirTotals, 'Compressed Air', '#7030A0');
      reportSummaryCarbonData.push(carbonBarChartItem);
    }
    if (fsatTotals.totalEnergy != 0) {
      let pieChartItem: PieChartDataItem = this.getUtilityPieChartItem(fsatTotals, 'Fans', '#FFE400', settings.currency);
      reportSummaryGraphData.push(pieChartItem);
      let energyBarChartItem: BarChartDataItem = this.getEnergyBarChartItem(fsatTotals, 'Fans', '#FFE400', settings.commonRollupUnit);
      reportSummaryEnergyData.push(energyBarChartItem);
    }
    if (fsatTotals.totalCost != 0){
      let costBarChartItem: BarChartDataItem = this.getCostBarChartItem(fsatTotals, 'Fans', '#FFE400', settings.currency);
      reportSummaryCostData.push(costBarChartItem);
    }
    if (fsatTotals.carbonEmissions != 0){
      let carbonBarChartItem: BarChartDataItem = this.getCO2BarChartItem(fsatTotals, 'Fans', '#FFE400');
      reportSummaryCarbonData.push(carbonBarChartItem);
    }
    if (phastTotals.totalEnergy != 0) {
      let pieChartItem: PieChartDataItem = this.getUtilityPieChartItem(phastTotals, 'Process Heating', '#bf3d00', settings.currency);
      reportSummaryGraphData.push(pieChartItem);
      let energyBarChartItem: BarChartDataItem = this.getEnergyBarChartItem(phastTotals, 'Process Heating', '#bf3d00', settings.commonRollupUnit);
      reportSummaryEnergyData.push(energyBarChartItem);
    }
    if (phastTotals.totalCost != 0) {
      let costBarChartItem: BarChartDataItem = this.getCostBarChartItem(phastTotals, 'Process Heating', '#bf3d00', settings.currency);
      reportSummaryCostData.push(costBarChartItem);
    }
    if (phastTotals.carbonEmissions != 0) {
      let carbonBarChartItem: BarChartDataItem = this.getCO2BarChartItem(phastTotals, 'Process Heating', '#bf3d00');
      reportSummaryCarbonData.push(carbonBarChartItem);
    }
    if (ssmtTotals.totalEnergy != 0) {
      let pieChartItem: PieChartDataItem = this.getUtilityPieChartItem(ssmtTotals, 'Steam', '#F39C12', settings.currency);
      reportSummaryGraphData.push(pieChartItem);
      let energyBarChartItem: BarChartDataItem = this.getEnergyBarChartItem(ssmtTotals, 'Steam', '#F39C12', settings.commonRollupUnit);
      reportSummaryEnergyData.push(energyBarChartItem);
    }
    if (ssmtTotals.totalCost != 0) {
      let costBarChartItem: BarChartDataItem = this.getCostBarChartItem(ssmtTotals, 'Steam', '#F39C12', settings.currency);
      reportSummaryCostData.push(costBarChartItem);
    }
    if (ssmtTotals.carbonEmissions != 0) {
      let carbonBarChartItem: BarChartDataItem = this.getCO2BarChartItem(ssmtTotals, 'Steam', '#F39C12');
      reportSummaryCarbonData.push(carbonBarChartItem);
    }
    if (psatTotals.totalEnergy != 0) {
      let pieChartItem: PieChartDataItem = this.getUtilityPieChartItem(psatTotals, 'Pumps', '#2980b9', settings.currency);
      reportSummaryGraphData.push(pieChartItem);
      let energyBarChartItem: BarChartDataItem = this.getEnergyBarChartItem(psatTotals, 'Pumps', '#2980b9', settings.commonRollupUnit);
      reportSummaryEnergyData.push(energyBarChartItem);
    }
    if (psatTotals.totalCost != 0) {
      let costBarChartItem: BarChartDataItem = this.getCostBarChartItem(psatTotals, 'Pumps', '#2980b9', settings.currency);
      reportSummaryCostData.push(costBarChartItem);
    }
    if (psatTotals.carbonEmissions != 0) {
      let carbonBarChartItem: BarChartDataItem = this.getCO2BarChartItem(psatTotals, 'Pumps', '#2980b9');
      reportSummaryCarbonData.push(carbonBarChartItem);
    }
    if (wasteWaterTotals.totalEnergy != 0) {
      let pieChartItem: PieChartDataItem = this.getUtilityPieChartItem(wasteWaterTotals, 'Waste Water', '#003087', settings.currency);
      reportSummaryGraphData.push(pieChartItem);
      let energyBarChartItem: BarChartDataItem = this.getEnergyBarChartItem(wasteWaterTotals, 'Waste Water', '#003087', settings.commonRollupUnit);
      reportSummaryEnergyData.push(energyBarChartItem);
    }
    if (wasteWaterTotals.totalCost != 0) {
      let costBarChartItem: BarChartDataItem = this.getCostBarChartItem(wasteWaterTotals, 'Waste Water', '#003087', settings.currency);
      reportSummaryCostData.push(costBarChartItem);
    }
    if (wasteWaterTotals.carbonEmissions != 0) {
      let carbonBarChartItem: BarChartDataItem = this.getCO2BarChartItem(wasteWaterTotals, 'Waste Water', '#003087');
      reportSummaryCarbonData.push(carbonBarChartItem);
    }
    this.reportSummaryGraphData.next(reportSummaryGraphData);
    this.costBarChart.next(reportSummaryCostData);
    this.energyBarChart.next(reportSummaryEnergyData);
    this.carbonBarChart.next(reportSummaryCarbonData);
  }

  getUtilityPieChartItem(totals: ReportUtilityTotal, equipmentName: string, color: string, currency: string): PieChartDataItem {
    return {
      equipmentName: equipmentName,
      energyUsed: totals.totalEnergy + totals.energySavingsPotential,
      annualCost: totals.totalCost + totals.savingPotential,
      energySavings: totals.energySavingsPotential,
      costSavings: totals.savingPotential,
      percentCost: totals.savingPotential / totals.totalCost * 100,
      percentEnergy: totals.savingPotential / totals.totalEnergy * 100,
      color: color,
      currencyUnit: currency,
      carbonEmissions: totals.carbonEmissions + totals.carbonSavings
    }
  }

  getCostBarChartItem(totals: ReportUtilityTotal, equipmentName: string, color: string, currency: string): BarChartDataItem {
    let hoverTemplate: string = `%{y:$,.0f}<extra></extra>${currency !== '$'? 'k': ''}`;
    let baselineCost: number = totals.totalCost + totals.savingPotential;
    let modCost: number = totals.totalCost;
    if (totals.steamTotalModificationCost !== undefined) {
      modCost = totals.steamTotalModificationCost;
    }
    return {
      x: ['Baseline', 'Modification'],
      y: [baselineCost, modCost],
      hoverinfo: 'all',
      hovertemplate: hoverTemplate,
      name: equipmentName,
      type: 'bar',
      marker: {
        color: color
      }
    }
  }

  getEnergyBarChartItem(totals: ReportUtilityTotal, equipmentName: string, color: string, unit: string): BarChartDataItem {
    let hoverTemplate: string = '%{y:,.0f}<extra></extra> ' + unit;
    let baselineEnergyUse: number = totals.totalEnergy + totals.energySavingsPotential;
    let modEnergyUse: number = totals.totalEnergy;
    return {
      x: ['Baseline', 'Modification'],
      y: [baselineEnergyUse, modEnergyUse],
      hoverinfo: 'all',
      hovertemplate: hoverTemplate,
      name: equipmentName,
      type: 'bar',
      marker: {
        color: color
      }

    }
  }

  getCO2BarChartItem(totals: ReportUtilityTotal, equipmentName: string, color: string): BarChartDataItem {
    let hoverTemplate: string = '%{y:,.0f}<extra></extra> ' + 'tonne CO<sub>2</sub>';
    let baselineCO2: number = totals.carbonEmissions + totals.carbonSavings;
    let modCO2: number = totals.carbonEmissions;
    return {
      x: ['Baseline', 'Modification'],
      y: [baselineCO2, modCO2],
      hoverinfo: 'all',
      hovertemplate: hoverTemplate,
      name: equipmentName,
      type: 'bar',
      marker: {
        color: color
      }

    }
  }
}
