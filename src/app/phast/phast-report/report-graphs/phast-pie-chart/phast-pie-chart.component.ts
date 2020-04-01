import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as _ from 'lodash';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import * as Plotly from 'plotly.js';
import { graphColors } from '../graphColors';
import { PhastResultsService } from '../../../phast-results.service';

@Component({
  selector: 'app-phast-pie-chart',
  templateUrl: './phast-pie-chart.component.html',
  styleUrls: ['./phast-pie-chart.component.css']
})
export class PhastPieChartComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;

  @ViewChild('ssmtPieChart', { static: false }) ssmtPieChart: ElementRef;
  noData: boolean;

  constructor(private phastResultsService: PhastResultsService) { }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    if (!this.printView) {
      this.createChart();
    } else {
      // this.createPrintChart();
    }
  }

  ngOnChanges() {
    if (this.ssmtPieChart && !this.printView) {
      this.createChart();
    } else if (this.ssmtPieChart && this.printView) {
      // this.createPrintChart();
    }
  }

  createChart() {
    let valuesAndLabels: Array<{ value: number, label: string }> = this.getValuesAndLabels();
    var data = [{
      values: valuesAndLabels.map(val => { return val.value }),
      labels: valuesAndLabels.map(val => { return val.label }),
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      // automargin: true,
      // textinfo: 'label+value',
      hoverformat: '.2s',
      texttemplate: '<b>%{label}:</b><br> %{percent}',
      // text: valuesAndLabels.values.map(y => { return (y).toFixed(2) }),
      hoverinfo: 'label+value',
      direction: "clockwise",
      rotation: 90
    }];
    var layout = {
      font: {
        size: 14,
      },
      showlegend: false,
      margin: { t: 15, b: 15, l: 100, r: 100 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.react(this.ssmtPieChart.nativeElement, data, layout, modebarBtns);
  }
  getValuesAndLabels(): Array<{ value: number, label: string }> {
    let results: PhastResults = this.phastResultsService.getResults(this.phast, this.settings);
    let resultCats: ShowResultsCategories = this.phastResultsService.getResultCategories(this.settings);
    let pieData = new Array<{ label: string, value: number }>();

    if (results.totalWallLoss) {
      pieData.push({ label: "Wall", value: results.totalWallLoss });
    }
    if (results.totalAtmosphereLoss) {
      pieData.push({ label: "Atmosphere", value: results.totalAtmosphereLoss });
    }
    if (results.totalOtherLoss) {
      pieData.push({ label: "Other", value: results.totalOtherLoss });
    }
    if (results.totalCoolingLoss) {
      pieData.push({ label: "Cooling", value: results.totalCoolingLoss });
    }
    if (results.totalOpeningLoss) {
      pieData.push({ label: "Opening", value: results.totalOpeningLoss });
    }
    if (results.totalFixtureLoss) {
      pieData.push({ label: "Fixture", value: results.totalFixtureLoss });
    }
    if (results.totalLeakageLoss) {
      pieData.push({ label: "Leakage", value: results.totalLeakageLoss });
    }
    if (results.totalExtSurfaceLoss) {
      pieData.push({ label: "Extended Surface", value: results.totalExtSurfaceLoss });
    }
    if (results.totalChargeMaterialLoss) {
      pieData.push({ label: "Charge Material", value: results.totalChargeMaterialLoss });
    }
    if (resultCats.showFlueGas) {
      pieData.push({ label: "Flue Gas", value: results.totalFlueGas });
    }
    if (resultCats.showAuxPower) {
      pieData.push({ label: "Auxiliary", value: results.totalAuxPower });
    }
    if (resultCats.showSlag) {
      pieData.push({ label: "Slag", value: results.totalSlag });
    }
    if (resultCats.showExGas) {
      pieData.push({ label: "Exhaust Gas", value: results.totalExhaustGasEAF });
    }
    if (resultCats.showEnInput2) {
      pieData.push({ label: "Exhaust Gas", value: results.totalExhaustGas });
    }
    if (resultCats.showSystemEff) {
      pieData.push({ label: "System Eff.", value: results.totalSystemLosses });
    }
    return pieData;
  }
}
