import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { SSMT } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { WaterfallInput } from '../../../shared/waterfall-graph/waterfall-graph.service';
import { SSMTLosses } from '../../../shared/models/steam/steam-outputs';
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
  ssmt: SSMT;
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

  // @ViewChild('pieChartContainer', { static: false }) pieChartContainer: ElementRef;
  // @ViewChild('waterfallChartContainer', { static: false }) waterfallChartContainer: ElementRef;
  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   this.getPieWidth();
  //   this.getWaterfallWidth();
  // }

  // waterFallWidth: number;
  // pieWidth: number;
  // ssmt: SSMT;

  // ssmtOptions: Array<{ name: string, ssmt: SSMT, index: number }>;

  selectedSsmt1: SSMT;
  selectedSsmt2: SSMT;

  // ssmt1ProcessExportName: string;
  // ssmt1GenerationExportName: string;
  // ssmt1ProcessPieValues: Array<number>;
  // ssmt1ProcessPieLabels: Array<string>;
  // ssmt1GenerationPieValues: Array<number>;
  // ssmt1GenerationPieLabels: Array<string>;

  // ssmt2ProcessExportName: string;
  // ssmt2GenerationExportName: string;
  // ssmt2ProcessPieValues: Array<number>;
  // ssmt2ProcessPieLabels: Array<string>;
  // ssmt2GenerationPieValues: Array<number>;
  // ssmt2GenerationPieLabels: Array<string>;

  // allProcessPieValues: Array<Array<number>>;
  // allGenerationPieValues: Array<Array<number>>;

  // ssmt1WaterfallData: WaterfallInput;
  // ssmt2WaterfallData: WaterfallInput;

  // modExists: boolean = false;
  // graphColors: Array<string>;

  // // waterfallBaselineInputColor: string = "#74E88B";
  // // waterfallBaselineNetColor: string = "#17ADD3";
  // // waterfallBaselineLossColor: string = "#ED6F5B";
  // waterfallBaselineInputColor: string = "#99EEAA";
  // waterfallBaselineNetColor: string = "#A3D9FF";
  // waterfallBaselineLossColor: string = "#F5B0A5";
  // waterfallModificationInputColor: string = "#4FB286";
  // waterfallModificationNetColor: string = "#A193AD";
  // waterfallModificationLossColor: string = "#FFC466";

  // ssmt1GenerationNoData: boolean = false;
  // ssmt2GenerationNoData: boolean = false;
  // ssmt1WaterfallNoData: boolean = false;
  // ssmt2WaterfallNoData: boolean = false;

  constructor(private reportGraphsService: ReportGraphsService) { }

  ngOnInit() {
    this.selectedSsmt1 = this.ssmt;
    if (this.ssmt.modifications && this.ssmt.modifications.length != 0) {
      this.selectedSsmt2 = this.ssmt.modifications[0].ssmt;
    }
    // console.log(this.assessment);
    // this.ssmt = this.assessment.ssmt;
    // this.graphColors = graphColors;
    // this.ssmt1ProcessPieValues = new Array<number>();
    // this.ssmt1GenerationPieValues = new Array<number>();
    // this.ssmt2ProcessPieValues = new Array<number>();
    // this.ssmt2GenerationPieValues = new Array<number>();
    // this.ssmtOptions = new Array<{ name: string, ssmt: SSMT, index: number }>();
    // this.prepSsmtOptions();
    // this.setPieData();
    // this.setPieLabels();
    // this.setWaterfallData();
    // this.handleNoDataMessage();
  }

  ngAfterViewInit() {
    // this.getWaterfallWidth();
    // this.getPieWidth();
  }

  handleNoDataMessage() {
    // if (this.ssmt1GenerationPieValues === undefined || this.ssmt1GenerationPieValues === null || this.ssmt1GenerationPieValues.length <= 0) {
    //   this.ssmt1GenerationNoData = true;
    // }
    // if (this.ssmt2GenerationPieValues === undefined || this.ssmt2GenerationPieValues === null || this.ssmt2GenerationPieValues.length <= 0) {
    //   this.ssmt2GenerationNoData = true;
    // }
    // this.ssmt1WaterfallNoData = true;
    // if (this.ssmt1WaterfallData != undefined) {
    //   for (let i = 0; i < this.ssmt1WaterfallData.inputObjects.length; i++) {
    //     if (this.ssmt1WaterfallData.inputObjects[i].value > 0) {
    //       this.ssmt1WaterfallNoData = false;
    //     }
    //   }
    // }
    // this.ssmt2WaterfallNoData = true;
    // if (this.ssmt2WaterfallData != undefined) {
    //   for (let i = 0; i < this.ssmt2WaterfallData.inputObjects.length; i++) {
    //     if (this.ssmt2WaterfallData.inputObjects[i].value > 0) {
    //       this.ssmt2WaterfallNoData = false;
    //     }
    //   }
    // }
  }


  // setPieData() {
  //   this.ssmt1ProcessPieValues = this.reportGraphsService.getProcessUsageData(this.selectedSsmt1.ssmt);
  //   this.ssmt1GenerationPieValues = this.reportGraphsService.getGenerationData(this.selectedSsmt1.ssmt);
  //   if (this.modExists) {
  //     this.ssmt2ProcessPieValues = this.reportGraphsService.getProcessUsageData(this.selectedSsmt2.ssmt);
  //     this.ssmt2GenerationPieValues = this.reportGraphsService.getGenerationData(this.selectedSsmt2.ssmt);
  //   }
  // }

  // setPieLabels() {
  //   this.ssmt1ProcessPieLabels = new Array<string>();
  //   this.ssmt1GenerationPieLabels = new Array<string>();
  //   this.ssmt1ProcessPieLabels = this.reportGraphsService.getProcessUsageLabels(this.ssmt1ProcessPieValues, this.settings);
  //   this.ssmt1GenerationPieLabels = this.reportGraphsService.getGenerationLabels(this.ssmt1GenerationPieValues, this.selectedSsmt1.ssmt, this.settings);
  //   if (this.modExists) {
  //     this.ssmt2ProcessPieLabels = this.reportGraphsService.getProcessUsageLabels(this.ssmt2ProcessPieValues, this.settings);
  //     this.ssmt2GenerationPieLabels = this.reportGraphsService.getGenerationLabels(this.ssmt2GenerationPieValues, this.selectedSsmt2.ssmt, this.settings);
  //   }
  // }

  // prepSsmtOptions(): void {
  //   this.ssmtOptions.push({ name: 'Baseline', ssmt: this.ssmt, index: 0 });
  //   this.selectedSsmt1 = this.ssmtOptions[0];
  //   if (this.ssmt.modifications !== undefined && this.ssmt.modifications !== null && this.ssmt.modifications.length > 0) {
  //     this.modExists = true;
  //     console.log('MOD EXISTS!');
  //     let i = 1;
  //     this.ssmt.modifications.forEach(mod => {
  //       this.ssmtOptions.push({ name: mod.ssmt.name, ssmt: mod.ssmt, index: i });
  //       i++;
  //     });
  //     this.selectedSsmt2 = this.ssmtOptions[1];
  //   }
  // }

  // getAllChartData() {
  //   let isBaseline: boolean;
  //   for (let i = 0; i < this.ssmtOptions.length; i++) {
  //     if (i === 0 || (i !== 0 && (this.ssmtOptions[i].ssmt.modifications !== undefined && this.ssmtOptions[i].ssmt.modifications.length > 0))) {
  //       isBaseline = true;
  //     }
  //     else {
  //       isBaseline = false;
  //     }
  //   }
  // }

  // selectNewSsmt(dropDownIndex: number): void {
  //   if (dropDownIndex === 1) {
  //     this.ssmt1ProcessExportName = this.assessment.name + '-process-' + this.selectedSsmt1.name;
  //     this.ssmt1GenerationExportName = this.assessment.name + '-generation-' + this.selectedSsmt1.name;
  //   }
  //   else {
  //     this.ssmt2ProcessExportName = this.assessment.name + '-process-' + this.selectedSsmt2.name;
  //     this.ssmt2GenerationExportName = this.assessment.name + '-generation-' + this.selectedSsmt2.name;
  //   }
  //   this.setPieData();
  //   this.setPieLabels();
  //   this.setWaterfallData();
  // }


  // getPieWidth() {
  //   setTimeout(() => {
  //     if (this.waterfallChartContainer) {
  //       this.pieWidth = this.pieChartContainer.nativeElement.clientWidth - 50;
  //     }
  //   }, 100);
  // }

  // // waterfall functions
  // setWaterfallData() {
  //   this.ssmt1WaterfallData = this.reportGraphsService.getWaterfallData(this.selectedSsmt1, this.settings.steamEnergyMeasurement + '/hr', this.waterfallBaselineInputColor, this.waterfallBaselineLossColor, this.waterfallBaselineNetColor, this.baselineLosses, null);
  //   if (this.modExists) {
  //     this.ssmt2WaterfallData = this.reportGraphsService.getWaterfallData(this.selectedSsmt2, this.settings.steamEnergyMeasurement + '/hr', this.waterfallModificationInputColor, this.waterfallModificationLossColor, this.waterfallModificationNetColor, this.baselineLosses, this.selectedSsmt2.index === 0 ? null : this.modificationLosses[this.selectedSsmt2.index - 1].outputData);
  //   }
  // }

  // getWaterfallWidth() {
  //   setTimeout(() => {
  //     if (this.waterfallChartContainer) {
  //       this.waterFallWidth = this.waterfallChartContainer.nativeElement.clientWidth;
  //     }
  //   }, 100)
  // }

  // getWaterfallHeight(): number {
  //   return 500;
  // }
}
