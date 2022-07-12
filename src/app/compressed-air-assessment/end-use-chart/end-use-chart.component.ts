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

  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private convertUnitsService: ConvertUnitsService,
    private endUsesService: EndUsesService,
    private plotlyService: PlotlyService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.compressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes[0];
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
      if (compressedAirAssessment.endUses.length > 0) {
        this.dayTypeBaselineResults = this.endUsesService.getBaselineResults(this.compressedAirAssessment, this.settings);
        this.setSelectedDayTypeAverage(this.selectedDayType);
        let endUseEnergyData: Array<EndUseEnergyData> = this.endUsesService.getEndUseEnergyData(compressedAirAssessment, this.selectedDayType.dayTypeId, this.dayTypeBaselineResults);
        this.renderPieChart(endUseEnergyData);
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

    let data = [{
      values: endUseEnergyData.map(val => val.dayTypeAverageAirflowPercent),
      labels: endUseEnergyData.map(val => val.endUseName),
      text: endUseEnergyData.map(val => val.dayTypeAverageAirFlow),
      marker: {
        colors: endUseEnergyData.map(val => { return 'rgb(' + val.color + ')' }),
        line: {
          width: endUseEnergyData.map(val => { return 2 }),
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
    this.setSelectedDayTypeAverage(this.selectedDayType);
    let endUseEnergyData: Array<EndUseEnergyData> = this.endUsesService.getEndUseEnergyData(this.compressedAirAssessment, this.selectedDayType.dayTypeId, this.dayTypeBaselineResults);
    this.renderPieChart(endUseEnergyData);
  }
}
