import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService, PhastResultsData } from '../../report-rollup.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { PhastService } from '../../../phast/phast.service';
import { PhastResults, ShowResultsCategories } from '../../../shared/models/phast/phast';
import { PhastResultsService } from '../../../phast/phast-results.service';
import * as d3 from 'd3';
import * as c3 from 'c3';
import { Subscriber, Subscription } from 'rxjs';
@Component({
  selector: 'app-phast-rollup-furnace-summary',
  templateUrl: './phast-rollup-furnace-summary.component.html',
  styleUrls: ['./phast-rollup-furnace-summary.component.css']
})
export class PhastRollupFurnaceSummaryComponent implements OnInit {
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
  chartLabels: Array<string>;
  axisLabel: string;
  unit: string;
  title: string;

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

  resultData: Array<PhastResultsData>;
  graphOptions: Array<string> = [
    '% Available Heat',
    'Energy Use',
    'Cost',
    'Energy Intensity'
  ]
  graphOption: string = 'Energy Use';
  resultsSub: Subscription;
  constructor(private reportRollupService: ReportRollupService, private phastResultsService: PhastResultsService, private convertUnitsService: ConvertUnitsService, private phastService: PhastService) { }

  ngOnInit() {
    this.resultData = new Array();
    this.resultsSub = this.reportRollupService.phastResults.subscribe((phasts: Array<PhastResultsData>) => {
      if (phasts.length != 0) {
        this.resultData = phasts;
        if (this.printView) {
          this.chartContainerWidth = 1500;
          this.initPrintChartData();
        }
        else {
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

  getWidth() {
    if (this.barChartContainer) {
      let containerPadding = 30;
      return this.barChartContainer.nativeElement.clientWidth - containerPadding;
    }
    else {
      return 0;
    }
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
      if (graphOption == '% Available Heat') {
        this.unit = "%";
        num1 = this.getAvailableHeat(data.baselineResultData, data.settings)
        if (data.modName) {
          num2 = this.getAvailableHeat(data.modificationResultData, data.settings)
        }
      } else if (graphOption == 'Energy Use') {
        if (i == 1) {
          this.unit = this.settings.phastRollupUnit + '/yr';
        }
        num1 = this.getConvertedValue(data.baselineResults.annualEnergyUsed, data.settings);
        if (data.modName) {
          num2 = this.getConvertedValue(data.modificationResults.annualEnergyUsed, data.settings);
        }
      } else if (graphOption == 'Cost') {
        if (i == 1) {
          this.unit = "$/yr";
        }
        num1 = data.baselineResults.annualCost;
        if (data.modName) {
          num2 = data.modificationResults.annualCost;
        }
      } else if (graphOption == 'Energy Intensity') {
        if (i == 1) {
          if (this.settings.unitsOfMeasure == 'Metric') {
            this.unit = this.settings.phastRollupUnit + '/kg';
          } else {
            this.unit = this.settings.phastRollupUnit + '/lb';
          }
        }
        num1 = this.getConvertedValue(data.baselineResults.energyPerMass, data.settings);
        if (data.modName) {
          num2 = this.getConvertedValue(data.modificationResults.energyPerMass, data.settings);
        }
      }
      i++;
      //sigFigs
      let num1SigFigs = this.reportRollupService.transform(num1, 4, true);
      let num2SigFigs = this.reportRollupService.transform(num2, 4, true);
      this.addData(data.name, num1SigFigs, num2SigFigs);
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

  getConvertedValue(val: number, settings: Settings) {
    return this.convertUnitsService.value(val).from(settings.energyResultUnit).to(this.settings.phastRollupUnit);
  }

  getAvailableHeat(data: PhastResults, settings: Settings) {
    let resultCategories: ShowResultsCategories = this.phastResultsService.getResultCategories(settings);
    if (resultCategories.showFlueGas) {
      return data.flueGasAvailableHeat;
    }

    if (resultCategories.showSystemEff) {
      return data.heatingSystemEfficiency;
    }

    if (resultCategories.showEnInput2) {
      return data.availableHeatPercent;
    }

    if (resultCategories.showExGas) {
      return (1 - (data.totalExhaustGasEAF / data.grossHeatInput)) * 100
    }
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
}
