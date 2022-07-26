import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { CompressedAirAssessment, CompressedAirDayType } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { BaselineResults, DayTypeProfileSummary } from '../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { EndUseEnergyData, EndUsesService } from '../end-uses/end-uses.service';

@Component({
  selector: 'app-end-use-chart',
  templateUrl: './end-use-chart.component.html',
  styleUrls: ['./end-use-chart.component.css']
})
export class EndUseChartComponent implements OnInit {
  @ViewChild('overviewPieChart', { static: false }) overviewPieChart: ElementRef;
  settings: Settings;
  units: string;
  selectedDayType: CompressedAirDayType;
  selectedDayTypeAverage: number;
  dayTypeBaselineResults: BaselineResults;
  dayTypeEndUseWarning: string;
  compressedAirAssessment: CompressedAirAssessment;
  dayTypeProfileSummaries: Array<DayTypeProfileSummary>;
  compressedAirAssessmentSub: Subscription;
  // From Plotly source
  plotlyTraceColors: Array<string> = [
    '#1f77b4',  // muted blue
    '#ff7f0e',  // safety orange
    '#2ca02c',  // cooked asparagus green
    // '#d62728',  // brick red
    '#9467bd',  // muted purple
    '#8c564b',  // chestnut brown
    '#e377c2',  // raspberry yogurt pink
    '#7f7f7f',  // middle gray
    '#bcbd22',  // curry yellow-green
    '#17becf'   // blue-teal
  ];

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private convertUnitsService: ConvertUnitsService,
    private endUsesService: EndUsesService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    // this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes[0];
    // set default from setup
    this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => dayType.dayTypeId === this.compressedAirAssessment.endUseData.endUseDayTypeSetup.selectedDayTypeId);
    this.dayTypeBaselineResults = this.endUsesService.getBaselineResults(this.compressedAirAssessment, this.settings);
    if (this.settings.unitsOfMeasure == 'Imperial') {
      this.units = 'acfm';
    } else {
      this.units = 'm<sup>3</sup>/min';
    }
  }

  ngAfterViewInit() {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      this.compressedAirAssessment = compressedAirAssessment;
      if (compressedAirAssessment.endUseData.endUses.length > 0) {
        this.dayTypeBaselineResults = this.endUsesService.getBaselineResults(this.compressedAirAssessment, this.settings);
        this.setChartData();
      }
    });
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
  }

  renderPieChart(endUseEnergyData: Array<EndUseEnergyData>) {
    let dayTypeAverage: string = `Day Type Average (${this.units}): ${this.selectedDayTypeAverage}`
    //   dayTypeAverage = `${this.selectedDayType.name} Day Type Average: ${this.selectedDayTypeAverage} (${this.units})`
    //   dayTypeAverage = `All Day Type Average: ${this.selectedDayTypeAverage} (${this.units})`

    if (endUseEnergyData.length === 0) {
      this.dayTypeEndUseWarning = "No end uses with selected day type";
    } else {
      this.dayTypeEndUseWarning = undefined;
    }

    let values: Array<number> = endUseEnergyData.map(val => val.dayTypeAverageAirflowPercent);
    let labels: Array<string> = endUseEnergyData.map(val => val.endUseName);
    let text: Array<number> = endUseEnergyData.map(val => val.dayTypeAverageAirFlow);
    // let colors: Array<string> = endUseEnergyData.map(val => val.color);
    let colors: Array<string> = this.setChartColors(endUseEnergyData);

    let width: Array<number> = endUseEnergyData.map(val => 2);

    if (this.compressedAirAssessment.endUseData.dayTypeAirFlowTotals.unaccountedAirflow > 0) {
      values.push(this.compressedAirAssessment.endUseData.dayTypeAirFlowTotals.unaccountedAirflowPercent);
      labels.push('Unaccounted Airflow');
      text.push(this.compressedAirAssessment.endUseData.dayTypeAirFlowTotals.unaccountedAirflow);
      colors.push('rgb(211,211,211)');
      width.push(2);
    }

    let data = [{
      values: values,
      labels: labels,
      text: text,
      marker: {
        colors: colors,
        line: {
          width: width,
          color: '#fff'
        }
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      textinfo: 'label+value',
      // texttemplate: '%{label}<br>%{text:.0f}',
      texttemplate: '%{label}<br>%{text:.0f} ' + this.units,
      hovertemplate: '%{label} <br> %{value:.3r}% <extra></extra>',
      sort: false,
      automargin: true
    }];


    let layout = {
      title: {
        // text: `${this.selectedDayType.name} End Use Average Capacity (${this.units})`
        text: dayTypeAverage
      },
      showlegend: false,
      font: {
        size: 12,
      },
    };

    let configOptions = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    this.plotlyService.newPlot(this.overviewPieChart.nativeElement, data, layout, configOptions);
  }

  getChunkedArray(array, size) {
    let chunked = [];
    let index = 0;
    while (index < array.length) {
      chunked.push(array.slice(index, size + index));
      index += size;
    }
    return chunked;
  }

  setChartColors(endUseEnergyData: Array<EndUseEnergyData>) {
    let colors: Array<string> = [];
    let leakRateColor: string = 'red'
    let chunkedEnergyData: Array<Array<EndUseEnergyData>> = this.getChunkedArray(endUseEnergyData, 10);
    chunkedEnergyData.forEach((chunk: Array<EndUseEnergyData>) => {
      chunk.forEach((data, i) => {
        if (data.endUseId !== 'dayTypeLeakRate') {
          colors.push(this.plotlyTraceColors[i]);
        } else {
          colors.push(leakRateColor);
        }
      })
    })
    return colors;
  }

  setSelectedDayTypeAverage(selectedDayType: CompressedAirDayType) {
    if (this.dayTypeBaselineResults) {
      if (!selectedDayType) {
        let dayTypeSummedAirflows: number = this.dayTypeBaselineResults.dayTypeResults.reduce((summedAirFlows, result) => summedAirFlows + result.averageAirFlow, 0);
        // needs to be weighted?
        this.selectedDayTypeAverage = this.convertUnitsService.roundVal(dayTypeSummedAirflows, 0);
      } else {
        let selectedDayTypeResults = this.dayTypeBaselineResults.dayTypeResults.find(result => result.dayTypeId === selectedDayType.dayTypeId);
        this.selectedDayTypeAverage = this.convertUnitsService.roundVal(selectedDayTypeResults.averageAirFlow, 0);
      }
    }
  }

  setChartData() {
    let selectedDayTypeId: string;
    // TODO bandaid
    selectedDayTypeId = this.selectedDayType.dayTypeId
    this.compressedAirAssessment.endUseData.dayTypeAirFlowTotals = this.endUsesService.getDayTypeAirflowTotals(this.compressedAirAssessment, this.selectedDayType.dayTypeId, this.settings);

    this.setSelectedDayTypeAverage(this.selectedDayType);
    let endUseEnergyData: Array<EndUseEnergyData> = this.endUsesService.getEndUseEnergyData(this.compressedAirAssessment, selectedDayTypeId, this.dayTypeBaselineResults);
    this.renderPieChart(endUseEnergyData);
  }
}
