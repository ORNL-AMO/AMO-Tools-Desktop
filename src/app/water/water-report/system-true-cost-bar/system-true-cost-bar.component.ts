import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Subscription } from 'rxjs';
import { WaterReportService } from '../water-report.service';
import * as _ from 'lodash';
import { PrintOptionsMenuService } from '../../../shared/print-options-menu/print-options-menu.service';

@Component({
  selector: 'app-system-true-cost-bar',
  standalone: false,
  templateUrl: './system-true-cost-bar.component.html',
  styleUrl: './system-true-cost-bar.component.css'
})
export class SystemTrueCostBarComponent {
  printView: boolean;
  @ViewChild('systemTrueCostBarChart', { static: false }) systemTrueCostBarChart: ElementRef;

  systemTrueCostReportSubscription: Subscription;
  showPrintViewSub: Subscription;
  constructor(
    private waterReportService: WaterReportService,
    private printOptionsMenuService: PrintOptionsMenuService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
      this.showPrintViewSub = this.printOptionsMenuService.showPrintView.subscribe(val => {
      this.printView = val;
    });
  }

  ngOnDestroy() {
      this.systemTrueCostReportSubscription.unsubscribe();
      this.showPrintViewSub.unsubscribe();
  }

  ngAfterViewInit() {
    // todo needs print logic, programmatic colors
    this.systemTrueCostReportSubscription = this.waterReportService.systemTrueCostReport.subscribe(report => {
    
    let costTypes = [
      "Municipal Water Intake", 
      "Municipal Wastewater Disposal", 
      "Third-party Disposal", 
      "Water Treatment", 
      "Wastewater Treatment", 
      "Pump and Motor Energy", 
      "Heat Energy in Wastewater", 
      "Total"
    ];

    let colors = [
      '#75a1ff',
      '#7f7fff',
      // '#ededed',
      '#009386',
      '#93e200',
      '#ff7f0e',
      '#ffbb78',
];

    // * remove total
    let displayCostTypes = costTypes.slice(0, -1);
    let sortedData = this.waterReportService.getSortedTrueCostReport(report);
    
    let chartData = displayCostTypes.map((costType, index) => {
      return {
        x: sortedData.map(item => item.connectionCostByType[index] || 0),
        y: sortedData.map(item => item.label),
        name: costType,
        type: 'bar',
        orientation: 'h',
        hoverinfo: 'name+x',
        // text: sortedData.map(item => item.results[index] ? `${(item.results[index]).toLocaleString()}` : ''),
        textposition: 'auto',
        marker: { line: { width: 1, color: 'white' } }
      };
    }).filter(series => !series.x.every(val => val === 0));

      const layout = {
        title: 'True Cost of Water Systems',
        barmode: 'stack',
        height: 500,
        width: this.printView? 800 : undefined,
        autosize: true,
        margin: { l: 140, r: 150, t: 80, b: 50 },
        xaxis: {
          title: 'Cost per Year',
          tickformat: '$,.0f'
        },
        yaxis: {
          title: '',
          automargin: true
        },
        legend: {
          orientation: 'v',
          x: 1.02,
          y: 1,
          xanchor: 'left',
          yanchor: 'top'
        },
        colorway: colors
        // colorway: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2']
      };

      let configOptions = {
        modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: this.printView? false : true
      };
      this.plotlyService.newPlot(this.systemTrueCostBarChart.nativeElement, chartData, layout, configOptions);

  
    });
  }


}
