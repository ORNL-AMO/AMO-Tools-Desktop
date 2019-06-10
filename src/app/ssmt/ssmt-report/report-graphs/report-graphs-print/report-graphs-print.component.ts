import { Component, OnInit, Input } from '@angular/core';
import { SSMT } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { ReportGraphsService } from '../report-graphs.service';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { SSMTLosses } from '../../../../shared/models/steam/steam-outputs';
import { WaterfallInput } from '../../../../shared/waterfall-graph/waterfall-graph.service';

@Component({
  selector: 'app-report-graphs-print',
  templateUrl: './report-graphs-print.component.html',
  styleUrls: ['./report-graphs-print.component.css']
})
export class ReportGraphsPrintComponent implements OnInit {
  @Input()
  ssmtOptions: Array<{ name: string, ssmt: SSMT, index: number }>;
  @Input()
  baselineLosses: SSMTLosses;
  @Input()
  modificationLosses: Array<{ outputData: SSMTLosses, name: string }>;
  @Input()
  settings: Settings;
  @Input()
  modExists: boolean;
  @Input()
  printGraphs: boolean;

  baselineSsmt: { name: string, ssmt: SSMT, index: number };
  graphColors: Array<string>;

  waterfallStartColor: string = '#74E88B';
  waterfallLossColor: string = '#ED6F5B';
  waterfallNetColor: string = '#17ADD3';

  baselinePieProcessUsageData: Array<number>;
  baselinePieProcessUsageLabels: Array<string>;

  baselinePieGenerationData: Array<number>;
  baselinePieGenerationLabels: Array<string>;

  modificationPieProcessUsageData: Array<Array<number>>;
  modificationPieProcessUsageLabels: Array<Array<string>>;

  modificationPieGenerationData: Array<Array<number>>;
  modificationPieGenerationLabels: Array<Array<string>>;

  baselineWaterfallInput: WaterfallInput
  modificationWaterfallInputs: Array<WaterfallInput>;

  constructor(private reportGraphsService: ReportGraphsService) { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.baselineSsmt = this.ssmtOptions[0];
    this.baselineWaterfallInput = this.reportGraphsService.getWaterfallData(this.baselineSsmt, this.settings.steamEnergyMeasurement + '/hr', '#74E88B', '#ED6F5B', '#17ADD3', this.baselineLosses, null);
    this.baselinePieProcessUsageData = this.getProcessUsageData(this.baselineSsmt.ssmt);
    this.baselinePieProcessUsageLabels = this.getProcessUsageLabels(this.baselinePieProcessUsageData);
    this.baselinePieGenerationData = this.getGenerationData(this.baselineSsmt.ssmt);
    this.baselinePieGenerationLabels = this.getGenerationLabels(this.baselinePieGenerationData, this.baselineSsmt.ssmt);
    if (this.modExists) {
      this.modificationWaterfallInputs = new Array<WaterfallInput>();
      this.modificationWaterfallInputs = this.getAllModificationWaterfallInputs();
      this.modificationPieProcessUsageData = this.getAllModificationPieProcessUsageData();
      this.modificationPieProcessUsageLabels = this.getAllModificationPieProcessUsageLabels();
      this.modificationPieGenerationData = this.getAllModificationPieGenerationData();
      this.modificationPieGenerationLabels = this.getAllModificationPieGenerationLabels();
    }
  }

  getAllModificationWaterfallInputs(): Array<WaterfallInput> {
    let tmpWaterfallInputs = new Array<WaterfallInput>();
    for (let i = 1; i < this.ssmtOptions.length; i++) {
      let tmpWaterfallInput = this.reportGraphsService.getWaterfallData(this.ssmtOptions[i], this.settings.steamEnergyMeasurement + '/hr', '#74E88B', '#ED6F5B', '#17ADD3', this.baselineLosses, this.modificationLosses[i - 1].outputData);
      tmpWaterfallInputs.push(tmpWaterfallInput);
    }
    return tmpWaterfallInputs;
  }

  getAllModificationPieProcessUsageData() {
    let tmpData = new Array<Array<number>>();

    for (let i = 1; i < this.ssmtOptions.length; i++) {
      let tmpD = this.getProcessUsageData(this.ssmtOptions[i].ssmt);
      tmpData.push(tmpD);
    }
    return tmpData;
  }

  getAllModificationPieProcessUsageLabels() {
    let tmpLabels = new Array<Array<string>>();
    for (let i = 0; i < this.modificationPieProcessUsageData.length; i++) {
      let tmpL = this.getProcessUsageLabels(this.modificationPieProcessUsageData[i]);
      tmpLabels.push(tmpL);
    }
    return tmpLabels;
  }

  getAllModificationPieGenerationData() {
    let tmpData = new Array<Array<number>>();
    for (let i = 1; i < this.ssmtOptions.length; i++) {
      let tmpD = this.getGenerationData(this.ssmtOptions[i].ssmt);
      tmpData.push(tmpD);
    }
    return tmpData;
  }

  getAllModificationPieGenerationLabels() {
    let tmpLabels = new Array<Array<string>>();
    for (let i = 0; i < this.modificationPieGenerationData.length; i++) {
      let tmpL = this.getGenerationLabels(this.modificationPieGenerationData[i], this.ssmtOptions[i + 1].ssmt);
      tmpLabels.push(tmpL);
    }
    return tmpLabels;
  }

  getProcessUsageData(ssmt: SSMT) {
    return this.reportGraphsService.getProcessUsageData(ssmt);
  }

  getProcessUsageLabels(processUsageData: Array<number>) {
    return this.reportGraphsService.getProcessUsageLabels(processUsageData, this.settings);
  }

  getGenerationData(ssmt: SSMT) {
    return this.reportGraphsService.getGenerationData(ssmt);
  }

  getGenerationLabels(generationData: Array<number>, ssmt: SSMT) {
    return this.reportGraphsService.getGenerationLabels(generationData, ssmt, this.settings);
  }
}
