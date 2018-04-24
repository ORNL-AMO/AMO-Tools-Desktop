import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PSAT, PsatOutputs, PsatInputs } from '../../../shared/models/psat';
import { Assessment } from '../../../shared/models/assessment';
// import { PsatResultsData } from '../../../report-rollup/report-rollup.service';
import { PsatReportService } from '../psat-report.service';
import { WindowRefService } from '../../../indexedDb/window-ref.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PsatService } from '../../psat.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-psat-report-graphs',
  templateUrl: './psat-report-graphs.component.html',
  styleUrls: ['./psat-report-graphs.component.css']
})
export class PsatReportGraphsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  psat: PSAT;
  // @Input()
  // inPsat: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  printView: boolean;
  @Input()
  printSankey: boolean;
  @Input()
  printGraphs: boolean;

  @ViewChild('pieChartContainer') pieChartContainer: ElementRef;
  @ViewChild('barChartContainer') barChartContainer: ElementRef;

  selectedResults: PsatOutputs;
  selectedInputs: PsatInputs;

  selectedPsat1: { name: string, psat: PSAT, index: number };
  selectedPsat2: { name: string, psat: PSAT, index: number };
  baselinePsat: any;
  psatOptions: Array<{ name: string, psat: PSAT, index: number }>;
  pieChartContainerWidth: number;
  pieChartContainerHeight: number;
  barChartContainerWidth: number;
  barChartContainerHeight: number;

  selectedPsat1ExportName: string;
  selectedPsat1PieLabels: Array<string>;
  selectedPsat1PieValues: Array<number>;
  selectedPsat2ExportName: string;
  selectedPsat2PieLabels: Array<string>;
  selectedPsat2PieValues: Array<number>;
  allPieLabels: Array<Array<string>>;
  allPieValues: Array<Array<number>>;

  selectedPsat1BarValues: Array<number>;
  selectedPsat2BarValues: Array<number>;

  barLabels: Array<string>;
  barChartTitle: string;
  barExportName: string;


  allChartData: { pieLabels: Array<Array<string>>, pieValues: Array<Array<number>>, barLabels: Array<string>, barValues: Array<Array<number>> };

  // resultsArray: Array<{ name: string, data: PsatResultsData }>;
  modExists: boolean = false;
  graphColors: Array<string>;

  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService, private psatReportService: PsatReportService, private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.selectedPsat1PieLabels = new Array<string>();
    this.selectedPsat1PieValues = new Array<number>();
    this.selectedPsat2PieLabels = new Array<string>();
    this.selectedPsat2PieValues = new Array<number>();
    this.selectedPsat1BarValues = new Array<number>();
    this.selectedPsat2BarValues = new Array<number>();
    this.barLabels = new Array<string>();
    this.psatOptions = new Array<{ name: string, psat: PSAT, index: number }>();
    this.prepPsatOptions();
    this.setBarLabels();
    this.allChartData = this.getAllChartData();
    this.selectNewPsat(1);
    if (this.modExists) {
      this.selectNewPsat(2);
    }
  }

  prepPsatOptions(): void {
    this.psatOptions.push({ name: 'Baseline', psat: this.psat, index: 0 });
    this.selectedPsat1 = this.psatOptions[0];

    if (this.psat.modifications !== undefined && this.psat.modifications !== null) {
      this.modExists = true;
      let i = 1;
      this.psat.modifications.forEach(mod => {
        this.psatOptions.push({ name: mod.psat.name, psat: mod.psat, index: i });
        i++;
      });
      this.selectedPsat2 = this.psatOptions[1];
    }
  }

  // set array containing bar chart labels
  setBarLabels(): void {
    this.barLabels.push('Energy Input');
    this.barLabels.push('Motor Losses');
    this.barLabels.push('Drive Losses');
    this.barLabels.push('Pump Losses');
    this.barLabels.push('Useful Output');
  }

  // sets loss data and percentages for selected psats
  getPsatData(psat: PSAT, selectedPieLabels: Array<string>, selectedPieValues: Array<number>, selectedBarValues: Array<number>) {
    let selectedResults: PsatOutputs;
    let selectedInputs: PsatInputs;
    let tmpForm: FormGroup;
    selectedInputs = JSON.parse(JSON.stringify(psat.inputs));
    tmpForm = this.psatService.getFormFromPsat(selectedInputs);
    if (tmpForm.status == 'VALID') {
      if (selectedInputs.optimize_calculation) {
        selectedResults = this.psatService.resultsOptimal(selectedInputs, this.settings);
      } else {
        selectedResults = this.psatService.resultsExisting(selectedInputs, this.settings);
      }
      this.setGraphData(selectedResults, selectedPieLabels, selectedPieValues, selectedBarValues);
    }
    else {
      selectedResults = this.psatService.emptyResults();
    }
  }

  setGraphData(results: PsatOutputs, selectedPieLabels: Array<string>, selectedPieValues: Array<number>, selectedBarValues: Array<number>) {
    let energyInput, motorLoss, driveLoss, pumpLoss, usefulOutput;
    let motorShaftPower, pumpShaftPower;
    if (this.settings.powerMeasurement === 'hp') {
      motorShaftPower = this.convertUnitsService.value(results.motor_shaft_power).from('hp').to('kW');
      pumpShaftPower = this.convertUnitsService.value(results.pump_shaft_power).from("hp").to('kW');
    }
    else {
      motorShaftPower = results.motor_shaft_power;
      pumpShaftPower = results.pump_shaft_power;
    }
    energyInput = results.motor_power;
    motorLoss = results.motor_power * (1 - (results.motor_efficiency / 100));
    driveLoss = motorShaftPower - pumpShaftPower;
    pumpLoss = (results.motor_power - motorLoss - driveLoss) * (1 - (results.pump_efficiency / 100));
    usefulOutput = results.motor_power - (motorLoss + driveLoss + pumpLoss);
    if (motorLoss > 0) {
      selectedPieLabels.push('Motor Loss: ' + (100 * motorLoss / results.motor_power).toFixed(2).toString() + "%");
      selectedPieValues.push(motorLoss);
    }
    if (driveLoss > 0) {
      selectedPieLabels.push('Drive Loss: ' + (100 * driveLoss / results.motor_power).toFixed(2).toString() + "%");
      selectedPieValues.push(driveLoss);
    }
    if (pumpLoss > 0) {
      selectedPieLabels.push('Pump Loss: ' + (100 * pumpLoss / results.motor_power).toFixed(2).toString() + "%");
      selectedPieValues.push(pumpLoss);
    }
    if (usefulOutput > 0) {
      selectedPieLabels.push('Useful Output: ' + (100 * usefulOutput / results.motor_power).toFixed(2).toString() + "%");
      selectedPieValues.push(usefulOutput);
    }
    selectedBarValues.push(energyInput);
    selectedBarValues.push(motorLoss);
    selectedBarValues.push(driveLoss);
    selectedBarValues.push(pumpLoss);
    selectedBarValues.push(usefulOutput);
  }

  selectNewPsat(dropDownIndex: number): void {
    if (dropDownIndex == 1) {
      this.selectedPsat1PieLabels = this.allChartData.pieLabels[this.selectedPsat1.index];
      this.selectedPsat1PieValues = this.allChartData.pieValues[this.selectedPsat1.index];
      this.selectedPsat1BarValues = this.allChartData.barValues[this.selectedPsat1.index];
      this.selectedPsat1ExportName = this.assessment.name + "-" + this.selectedPsat1.name;
    }
    else if (dropDownIndex == 2) {
      this.selectedPsat2PieLabels = this.allChartData.pieLabels[this.selectedPsat2.index];
      this.selectedPsat2PieValues = this.allChartData.pieValues[this.selectedPsat2.index];
      this.selectedPsat2BarValues = this.allChartData.barValues[this.selectedPsat2.index];
      this.selectedPsat2ExportName = this.assessment.name + "-" + this.selectedPsat2.name;
    }

    // if (dropDownIndex === 1) {
    //   this.selectedPsat1PieLabels = this.allChartData.pieLabels[selectedIndex];
    //   this.selectedPsat1PieValues = this.allChartData.pieValues[selectedIndex];
    //   this.selectedPsat1BarValues = this.allChartData.barValues[selectedIndex];
    //   this.selectedPsat1ExportName = this.assessment.name + "-" + this.selectedPsat1.name;
    // }
    // else if (dropDownIndex === 2) {
    //   this.selectedPsat2PieLabels = this.allChartData.pieLabels[selectedIndex];
    //   this.selectedPsat2PieValues = this.allChartData.pieValues[selectedIndex];
    //   this.selectedPsat2BarValues = this.allChartData.barValues[selectedIndex];
    //   this.selectedPsat2ExportName = this.assessment.name + "-" + this.selectedPsat2.name;
    // }

    // if (index === 1) {
    //   this.selectedPsat1PieLabels = new Array<string>();
    //   this.selectedPsat1PieValues = new Array<number>();
    //   this.selectedPsat1BarValues = new Array<number>();
    //   this.selectedPsat1ExportName = this.assessment.name + "-" + this.selectedPsat1.name;
    //   this.getPsatData(this.selectedPsat1.psat, this.selectedPsat1PieLabels, this.selectedPsat1PieValues, this.selectedPsat1BarValues);
    // }
    // else if (index === 2) {
    //   this.selectedPsat2PieLabels = new Array<string>();
    //   this.selectedPsat2PieValues = new Array<number>();
    //   this.selectedPsat2BarValues = new Array<number>();
    //   this.selectedPsat2ExportName = this.assessment.name + "-" + this.selectedPsat2.name;
    //   this.getPsatData(this.selectedPsat2.psat, this.selectedPsat2PieLabels, this.selectedPsat2PieValues, this.selectedPsat2BarValues);
    // }
  }

  getPieWidth(): number {
    if (this.pieChartContainer) {
      let containerPadding = 50;
      return this.pieChartContainer.nativeElement.clientWidth - containerPadding;
    }
    else {
      return 0;
    }
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


  getAllChartData(): { pieLabels: Array<Array<string>>, pieValues: Array<Array<number>>, barLabels: Array<string>, barValues: Array<Array<number>> } {
    let allPieLabels = new Array<Array<string>>();
    let allPieValues = new Array<Array<number>>();
    let allBarValues = new Array<Array<number>>();
    let allPieData;

    for (let i = 0; i < this.psatOptions.length; i++) {
      let tmpPieLabels = new Array<string>();
      let tmpPieValues = new Array<number>();
      let tmpBarValues = new Array<number>();
      let tmpPsat = this.psatOptions[i].psat;
      this.getPsatData(tmpPsat, tmpPieLabels, tmpPieValues, tmpBarValues);
      allPieLabels.push(tmpPieLabels);
      allPieValues.push(tmpPieValues);
      allBarValues.push(tmpBarValues);
    }

    allPieData = {
      pieLabels: allPieLabels,
      pieValues: allPieValues,
      barLabels: this.barLabels,
      barValues: allBarValues
    }
    return allPieData;
  }
}
