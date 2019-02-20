import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { InputSummaryComponent } from '../../../psat/psat-report/input-summary/input-summary.component';
import { SSMT } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SsmtService } from '../../ssmt.service';

@Component({
  selector: 'app-report-graphs',
  templateUrl: './report-graphs.component.html',
  styleUrls: ['./report-graphs.component.css']
})
export class ReportGraphsComponent implements OnInit {
  @Input()
  ssmt: SSMT;
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

  ssmtOptions: Array<{ name: string, ssmt: SSMT, index: number }>;

  selectedSsmt1: { name: string, ssmt: SSMT, index: number };
  selectedSsmt2: { name: string, ssmt: SSMT, index: number };

  ssmt1ProcessExportName: string;
  ssmt1GenerationExportName: string;
  ssmt1ProcessPieValues: Array<number>;
  ssmt1GenerationPieValues: Array<number>;

  ssmt2ProcessExportName: string;
  ssmt2GenerationExportName: string;
  ssmt2ProcessPieValues: Array<number>;
  ssmt2GenerationPieValues: Array<number>;

  allProcessPieValues: Array<Array<number>>;
  allGenerationPieValues: Array<Array<number>>;

  processPieLabels: Array<string>;
  generationPieLabels: Array<string>;

  modExists: boolean = false;
  graphColors: Array<string>;

  // allChartData: { pieLabels: Array<Array<string>>, pieValues: Array<Array<number>>, barLabels: Array<string>, barValues: Array<Array<number>> };


  constructor(private convertUnitsService: ConvertUnitsService, private ssmtService: SsmtService) { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.processPieLabels = new Array<string>();
    this.generationPieLabels = new Array<string>();
    this.ssmt1ProcessPieValues = new Array<number>();
    this.ssmt1GenerationPieValues = new Array<number>();
    this.ssmt2ProcessPieValues = new Array<number>();
    this.ssmt2GenerationPieValues = new Array<number>();
    this.ssmtOptions = new Array<{ name: string, ssmt: SSMT, index: number }>();
    this.prepSsmtOptions();
    this.initPieValues();
  }

  initPieValues() {
    this.ssmt1ProcessPieValues = this.getProcessUsageData(this.ssmt);
    this.ssmt1GenerationPieValues = this.getGenerationData(this.ssmt);
    if (this.modExists) {
      this.ssmt2ProcessPieValues = this.getProcessUsageData(this.ssmtOptions[1].ssmt);
      this.ssmt2GenerationPieValues = this.getGenerationData(this.ssmtOptions[1].ssmt);
    }
  }

  prepSsmtOptions(): void {
    this.ssmtOptions.push({ name: 'Baseline', ssmt: this.ssmt, index: 0 });
    this.selectedSsmt1 = this.ssmtOptions[0];
    if (this.ssmt.modifications !== undefined && this.ssmt.modifications !== null) {
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
      // let highPressureProcess

      if (i === 0 || (i !== 0 && (this.ssmtOptions[i].ssmt.modifications !== undefined && this.ssmtOptions[i].ssmt.modifications.length > 0))) {
        isBaseline = true;
      }
      else {
        isBaseline = false;
      }



      // let tmpOutput = this.ssmtService.getResults(this.ssmtOptions[i].ssmt, isBaseline, this.settings);
    }
  }

  selectNewSsmt(dropDownIndex: number): void {
    if (dropDownIndex === 1) {
      this.ssmt1ProcessPieValues = this.getProcessUsageData(this.selectedSsmt1);
      this.ssmt1GenerationPieValues = this.getGenerationData(this.selectedSsmt1);
      // this.selectedSsmt1 = 
      // this.selectedSsmt1PieLabels = this.allChartData.pieLabels[this.selectedSsmt1.index];
      // this.selectedSsmt1PieValues = this.allChartD

    }
    else {
      this.ssmt2ProcessPieValues = this.getProcessUsageData(this.selectedSsmt2);
      this.ssmt2GenerationPieValues = this.getGenerationData(this.selectedSsmt2);
    }
  }

  getProcessUsageData(ssmt: SSMT): Array<number> {
    let processUsageData = new Array<number>();

    if (ssmt.headerInput) {
      if (ssmt.headerInput.highPressure) {
        processUsageData.push(ssmt.headerInput.highPressure.processSteamUsage);
      }
      else {
        processUsageData.push(0);
      }
      if (ssmt.headerInput.mediumPressure) {
        processUsageData.push(ssmt.headerInput.mediumPressure.processSteamUsage);
      }
      else {
        processUsageData.push(0);
      }
      if (ssmt.headerInput.lowPressure) {
        processUsageData.push(ssmt.headerInput.lowPressure.processSteamUsage);
      }
      else {
        processUsageData.push(0);
      }
    }
    else {
      processUsageData = [0, 0, 0];
    }
    return processUsageData;
  }

  getGenerationData(ssmt: SSMT): Array<number> {
    let generationData = new Array<number>();
    if (ssmt.turbineInput) {
      if (ssmt.turbineInput.condensingTurbine) {
        generationData.push(ssmt.turbineInput.condensingTurbine.generationEfficiency);
      }
      else {
        generationData.push(0);
      }
      if (ssmt.turbineInput.highToLowTurbine) {
        generationData.push(ssmt.turbineInput.highToLowTurbine.generationEfficiency);
      }
      else {
        generationData.push(0);
      }
      if (ssmt.turbineInput.highToMediumTurbine) {
        generationData.push(ssmt.turbineInput.highToMediumTurbine.generationEfficiency);
      }
      else {
        generationData.push(0);
      }
      if (ssmt.turbineInput.mediumToLowTurbine) {
        generationData.push(ssmt.turbineInput.mediumToLowTurbine.generationEfficiency);
      }
      else {
        generationData.push(0);
      }
    }
    else {
      generationData = [0, 0, 0, 0];
    }
    return generationData;
  }


}
