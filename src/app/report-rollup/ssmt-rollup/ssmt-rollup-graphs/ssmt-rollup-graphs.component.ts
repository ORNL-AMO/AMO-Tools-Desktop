import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService } from '../../report-rollup.service';
import { Subscription } from 'rxjs';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';
import { SsmtResultsData } from '../../report-rollup-models';

@Component({
  selector: 'app-ssmt-rollup-graphs',
  templateUrl: './ssmt-rollup-graphs.component.html',
  styleUrls: ['./ssmt-rollup-graphs.component.css']
})
export class SsmtRollupGraphsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  @ViewChild('pieChartContainer') pieChartContainer: ElementRef;

  chartContainerWidth: number;
  isUpdate: boolean = false;
  showLegend: boolean = false;
  labels: boolean = true;

  pieChartLabels: Array<string>;
  pieChartData: Array<number>;
  chartColors: Array<any>;
  backgroundColors: Array<string>;
  graphColors: Array<string>;
  resultData: Array<SsmtResultsData>;
  dataOption: string = 'cost';
  totalEnergyUse: number = 0;
  totalCost: number = 0;
  results: Array<any>;

  // contains results for every option to build print view charts
  allResults: Array<any>;
  resultsSub: Subscription;

  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.resultsSub = this.reportRollupService.ssmtResults.subscribe((ssmt: Array<SsmtResultsData>) => {
      if (ssmt.length !== 0) {
        this.totalEnergyUse = _.sumBy(ssmt, (ssmt) => { return ssmt.baselineResults.operationsOutput.boilerFuelUsage; });
        this.totalCost = _.sumBy(ssmt, (ssmt) => { return ssmt.baselineResults.operationsOutput.totalOperatingCost; });
        this.resultData = ssmt;
        this.getResults(this.resultData);
        this.getData();
      }
    });

    if (this.printView) {
      this.initPrintChartData();
    }
  }

  ngOnDestroy() {
    this.resultsSub.unsubscribe();
  }

  setDataOption(str: string) {
    this.dataOption = str;
    this.getResults(this.resultData);
    this.getData();
  }

  getResults(resultsData: Array<SsmtResultsData>) {
    this.results = new Array();
    let i = 0;
    if (resultsData) {
      resultsData.forEach(val => {
        let percent;
        if (this.dataOption === 'cost') {
          percent = this.getTotalCostPercent(val.baselineResults.operationsOutput.totalOperatingCost);
        } else {
          percent = this.getTotalEnergyPercent(val.baselineResults.operationsOutput.boilerFuelUsage);
        }
        this.results.push({
          name: val.name,
          percent: percent,
          color: graphColors[i]
        });
        i++;
      });
    }
  }

  getTotalCostPercent(val: number) {
    if (this.totalCost) {
      let percent = (val / this.totalCost) * 100;
      return percent;
    }
  }

  getTotalEnergyPercent(val: number) {
    if (this.totalEnergyUse) {
      let percent = (val / this.totalEnergyUse) * 100;
      return percent;
    }
  }

  getData() {
    this.pieChartData = new Array();
    this.pieChartLabels = new Array();
    this.backgroundColors = new Array();
    this.results.forEach(val => {
      this.pieChartLabels.push(val.name + ' (%)');
      this.pieChartData.push(val.percent);
      this.backgroundColors.push(val.color);
    });
    this.getColors();
  }

  getColors() {
    this.chartColors = [
      {
        backgroundColor: this.backgroundColors
      }
    ];
  }

  initPrintChartData() {
    this.allResults = new Array<any>();
    this.dataOption = 'cost';
    this.getResults(this.resultData);
    this.getData();
    this.allResults.push(this.results);
    this.dataOption = 'energy';
    this.getResults(this.resultData);
    this.getData();
    this.allResults.push(this.results);
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
}
