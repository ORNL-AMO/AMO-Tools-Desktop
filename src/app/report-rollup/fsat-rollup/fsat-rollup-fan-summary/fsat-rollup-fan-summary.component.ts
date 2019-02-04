import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FsatResultsData, ReportRollupService } from '../../report-rollup.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fsat-rollup-fan-summary',
  templateUrl: './fsat-rollup-fan-summary.component.html',
  styleUrls: ['./fsat-rollup-fan-summary.component.css']
})
export class FsatRollupFanSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
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

  resultData: Array<FsatResultsData>;
  graphOptions: Array<string> = [
    'Energy Use',
    'Cost'
  ];
  numFsats: number;
  graphOption: string = 'Energy Use';
  resultsSub: Subscription;

  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.resultData = new Array();
    this.resultsSub = this.reportRollupService.fsatResults.subscribe((fsats: Array<FsatResultsData>) => {
      if (fsats.length != 0) {
        this.numFsats = fsats.length;
        this.resultData = fsats;
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

  ngOnDestroy() {
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
        num1 = data.baselineResults.annualEnergy;
        if (data.modName) {
          num2 = data.modificationResults.annualEnergy;
        }
      } else if (graphOption == 'Cost') {
        if (i == 1) {
          this.unit = "$/yr";
        }
        num1 = data.baselineResults.annualCost;
        if (data.modName) {
          num2 = data.modificationResults.annualCost;
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
