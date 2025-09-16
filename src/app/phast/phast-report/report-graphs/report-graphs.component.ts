import { Component, OnInit, Input } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories, Modification, PhastValid } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { PhastResultsService } from '../../phast-results.service';

@Component({
    selector: 'app-report-graphs',
    templateUrl: './report-graphs.component.html',
    styleUrls: ['./report-graphs.component.css'],
    standalone: false
})
export class ReportGraphsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  inPhast: boolean;
  @Input()
  showPrint: boolean;
  @Input()
  printSankey: boolean;
  @Input()
  printGraphs: boolean;

  hasDeliverInput: boolean = true;

  allChartData: Array<{
    name: string,
    valuesAndLabels: Array<{ value: number, label: string }>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>,
    modification?: Modification,
    valid: PhastValid,
    deliverValuesLabels?: Array<{ value: number, label: string }>
  }>;

  selectedBaselineData: {
    name: string,
    valuesAndLabels: Array<{ value: number, label: string }>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>,
    valid: PhastValid,
    deliverValuesLabels?: Array<{ value: number, label: string }>
  };
  selectedModificationData: {
    name: string,
    valuesAndLabels: Array<{ value: number, label: string }>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>,
    valid: PhastValid,
    deliverValuesLabels?: Array<{ value: number, label: string }>
  };

  lossUnit: string;
  deliverUnit: string;
  barChartYAxisLabel: string;
  constructor(private phastResultsService: PhastResultsService) { }

  ngOnInit() {
    this.setAllChartData();
    if (this.settings.unitsOfMeasure === "Metric") {
      this.lossUnit = "GJ/hr";
      this.barChartYAxisLabel = "Heat Loss (GJ/hr)";
    }
    else if (this.settings.unitsOfMeasure === "Imperial") {
      this.lossUnit = "MMBtu/hr";
      this.barChartYAxisLabel = "Heat Loss (MMBtu/hr)";
    }
    this.deliverUnit = "kW";
    
  }

  setAllChartData(){
    this.allChartData = new Array();
    this.addChartData(JSON.parse(JSON.stringify(this.phast)), 'Baseline', this.phast.valid);
    this.selectedBaselineData = this.allChartData[0];
    if (this.phast.modifications && this.phast.modifications.length != 0) {
      this.phast.modifications.forEach(modification => {
        this.addChartData(JSON.parse(JSON.stringify(modification.phast)), modification.phast.name, modification.phast.valid, modification);
      });
      this.selectedModificationData = this.allChartData[1];
    }
  }

  addChartData(phast: PHAST, name: string, isValid: PhastValid,  modification?: Modification) {
    let results: PhastResults = this.phastResultsService.getResults(phast, this.settings);
    let valuesAndLabels: Array<{ value: number, label: string }> = this.getValuesAndLabels(results);
    let deliverValuesLabels: Array<{ value: number, label: string }> = this.getDeliverValuesAndLabels(results);
    this.allChartData.push({
      name: name,
      valuesAndLabels: valuesAndLabels,
      barChartLabels: valuesAndLabels.map(valueItem => {return valueItem.label}),
      barChartValues: valuesAndLabels.map(valueItem => {return valueItem.value}),
      modification: modification,
      valid: isValid,
      deliverValuesLabels: deliverValuesLabels
    })
  }

  getDeliverValuesAndLabels(results: PhastResults): Array<{ value: number, label: string }> {
    let pieData = new Array<{label: string, value: number}>();
    if (results.energyInputTotalChemEnergy) {
      pieData.push({ label: "Chemical Energy Input", value: results.energyInputTotalChemEnergy});
    }
    if (results.energyInputHeatDelivered) {
      pieData.push({ label: "Electrical Energy Input", value: results.energyInputHeatDelivered});
    }
    if (!results.energyInputHeatDelivered && !results.energyInputTotalChemEnergy) {
      this.hasDeliverInput = false;
    }
    return pieData;
  }

  getValuesAndLabels(results: PhastResults): Array<{ value: number, label: string }> {
    let resultCats: ShowResultsCategories = this.phastResultsService.getResultCategories(this.settings);
    let pieData = new Array<{ label: string, value: number }>();

    if (results.totalWallLoss) {
      pieData.push({ label: "Wall", value: results.totalWallLoss });
    }
    if (results.totalAtmosphereLoss) {
      pieData.push({ label: "Atmosphere", value: results.totalAtmosphereLoss });
    }
    if (results.totalOtherLoss) {
      pieData.push({ label: "Other", value: results.totalOtherLoss });
    }
    if (results.totalCoolingLoss) {
      pieData.push({ label: "Cooling", value: results.totalCoolingLoss });
    }
    if (results.totalOpeningLoss) {
      pieData.push({ label: "Opening", value: results.totalOpeningLoss });
    }
    if (results.totalFixtureLoss) {
      pieData.push({ label: "Fixture", value: results.totalFixtureLoss });
    }
    if (results.totalLeakageLoss) {
      pieData.push({ label: "Leakage", value: results.totalLeakageLoss });
    }
    if (results.totalExtSurfaceLoss) {
      pieData.push({ label: "Extended Surface", value: results.totalExtSurfaceLoss });
    }
    if (results.totalChargeMaterialLoss) {
      pieData.push({ label: "Charge Material", value: results.totalChargeMaterialLoss });
    }
    if (resultCats.showFlueGas) {
      pieData.push({ label: "Flue Gas", value: results.totalFlueGas });
    }
    if (resultCats.showAuxPower) {
      pieData.push({ label: "Auxiliary", value: results.totalAuxPower });
    }
    if (resultCats.showSlag) {
      pieData.push({ label: "Slag", value: results.totalSlag });
    }
    if (resultCats.showExGas) {
      pieData.push({ label: "Exhaust Gas", value: results.totalExhaustGasEAF });
    }
    if (resultCats.showEnInput2) {
      pieData.push({ label: "Exhaust Gas", value: results.totalExhaustGas });
    }
    if (resultCats.showSystemEff) {
      pieData.push({ label: "System Eff.", value: results.totalSystemLosses });
    }
    return pieData;
  }
}