import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService, PsatResultsData } from '../../report-rollup.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import * as d3 from 'd3';
import * as c3 from 'c3';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-psat-rollup-pump-summary',
  templateUrl: './psat-rollup-pump-summary.component.html',
  styleUrls: ['./psat-rollup-pump-summary.component.css']
})
export class PsatRollupPumpSummaryComponent implements OnInit {
  @Input()
  settings: Settings
  @Input()
  printView: boolean;

  @ViewChild('barChartContainer') barChartContainer: ElementRef;

  firstLoad: boolean = true;
  isUpdate: boolean = false;
  showTitle: boolean = false;
  showLegend: boolean = true;

  //chart element
  chartContainerWidth: number;

  //chart text
  title: string;
  unit: string;
  axisLabel: string;
  chartLabels: Array<string>;

  //print view chart variables
  titles: Array<string>;
  units: Array<string>;
  printChartData: Array<any>;

  //chart data
  allDataColumns: Array<any>;
  baselineColumns: Array<any>;
  modColumns: Array<any>;

  //chart color  
  graphColors: Array<string>;

  resultData: Array<PsatResultsData>;
  graphOptions: Array<string> = [
    'Energy Use',
    'Cost'
  ];
  numPsats: number;
  graphOption: string = 'Energy Use';
  resultsSub: Subscription;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.resultData = new Array();
    this.resultsSub = this.reportRollupService.psatResults.subscribe((psats: Array<PsatResultsData>) => {
      if (psats.length != 0) {
        this.numPsats = psats.length;
        this.resultData = psats;
        if (this.printView) {
          this.chartContainerWidth = 1250;
          this.initPrintChartData();
        }
        else {
          this.chartContainerWidth = (window.innerWidth - 30) * .60;
          this.buildChartData(this.graphOption, false);
          this.initChartData();
        }
      }
    });
  }

  ngOnChanges() {
    if (this.firstLoad) {
      this.firstLoad = !this.firstLoad;
    }
    else {
      this.buildChartData(this.graphOption, true);
      this.initChartData();
    }
  }

  ngOnDestroy(){
    this.resultsSub.unsubscribe();
  }

  buildChartData(graphOption: string, update: boolean) {
    //init arrays
    this.baselineColumns = new Array<any>();
    this.baselineColumns.push("Baseline");
    this.modColumns = new Array<any>();
    this.modColumns.push("Modification");
    this.title = graphOption;
    this.chartLabels = new Array();
    let i = 1;

    this.resultData.forEach(data => {
      let num1 = 0;
      let num2 = 0;
      if (graphOption == 'Energy Use') {
        if (i == 1) {
          this.unit = 'kWh/yr';
        }
        num1 = data.baselineResults.annual_energy;
        if (data.modName) {
          num2 = data.modificationResults.annual_energy;
        }
      } else if (graphOption == 'Cost') {
        if (i == 1) {
          this.unit = "$/yr";
        }
        num1 = data.baselineResults.annual_cost;
        if (data.modName) {
          num2 = data.modificationResults.annual_cost;
        }
      }
      i++;
      this.addData(data.name, num1, num2);
    });
    this.axisLabel = graphOption + " (" + this.unit + ")";

    if (!this.printView) {
      this.isUpdate = update;
    }
  }

  addData(label: string, baseNum: number, modNum: number) {
    this.chartLabels.push(label);
    this.baselineColumns.push(baseNum);
    this.modColumns.push(modNum);
  }


  getPayback(modCost: number, baselineCost: number, implementationCost: number) {
    if (implementationCost) {
      let val = (implementationCost / (baselineCost - modCost)) * 12;
      if (isNaN(val) == false) {
        return val;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  getSavings(modCost: number, baselineCost: number) {
    return baselineCost - modCost;
  }

  initChartData() {
    this.allDataColumns = new Array<any>();
    this.allDataColumns.push(this.baselineColumns);
    this.allDataColumns.push(this.modColumns);
  }

  initPrintChartData() {
    this.printChartData = new Array<any>();
    this.titles = new Array<any>();
    this.units = new Array<any>();

    for (let i = 0; i < this.graphOptions.length; i++) {
      let tmpDataColumns = new Array<any>();
      this.buildChartData(this.graphOptions[i], false);
      tmpDataColumns.push(this.baselineColumns);
      tmpDataColumns.push(this.modColumns);
      this.printChartData.push(tmpDataColumns);
      this.titles.push(this.graphOptions[i]);
      this.units.push(this.unit);
    }
  }

  getWidth() {
    if (this.barChartContainer) {
      let containerPadding = 30;
      return this.barChartContainer.nativeElement.clientWidth - containerPadding;
    }
    else {
      return 0;
    }
  }
}