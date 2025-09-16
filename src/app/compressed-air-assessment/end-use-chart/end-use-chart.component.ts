import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { CompressedAirAssessment, CompressedAirDayType, EndUseDayTypeSetup } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { BaselineResults, DayTypeProfileSummary } from '../compressed-air-assessment-results.service';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { DayTypeSetupService } from '../end-uses/day-type-setup-form/day-type-setup.service';
import { EndUseEnergy, EndUseEnergyData, EndUsesService } from '../end-uses/end-uses.service';

@Component({
    selector: 'app-end-use-chart',
    templateUrl: './end-use-chart.component.html',
    styleUrls: ['./end-use-chart.component.css'],
    standalone: false
})
export class EndUseChartComponent implements OnInit {
  @ViewChild('overviewPieChart', { static: false }) overviewPieChart: ElementRef;
  settings: Settings;
  airflowUnits: string = 'acfm';
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

  endUseDayTypeSetup: EndUseDayTypeSetup;
  hasValidDayTypeSetup: boolean;
  showChart: boolean = true;
  dayTypeSetupServiceSubscription: Subscription;
  chartTitle: string;
  hasInvalidEndUsesWarning: string;

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private convertUnitsService: ConvertUnitsService,
    private endUsesService: EndUsesService,
    private cd: ChangeDetectorRef,
    private dayTypeSetupService: DayTypeSetupService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.endUseDayTypeSetup = this.dayTypeSetupService.endUseDayTypeSetup.getValue();
    if (!this.endUseDayTypeSetup.selectedDayTypeId) {
      // set default from setup
      this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes[0];
    } else {
      this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => dayType.dayTypeId === this.endUseDayTypeSetup.selectedDayTypeId);
    }
    this.dayTypeBaselineResults = this.endUsesService.getBaselineResults(this.compressedAirAssessment, this.settings);
    if (this.settings.unitsOfMeasure !== 'Imperial') {
      this.airflowUnits = 'm<sup>3</sup>/min';
    }
  }

  ngOnDestroy() {
    this.compressedAirAssessmentSub.unsubscribe();
    this.dayTypeSetupServiceSubscription.unsubscribe();
  }


  ngAfterViewInit() {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(compressedAirAssessment => {
      this.compressedAirAssessment = compressedAirAssessment;
      this.dayTypeBaselineResults = this.endUsesService.getBaselineResults(this.compressedAirAssessment, this.settings);
      this.showChart = true;
      this.setChartData();
    });
    this.dayTypeSetupServiceSubscription = this.dayTypeSetupService.endUseDayTypeSetup.subscribe(endUseDayTypeSetup => {
      if (endUseDayTypeSetup) {
        this.endUseDayTypeSetup = endUseDayTypeSetup;
        this.setChartData();
      }
    });
  }

  setChartData() {
    this.hasInvalidEndUsesWarning = undefined;
    if (this.compressedAirAssessment.endUseData.endUses.length > 0) {
      this.showChart = true;
      this.compressedAirAssessment.endUseData.dayTypeAirFlowTotals = this.endUsesService.getDayTypeAirflowTotals(this.compressedAirAssessment, this.selectedDayType.dayTypeId, this.settings);
      let endUseEnergy: EndUseEnergy = this.endUsesService.getEndUseEnergyData(this.compressedAirAssessment, this.endUseDayTypeSetup, this.dayTypeBaselineResults);
      let endUseEnergyData: Array<EndUseEnergyData> = endUseEnergy.endUseEnergyData;
      let otherEndUseData: EndUseEnergyData;
      if (endUseEnergy.hasValidEndUses) {
        if (endUseEnergyData.length > 10) {
          let endUseEnergyDataCopy: Array<EndUseEnergyData> = JSON.parse(JSON.stringify(endUseEnergyData));
          endUseEnergyData = endUseEnergyData.slice(0, 10);
          otherEndUseData = endUseEnergyDataCopy.slice(10, endUseEnergyDataCopy.length).reduce((totalOtherEnergyData, data) => {
            let thing = {
              dayTypeAverageAirFlow: totalOtherEnergyData.dayTypeAverageAirFlow += data.dayTypeAverageAirFlow,
              dayTypeAverageAirflowPercent: totalOtherEnergyData.dayTypeAverageAirflowPercent += data.dayTypeAverageAirflowPercent,
              endUseName: totalOtherEnergyData.endUseName,
              endUseId: totalOtherEnergyData.endUseId,
              color: undefined,
            };
            return thing;
          }, {
            dayTypeAverageAirFlow: 0,
            dayTypeAverageAirflowPercent: 0,
            endUseName: 'Other End Use Energy',
            endUseId: Math.random().toString(36).substr(2, 9),
            color: undefined,
          });
        }
      } else {
        this.showChart = false;
      }
      this.renderPieChart(endUseEnergyData, otherEndUseData);
    } else {
      this.showChart = false;
    }
    this.cd.detectChanges();
  }

  renderPieChart(endUseEnergyData: Array<EndUseEnergyData>, otherEndUseData: EndUseEnergyData) {
    let selectedDayTypeAverage: number = 0;
    this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => dayType.dayTypeId === this.endUseDayTypeSetup.selectedDayTypeId);
    if (this.dayTypeBaselineResults) {
      let selectedDayTypeResults = this.dayTypeBaselineResults.dayTypeResults.find(result => result.dayTypeId === this.selectedDayType.dayTypeId);
      selectedDayTypeAverage = this.convertUnitsService.roundVal(selectedDayTypeResults.averageAirFlow, 1);
    }

    this.chartTitle = `${this.selectedDayType.name} Average Airflow: ${selectedDayTypeAverage} ${this.airflowUnits}`;
    if (endUseEnergyData.length === 0) {
      this.dayTypeEndUseWarning = "There are no valid End Uses with selected Day Type";
    } else {
      this.dayTypeEndUseWarning = undefined;
    }

    let data = [];

    if (!this.compressedAirAssessment.endUseData.dayTypeAirFlowTotals.exceededAirflow) {
      let values: Array<number> = endUseEnergyData.map(val => val.dayTypeAverageAirflowPercent);
      let labels: Array<string> = endUseEnergyData.map(val => val.endUseName);
      let text: Array<number> = endUseEnergyData.map(val => val.dayTypeAverageAirFlow);
      let colors: Array<string> = this.setChartColors(endUseEnergyData);
      let width: Array<number> = endUseEnergyData.map(val => 2);
      
      if (otherEndUseData) {
        values.push(otherEndUseData.dayTypeAverageAirflowPercent);
        labels.push('Other End Use Airflow');
        text.push(otherEndUseData.dayTypeAverageAirFlow);
        colors.push(undefined);
        width.push(2);
      }

      if (this.compressedAirAssessment.endUseData.dayTypeAirFlowTotals.unaccountedAirflow > 0) {
        values.push(this.compressedAirAssessment.endUseData.dayTypeAirFlowTotals.unaccountedAirflowPercent);
        labels.push('Unaccounted Airflow');
        text.push(this.compressedAirAssessment.endUseData.dayTypeAirFlowTotals.unaccountedAirflow);
        colors.push('rgb(211,211,211)');
        width.push(2);
      }


      data = [{
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
        texttemplate: '%{label}<br>%{text:.0f} ' + this.airflowUnits,
        hovertemplate: '%{label} <br> %{value:.3r}% <extra></extra>',
        sort: false,
        automargin: true
      }];
    } else {
      this.showChart = false;
    }


    let layout = {
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

}
