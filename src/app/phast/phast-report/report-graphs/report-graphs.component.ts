import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { PhastService } from '../../phast.service';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PhastResultsService } from '../../phast-results.service';
import { graphColors, phastGraphColors } from './graphColors';
import { PhastReportService } from '../phast-report.service';
import { WindowRefService } from '../../../indexedDb/window-ref.service';

@Component({
  selector: 'app-report-graphs',
  templateUrl: './report-graphs.component.html',
  styleUrls: ['./report-graphs.component.css']
})
export class ReportGraphsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  inPhast: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  showPrint: boolean;

  @ViewChild('pieChartContainer') pieChartContainer: ElementRef;
  @ViewChild('barChartContainer') barChartContainer: ElementRef;

  selectedPhast1: any;
  selectedPhast2: any;
  baselinePhast: any;
  pieChartContainerWidth: number;
  pieChartContainerHeight: number;
  barChartContainerWidth: number;
  barChartContainerHeight: number;

  selectedPhast1ExportName: string;
  selectedPhast1PieLabels: Array<string>;
  selectedPhast1PieValues: Array<number>;
  selectedPhast2ExportName: string;
  selectedPhast2PieLabels: Array<string>;
  selectedPhast2PieValues: Array<number>;
  allPieLabels: Array<Array<string>>;
  allPieValues: Array<Array<number>>;

  selectedPhast1BarData: { label: string, values: Array<number> };
  selectedPhast2BarData: { label: string, values: Array<number> };
  reportBarData: Array<{ label: string, values: Array<number> }>;
  allBarData: Array<{ label: string, values: Array<number> }>;
  barCategories: Array<string>;
  barChartTitle: string;
  yAxisTitle: string;
  xAxisTitle: string;
  units: string;
  barExportName: string;

  resultsArray: Array<{ name: string, data: PhastResults }>;
  modExists: boolean = false;
  showResultsCats: ShowResultsCategories;
  pieLabels: any;
  baselineResults: PhastResults;
  graphColors: Array<string>;
  baselineLabels: Array<string>;
  modifiedLabels: Array<string>;
  window: any;

  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService, private phastReportService: PhastReportService, private windowRefService: WindowRefService) { }

  ngOnInit() {
    let selectedPhast1PieResults, selectedPhast2PieResults;
    this.selectedPhast1PieLabels = new Array<string>();
    this.selectedPhast1PieValues = new Array<number>();
    this.selectedPhast2PieLabels = new Array<string>();
    this.selectedPhast2PieValues = new Array<number>();
    this.barCategories = new Array<string>();
    this.graphColors = phastGraphColors;
    this.resultsArray = new Array<any>();
    this.showResultsCats = this.phastResultsService.getResultCategories(this.settings);
    if (this.phast.losses) {
      this.baselineResults = this.phastResultsService.getResults(this.phast, this.settings);
      this.resultsArray.push({ name: 'Baseline', data: this.baselineResults })
      this.selectedPhast1 = this.resultsArray[0];
      this.baselinePhast = this.resultsArray[0];
      //get pie chart 1 data
      selectedPhast1PieResults = this.getPieData(this.selectedPhast1.data, this.showResultsCats);
      this.selectedPhast1PieLabels = selectedPhast1PieResults.map(datas => datas.label);
      this.selectedPhast1PieValues = selectedPhast1PieResults.map(datas => datas.val);
      this.selectedPhast1ExportName = this.assessment.name + "-" + this.selectedPhast1.name;
      if (this.phast.modifications) {
        if (this.phast.modifications.length != 0) {
          this.modExists = true;
          this.phast.modifications.forEach(mod => {
            let tmpResults = this.phastResultsService.getResults(mod.phast, this.settings);
            this.resultsArray.push({ name: mod.phast.name, data: tmpResults });
          })
          this.selectedPhast2 = this.resultsArray[1];
          //get pie chart 2 data
          selectedPhast2PieResults = this.getPieData(this.selectedPhast2.data, this.showResultsCats);
          this.selectedPhast2PieLabels = selectedPhast2PieResults.map(datas => datas.label);
          this.selectedPhast2PieValues = selectedPhast2PieResults.map(datas => datas.val);
          this.selectedPhast2ExportName = this.assessment.name + "-" + this.selectedPhast2.name;
          //get bar chart data
          this.selectedPhast1BarData = this.getBarData(this.selectedPhast1.data, this.selectedPhast1.name);
          this.selectedPhast2BarData = this.getBarData(this.selectedPhast2.data, this.selectedPhast2.name);
          this.setReportBarData();
        }
      }
    } else {
      this.baselineResults = this.phastResultsService.initResults();
      this.resultsArray.push({ name: 'Baseline', data: this.baselineResults })
      this.selectedPhast1 = this.resultsArray[0];
      selectedPhast1PieResults = this.getPieData(this.selectedPhast1.data, this.showResultsCats);
      this.selectedPhast1PieLabels = selectedPhast1PieResults.map(datas => datas.label);
      this.selectedPhast1PieValues = selectedPhast1PieResults.map(datas => datas.val);
    }

    if (this.showPrint) {
      this.pieChartContainerHeight = 300;
      this.barChartContainerHeight = 400;
    }
    else {
      this.pieChartContainerHeight = 300;
      this.barChartContainerHeight = 400;
    }
    this.initBarText();
    this.getBarCategories();
    this.getPieChartPrintData();
    this.getBarChartPrintData();
  }

  ngOnDestroy() {
    this.showPrint = false;
  }

  selectNewPhast(i: number): void {
    let selectedPhast1Results, selectedPhast2Results;
    if (i === 1) {
      this.selectedPhast1ExportName = this.assessment.name + "-" + this.selectedPhast1.name;
      selectedPhast1Results = this.getPieData(this.selectedPhast1.data, this.showResultsCats);
      this.selectedPhast1PieLabels = selectedPhast1Results.map(datas => datas.label);
      this.selectedPhast1PieValues = selectedPhast1Results.map(datas => datas.val);
      if (this.modExists) {
        this.selectedPhast1BarData = this.getBarData(this.selectedPhast1.data, this.selectedPhast1.name);
        this.setReportBarData();
        this.barExportName = this.assessment.name + "-" + this.selectedPhast1.name + "-" + this.selectedPhast2.name;
      }
    }
    else {
      this.selectedPhast2ExportName = this.assessment.name + "-" + this.selectedPhast2.name;
      selectedPhast2Results = this.getPieData(this.selectedPhast2.data, this.showResultsCats);
      this.selectedPhast2PieLabels = selectedPhast2Results.map(datas => datas.label);
      this.selectedPhast2PieValues = selectedPhast2Results.map(datas => datas.val);
      this.selectedPhast2BarData = this.getBarData(this.selectedPhast2.data, this.selectedPhast2.name);
      this.setReportBarData();
      this.barExportName = this.assessment.name + "-" + this.selectedPhast1.name + "-" + this.selectedPhast2.name;
    }
  }

  getPieWidth(): number {
    if (this.pieChartContainer) {
      let containerPadding = 30;
      return this.pieChartContainer.nativeElement.clientWidth - containerPadding;
    }
    else {
      return 0;
    }
  }

  getPieChartPrintData(): void {
    this.allPieLabels = new Array<Array<string>>();
    this.allPieValues = new Array<Array<number>>();
    if (this.resultsArray) {
      for (let i = 0; i < this.resultsArray.length; i++) {
        let tmpData = this.getPieData(this.resultsArray[i].data, this.showResultsCats);
        let tmpValues = tmpData.map(datas => datas.val);
        let tmpLabels = tmpData.map(datas => datas.label);
        this.allPieLabels.push(tmpLabels);
        this.allPieValues.push(tmpValues);
      }
    }
  }

  getPieData(results: PhastResults, resultCats: ShowResultsCategories): Array<{ label: string, val: number }> {
    let totalWallLoss = this.getLossPercent(results.grossHeatInput, results.totalWallLoss);
    let totalAtmosphereLoss = this.getLossPercent(results.grossHeatInput, results.totalAtmosphereLoss);
    let totalOtherLoss = this.getLossPercent(results.grossHeatInput, results.totalOtherLoss);
    let totalCoolingLoss = this.getLossPercent(results.grossHeatInput, results.totalCoolingLoss);
    let totalOpeningLoss = this.getLossPercent(results.grossHeatInput, results.totalOpeningLoss);
    let totalFixtureLoss = this.getLossPercent(results.grossHeatInput, results.totalFixtureLoss);
    let totalLeakageLoss = this.getLossPercent(results.grossHeatInput, results.totalLeakageLoss);
    let totalExtSurfaceLoss = this.getLossPercent(results.grossHeatInput, results.totalExtSurfaceLoss);
    let totalChargeMaterialLoss = this.getLossPercent(results.grossHeatInput, results.totalChargeMaterialLoss);
    let totalFlueGas = 0;
    let totalSlag = 0;
    let totalAuxPower = 0;
    let totalExhaustGas = 0;
    let totalExhaustGasEAF = 0;
    let totalSystemLosses = 0;

    if (resultCats.showFlueGas) {
      totalFlueGas = this.getLossPercent(results.grossHeatInput, results.totalFlueGas);
    }
    if (resultCats.showAuxPower) {
      totalAuxPower = this.getLossPercent(results.grossHeatInput, results.totalAuxPower);
    }
    if (resultCats.showSlag) {
      totalSlag = this.getLossPercent(results.grossHeatInput, results.totalSlag);
    }
    if (resultCats.showExGas) {
      totalExhaustGasEAF = this.getLossPercent(results.grossHeatInput, results.totalExhaustGasEAF);
    }
    if (resultCats.showEnInput2) {
      totalExhaustGas = this.getLossPercent(results.grossHeatInput, results.totalExhaustGas);
    }
    if (resultCats.showSystemEff) {
      totalSystemLosses = this.getLossPercent(results.grossHeatInput, results.totalSystemLosses);
    }
    let pieData = new Array<{ label: string, val: number }>();
    pieData.push({ label: "Flue Gas: " + totalFlueGas.toFixed(0) + "%", val: totalFlueGas });
    pieData.push({ label: "Charge Material: " + totalChargeMaterialLoss.toFixed(0) + "%", val: totalChargeMaterialLoss });
    pieData.push({ label: "Opening: " + totalOpeningLoss.toFixed(0) + "%", val: totalOpeningLoss });
    pieData.push({ label: "Wall: " + totalWallLoss.toFixed(0) + "%", val: totalWallLoss });
    pieData.push({ label: "Atmosphere: " + totalAtmosphereLoss.toFixed(0) + "%", val: totalAtmosphereLoss });
    pieData.push({ label: "Cooling: " + totalCoolingLoss.toFixed(0) + "%", val: totalCoolingLoss });
    pieData.push({ label: "Fixture: " + totalFixtureLoss.toFixed(0) + "%", val: totalFixtureLoss });
    pieData.push({ label: "Leakage: " + totalLeakageLoss.toFixed(0) + "%", val: totalLeakageLoss });
    pieData.push({ label: "Extended Surface: " + totalExtSurfaceLoss.toFixed(0) + "%", val: totalExtSurfaceLoss });
    pieData.push({ label: "Exhaust Gas: " + totalExhaustGasEAF.toFixed(0) + "%", val: totalExhaustGasEAF });
    pieData.push({ label: "Exhaust Gas: " + totalExhaustGas.toFixed(0) + "%", val: totalExhaustGas });
    pieData.push({ label: "System Eff.: " + totalSystemLosses.toFixed(0) + "%", val: totalSystemLosses });
    pieData.push({ label: "Slag: " + totalSlag.toFixed(0) + "%", val: totalSlag });
    pieData.push({ label: "Auxiliary: " + totalAuxPower.toFixed(0) + "%", val: totalAuxPower });
    pieData.push({ label: "Other: " + totalFlueGas.toFixed(0) + "%", val: totalOtherLoss });
    return pieData;
  }

  getLossPercent(totalLosses: number, loss: number): number {
    let num = (loss / totalLosses) * 100;
    let percent = this.roundVal(num, 0);
    return percent;
  }


  initBarText(): void {
    this.barChartTitle = "Heat Loss";
    this.units = this.settings.energyResultUnit + "/hr";
    this.xAxisTitle = "Loss Source";
    this.yAxisTitle = "Loss Rate (" + this.units + ")";
  }

  getBarWidth(): number {
    if (this.barChartContainer) {
      let containerPadding = 30;
      return this.barChartContainer.nativeElement.clientWidth - containerPadding;
    }
    else {
      return 0;
    }
  }

  getBarData(results: PhastResults, name: string): { label: string, values: Array<number> } {
    let data: { label: string, values: Array<number> };
    data = { label: name, values: new Array<number>() };
    // data.values = new Array<number>();
    data.values.push(results.totalFlueGas);
    data.values.push(results.totalChargeMaterialLoss);
    data.values.push(results.totalOpeningLoss);
    data.values.push(results.totalWallLoss);
    data.values.push(results.totalAtmosphereLoss);
    data.values.push(results.totalCoolingLoss);
    data.values.push(results.totalFixtureLoss);
    data.values.push(results.totalLeakageLoss);
    data.values.push(results.totalExtSurfaceLoss);
    data.values.push(results.totalExhaustGasEAF);
    data.values.push(results.totalExhaustGas);
    data.values.push(results.totalSystemLosses);
    data.values.push(results.totalSlag);
    data.values.push(results.totalAuxPower);
    data.values.push(results.totalOtherLoss);
    return data;
  }

  setReportBarData(): void {
    this.reportBarData = new Array<{ label: string, values: Array<number> }>();
    this.reportBarData.push(this.selectedPhast1BarData);
    this.reportBarData.push(this.selectedPhast2BarData);
  }

  getBarCategories(): void {
    this.barCategories = new Array<string>();
    this.barCategories.push("Flue Gas");
    this.barCategories.push("Charge Material");
    this.barCategories.push("Opening");
    this.barCategories.push("Wall");
    this.barCategories.push("Atmosphere");
    this.barCategories.push("Cooling");
    this.barCategories.push("Fixture");
    this.barCategories.push("Leakage");
    this.barCategories.push("Extended Surface");
    this.barCategories.push("Exhaust Gas");
    this.barCategories.push("Exhaust Gas");
    this.barCategories.push("System Eff.");
    this.barCategories.push("Slag");
    this.barCategories.push("Auxiliary");
    this.barCategories.push("Other");
  }

  getBarChartPrintData(): void {
    this.allBarData = new Array<{ label: string, values: Array<number> }>();
    if (this.resultsArray) {
      for (let i = 0; i < this.resultsArray.length; i++) {
        let tmpData = this.getBarData(this.resultsArray[i].data, this.resultsArray[i].name);
        this.allBarData.push(tmpData);
      }
    }
  }

  roundVal(val: number, digits: number): number {
    return Number((Math.round(val * 100) / 100).toFixed(digits))
  }
}
