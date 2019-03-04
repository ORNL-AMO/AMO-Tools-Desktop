import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { SSMT } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { WaterfallItem, WaterfallInput } from '../../../shared/waterfall-graph/waterfall-graph.service';
import { SSMTLosses } from '../../../shared/models/steam/steam-outputs';
import * as d3 from 'd3';
import { ReportGraphsService } from './report-graphs.service';

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
  baselineLosses: SSMTLosses;
  @Input()
  modificationLosses: Array<{ outputData: SSMTLosses, name: string }>;
  @Input()
  printView: boolean;
  @Input()
  printSankey: boolean;
  @Input()
  printGraphs: boolean;

  @ViewChild('pieChartContainer') pieChartContainer: ElementRef;
  @ViewChild('waterfallChartContainer') waterfallChartContainer: ElementRef;

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

  ssmt1WaterfallData: WaterfallInput;
  ssmt2WaterfallData: WaterfallInput;

  modExists: boolean = false;
  graphColors: Array<string>;

  steamPowerUnit: string = 'kW';


  constructor(private reportGraphsService: ReportGraphsService) { }

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
    this.setPieLabels();
    this.setWaterfallData();
  }


  setPieData() {
    this.ssmt1ProcessPieValues = this.reportGraphsService.getProcessUsageData(this.selectedSsmt1.ssmt);
    this.ssmt1GenerationPieValues = this.reportGraphsService.getGenerationData(this.selectedSsmt1.ssmt);
    if (this.modExists) {
      this.ssmt2ProcessPieValues = this.reportGraphsService.getProcessUsageData(this.selectedSsmt2.ssmt);
      this.ssmt2GenerationPieValues = this.reportGraphsService.getGenerationData(this.selectedSsmt2.ssmt);
    }
  }

  setPieLabels() {
    this.ssmt1ProcessPieLabels = new Array<string>();
    this.ssmt1GenerationPieLabels = new Array<string>();
    this.ssmt1ProcessPieLabels = this.reportGraphsService.getProcessUsageLabels(this.ssmt1ProcessPieValues, this.settings);
    this.ssmt1GenerationPieLabels = this.reportGraphsService.getGenerationLabels(this.ssmt1GenerationPieValues, this.selectedSsmt1.ssmt, this.settings);
    if (this.modExists) {
      this.ssmt2ProcessPieLabels = this.reportGraphsService.getProcessUsageLabels(this.ssmt2ProcessPieValues, this.settings);
      this.ssmt2GenerationPieLabels = this.reportGraphsService.getGenerationLabels(this.ssmt2GenerationPieValues, this.selectedSsmt2.ssmt, this.settings);
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
      // this.ssmt1ProcessPieValues = this.reportGraphsService.getProcessUsageData(this.selectedSsmt1.ssmt);
      // this.ssmt1GenerationPieValues = this.reportGraphsService.getGenerationData(this.selectedSsmt1.ssmt);
      this.ssmt1ProcessExportName = this.assessment.name + '-process-' + this.selectedSsmt1.name;
      this.ssmt1GenerationExportName = this.assessment.name + '-generation-' + this.selectedSsmt1.name;
    }
    else {
      // this.ssmt2ProcessPieValues = this.reportGraphsService.getProcessUsageData(this.selectedSsmt2.ssmt);
      // this.ssmt2GenerationPieValues = this.reportGraphsService.getGenerationData(this.selectedSsmt2.ssmt);
      this.ssmt2ProcessExportName = this.assessment.name + '-process-' + this.selectedSsmt2.name;
      this.ssmt2GenerationExportName = this.assessment.name + '-generation-' + this.selectedSsmt2.name;
    }
    this.setPieData();
    this.setPieLabels();
    this.setWaterfallData();
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



  // waterfall functions
  setWaterfallData() {
    this.ssmt1WaterfallData = null;
    this.ssmt2WaterfallData = null;
    this.ssmt1WaterfallData = this.reportGraphsService.getWaterfallData(this.selectedSsmt1, '#74E88B', '#ED6F5B', '#17ADD3', this.baselineLosses, this.modificationLosses);
    if (this.modExists) {
      this.ssmt2WaterfallData = this.reportGraphsService.getWaterfallData(this.selectedSsmt2, '#74E88B', '#ED6F5B', '#17ADD3', this.baselineLosses, this.modificationLosses);
    }
  }

  getWaterfallData(selectedSsmt: { name: string, ssmt: SSMT, index: number }, startColor: string, lossColor: string, netColor: string) {
    let tmpLosses: SSMTLosses;
    if (selectedSsmt.index == 0) {
      tmpLosses = this.baselineLosses;
    }
    else {
      tmpLosses = this.modificationLosses[selectedSsmt.index - 1].outputData;
    }
    let inputObjects: Array<WaterfallItem> = new Array<WaterfallItem>();
    let startNode: WaterfallItem = {
      value: tmpLosses.fuelEnergy,
      label: 'Input Energy',
      isStartValue: true,
      isNetValue: false
    }
    let processUseNetNode: WaterfallItem = {
      value: tmpLosses.allProcessUsageUsefulEnergy,
      label: 'Process Use',
      isStartValue: false,
      isNetValue: true
    };
    let turbineUseNetNode: WaterfallItem = {
      value: tmpLosses.highToLowTurbineUsefulEnergy + tmpLosses.highToMediumTurbineUsefulEnergy + tmpLosses.mediumToLowTurbineUsefulEnergy + tmpLosses.condensingTurbineUsefulEnergy,
      label: 'Turbine Generation',
      isStartValue: false,
      isNetValue: true
    }
    let otherLossNode: WaterfallItem = {
      value: tmpLosses.totalOtherLosses,
      label: 'Other Losses',
      isStartValue: false,
      isNetValue: false
    };
    let stackLossNode: WaterfallItem = {
      value: tmpLosses.stack,
      label: 'Stack Losses',
      isStartValue: false,
      isNetValue: false
    };
    let turbineLossNode: WaterfallItem = {
      value: tmpLosses.highToLowTurbineEfficiencyLoss + tmpLosses.highToMediumTurbineEfficiencyLoss + tmpLosses.mediumToLowTurbineEfficiencyLoss + tmpLosses.condensingTurbineEfficiencyLoss + tmpLosses.condensingLosses,
      label: 'Turbine Losses',
      isStartValue: false,
      isNetValue: false
    };
    let condensateLossNode: WaterfallItem = {
      value: tmpLosses.condensateLosses,
      label: 'Condensate Losses',
      isStartValue: false,
      isNetValue: false
    };
    inputObjects = [startNode, turbineUseNetNode, turbineLossNode, processUseNetNode, condensateLossNode, stackLossNode, otherLossNode];

    let waterfallData: WaterfallInput = {
      name: selectedSsmt.name,
      inputObjects: inputObjects,
      startColor: startColor,
      lossColor: lossColor,
      netColor: netColor
    };
    return waterfallData;
  }

  getWaterfallWidth(): number {
    if (this.waterfallChartContainer) {
      return this.waterfallChartContainer.nativeElement.clientWidth;
    }
    else {
      return 0;
    }
  }

  getWaterfallHeight(): number {
    return 500;
  }
}
