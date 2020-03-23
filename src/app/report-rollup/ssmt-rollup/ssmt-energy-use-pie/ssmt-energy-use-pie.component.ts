import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ReportRollupService } from '../../report-rollup.service';
import * as Plotly from 'plotly.js';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from '../../../shared/models/settings';
import { SsmtResultsData } from '../../report-rollup-models';

@Component({
  selector: 'app-ssmt-energy-use-pie',
  templateUrl: './ssmt-energy-use-pie.component.html',
  styleUrls: ['./ssmt-energy-use-pie.component.css']
})
export class SsmtEnergyUsePieComponent implements OnInit {
  @Input()
  dataOption: string
  @Input()
  printView: boolean;
  @Input()
  settings: Settings;

  @ViewChild('ssmtEnergyPie', { static: false }) ssmtEnergyPie: ElementRef;

  constructor(private reportRollupService: ReportRollupService) { }

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
    if (this.ssmtEnergyPie && !this.printView) {
      this.createChart();
    } else if (this.ssmtEnergyPie && this.printView) {
      // this.createPrintChart();
    }
  }

  createChart() {
    let valuesAndLabels: Array<{ value: number, label: string }> = this.getValuesAndLabels();
    let texttemplate: string;
    if (this.dataOption == 'energy') {
      texttemplate = '<b>%{label}:</b><br> %{value:,.2f}' + ' ' + this.settings.steamEnergyMeasurement + '/hr';

    } else if (this.dataOption == 'cost') {
      texttemplate = '<b>%{label}:</b><br> %{value:$,.2f}';
    }
    Plotly.purge(this.ssmtEnergyPie.nativeElement);
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
      hoverformat: '.2r',
      texttemplate: texttemplate,
      // text: valuesAndLabels.values.map(y => { return (y).toFixed(2) }),
      hoverinfo: 'label+percent',
      // direction: "clockwise",
      // rotation: 90
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
    Plotly.react(this.ssmtEnergyPie.nativeElement, data, layout, modebarBtns);
  }

  getValuesAndLabels(): Array<{ value: number, label: string }> {
    let ssmtResults: Array<SsmtResultsData> = this.reportRollupService.ssmtResults.getValue();
    let valuesAndLabels: Array<{ value: number, label: string }> = new Array();
    if (this.dataOption == 'cost') {
      ssmtResults.forEach(result => {
        valuesAndLabels.push({
          label: result.name,
          value: result.baselineResults.operationsOutput.totalOperatingCost
        });
      })
    } else if (this.dataOption == 'energy') {
      ssmtResults.forEach(result => {
        valuesAndLabels.push({
          label: result.name,
          value: result.baselineResults.operationsOutput.boilerFuelUsage
        });
      })
    }
    return valuesAndLabels;
  }
}
