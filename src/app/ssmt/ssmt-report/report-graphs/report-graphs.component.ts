import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { SSMT } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-report-graphs',
  templateUrl: './report-graphs.component.html',
  styleUrls: ['./report-graphs.component.css']
})
export class ReportGraphsComponent implements OnInit {
  @Input()
  settings: Settings;
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

  ssmt: SSMT;

  ssmtOptions: Array<{ name: string, ssmt: SSMT, index: number }>;

  selectedSsmt1: { name: string, ssmt: SSMT, index: number };
  selectedSsmt2: { name: string, ssmt: SSMT, index: number };

  ssmt1ProcessExportName: string;
  ssmt1GenerationExportName: string;
  ssmt1ProcessPieValues: Array<number>;
  ssmt1ProcessPieLabels: Array<string>;
  ssmt1GenerationPieValues: Array<number>;
  ssmt1GenerationPieLabels: Array<string>;

  ssmt2ProcessExportName: string;
  ssmt2GenerationExportName: string;
  ssmt2ProcessPieValues: Array<number>;
  ssmt2ProcessPieLabels: Array<string>;
  ssmt2GenerationPieValues: Array<number>;
  ssmt2GenerationPieLabels: Array<string>;

  allProcessPieValues: Array<Array<number>>;
  allGenerationPieValues: Array<Array<number>>;


  modExists: boolean = false;
  graphColors: Array<string>;

  constructor() { }

  ngOnInit() {
    this.ssmt = this.assessment.ssmt;
    this.graphColors = graphColors;
    this.ssmt1ProcessPieValues = new Array<number>();
    this.ssmt1GenerationPieValues = new Array<number>();
    this.ssmt2ProcessPieValues = new Array<number>();
    this.ssmt2GenerationPieValues = new Array<number>();
    this.ssmtOptions = new Array<{ name: string, ssmt: SSMT, index: number }>();
    this.prepSsmtOptions();
    this.setPieData();
  }

  setPieData() {
    this.ssmt1ProcessPieValues = this.getProcessUsageData(this.selectedSsmt1.ssmt);
    this.ssmt1GenerationPieValues = this.getGenerationData(this.selectedSsmt1.ssmt);
    if (this.modExists) {
      this.ssmt2ProcessPieValues = this.getProcessUsageData(this.selectedSsmt2.ssmt);
      this.ssmt2GenerationPieValues = this.getGenerationData(this.selectedSsmt2.ssmt);
    }
    this.setPieLabels();
  }

  setPieLabels() {
    this.ssmt1ProcessPieLabels = new Array<string>();
    this.ssmt1GenerationPieLabels = new Array<string>();
    this.ssmt1ProcessPieLabels = this.getProcessUsageLabels(this.ssmt1ProcessPieValues);
    this.ssmt1GenerationPieLabels = this.getGenerationLabels(this.ssmt1GenerationPieValues, this.selectedSsmt1.ssmt);
    if (this.modExists) {
      this.ssmt2ProcessPieLabels = this.getProcessUsageLabels(this.ssmt2ProcessPieValues);
      this.ssmt2GenerationPieLabels = this.getGenerationLabels(this.ssmt2GenerationPieValues, this.selectedSsmt2.ssmt);
    }
  }

  prepSsmtOptions(): void {
    this.ssmtOptions.push({ name: 'Baseline', ssmt: this.ssmt, index: 0 });
    this.selectedSsmt1 = this.ssmtOptions[0];
    if (this.ssmt.modifications !== undefined && this.ssmt.modifications !== null && this.ssmt.modifications.length > 0) {
      this.modExists = true;
      let i = 1;
      this.ssmt.modifications.forEach(mod => {
        this.ssmtOptions.push({ name: mod.ssmt.name, ssmt: mod.ssmt, index: i });
        i++;
      });
      this.selectedSsmt2 = this.ssmtOptions[1];
    }
  }

  getAllChartData() {
    let isBaseline: boolean;
    for (let i = 0; i < this.ssmtOptions.length; i++) {
      if (i === 0 || (i !== 0 && (this.ssmtOptions[i].ssmt.modifications !== undefined && this.ssmtOptions[i].ssmt.modifications.length > 0))) {
        isBaseline = true;
      }
      else {
        isBaseline = false;
      }
    }
  }

  selectNewSsmt(dropDownIndex: number): void {
    if (dropDownIndex === 1) {
      this.ssmt1ProcessPieValues = this.getProcessUsageData(this.selectedSsmt1.ssmt);
      this.ssmt1GenerationPieValues = this.getGenerationData(this.selectedSsmt1.ssmt);
      this.ssmt1ProcessExportName = this.assessment.name + '-process-' + this.selectedSsmt1.name;
      this.ssmt1GenerationExportName = this.assessment.name + '-generation-' + this.selectedSsmt1.name;
    }
    else {
      this.ssmt2ProcessPieValues = this.getProcessUsageData(this.selectedSsmt2.ssmt);
      this.ssmt2GenerationPieValues = this.getGenerationData(this.selectedSsmt2.ssmt);
      this.ssmt2ProcessExportName = this.assessment.name + '-process-' + this.selectedSsmt2.name;
      this.ssmt2GenerationExportName = this.assessment.name + '-generation-' + this.selectedSsmt2.name;
    }
    this.setPieData();
  }

  getProcessUsageData(ssmt: SSMT): Array<number> {
    let processUsageData = new Array<number>();
    if (ssmt.headerInput) {
      if (ssmt.headerInput.highPressure) {
        processUsageData.push(ssmt.headerInput.highPressure.processSteamUsage);
      }
      if (ssmt.headerInput.mediumPressure) {
        processUsageData.push(ssmt.headerInput.mediumPressure.processSteamUsage);
      }
      if (ssmt.headerInput.lowPressure) {
        processUsageData.push(ssmt.headerInput.lowPressure.processSteamUsage);
      }
    }
    else {
      processUsageData = [0, 0, 0];
    }
    return processUsageData;
  }

  getProcessUsageLabels(processUsageData: Array<number>) {
    let l = processUsageData.length;
    let processUsageLabels = new Array<string>();
    if (l === 1) {
      processUsageLabels.push('HP: ' + processUsageData[0]);
    }
    else if (l === 2) {
      processUsageLabels.push('HP: ' + processUsageData[0]);
      processUsageLabels.push('LP: ' + processUsageData[1]);
    }
    else if (l === 3) {
      processUsageLabels.push('HP: ' + processUsageData[0]);
      processUsageLabels.push('MP: ' + processUsageData[1]);
      processUsageLabels.push('LP: ' + processUsageData[2]);
    }
    return processUsageLabels;
  }

  getGenerationData(ssmt: SSMT): Array<number> {
    let generationData = new Array<number>();
    if (ssmt.turbineInput) {
      if (ssmt.turbineInput.condensingTurbine.useTurbine) {
        generationData.push(ssmt.turbineInput.condensingTurbine.generationEfficiency);
      }
      if (ssmt.turbineInput.highToLowTurbine.useTurbine) {
        generationData.push(ssmt.turbineInput.highToLowTurbine.generationEfficiency);
      }
      if (ssmt.turbineInput.highToMediumTurbine.useTurbine) {
        generationData.push(ssmt.turbineInput.highToMediumTurbine.generationEfficiency);
      }
      if (ssmt.turbineInput.mediumToLowTurbine.useTurbine) {
        generationData.push(ssmt.turbineInput.mediumToLowTurbine.generationEfficiency);
      }
    }
    else {
      generationData = [0, 0, 0, 0];
    }
    return generationData;
  }

  getGenerationLabels(generationData: Array<number>, ssmt: SSMT) {
    let l = generationData.length;
    let generationLabels = new Array<string>();
    let i = 0;
    if (ssmt.turbineInput.condensingTurbine.useTurbine) {
      generationLabels.push('Condensing Turbine: ' + generationData[i]);
      i++;
    }
    if (ssmt.turbineInput.highToLowTurbine.useTurbine) {
      generationLabels.push('HP to LP: ' + generationData[i]);
      i++;
    }
    if (ssmt.turbineInput.highToMediumTurbine.useTurbine) {
      generationLabels.push('HP to MP: ' + generationData[i]);
      i++;
    }
    if (ssmt.turbineInput.mediumToLowTurbine.useTurbine) {
      generationLabels.push('MP to LP: ' + generationData[i]);
    }
    return generationLabels;
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
}
