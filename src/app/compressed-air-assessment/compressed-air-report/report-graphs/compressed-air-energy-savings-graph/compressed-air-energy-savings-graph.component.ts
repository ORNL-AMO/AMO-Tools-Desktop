import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { CompressedAirAssessment, CompressedAirDayType, Modification } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentModificationResults } from '../../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { BaselineResults, DayTypeModificationResult } from '../../../calculations/caCalculationModels';
import { CompressedAirModificationValid } from '../../../compressed-air-assessment-validation/CompressedAirAssessmentValidation';
import { defaultPlotlyConfig } from '../../../../shared/helperFunctions';
import { CompressedAirChartsService } from '../../../services/compressed-air-charts.service';
@Component({
  selector: 'app-compressed-air-energy-savings-graph',
  templateUrl: './compressed-air-energy-savings-graph.component.html',
  styleUrl: './compressed-air-energy-savings-graph.component.css',
  standalone: false
})
export class CompressedAirEnergySavingsGraphComponent {
  @Input({ required: true })
  assessmentResults: Array<CompressedAirAssessmentModificationResults>;
  @Input({ required: true })
  combinedDayTypeResults: Array<{ modification: Modification, combinedResults: DayTypeModificationResult, validation: CompressedAirModificationValid }>;
  @Input({ required: true })
  compressedAirAssessment: CompressedAirAssessment;
  @Input()
  dayTypeId: string;
  @Input()
  baselineResults: BaselineResults;

  @ViewChild("modificationGraph", { static: false }) modificationGraph: ElementRef;
  private readonly compressedAirChartsService = inject(CompressedAirChartsService);

  constructor(private plotlyService: PlotlyService) { }

  ngAfterViewInit() {
    this.drawModificationGraph();
  }

  drawModificationGraph() {
    if (!this.dayTypeId) {
      this.drawCombinedDayTypeModificationGraph();
    } else {
      this.drawDayTypeModificationGraph();
    }
  }

  drawDayTypeModificationGraph() {
    if (this.assessmentResults && this.combinedDayTypeResults && this.combinedDayTypeResults.length != 0 && this.modificationGraph) {
      let dayType: CompressedAirDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId === this.dayTypeId });

      let y: Array<string> = this.assessmentResults.map(result => {
        return result.modification.name
      });
      y.unshift('Baseline');

      let baselineDayTypeResult = this.baselineResults.dayTypeResults.find(result => { return result.dayTypeId === this.dayTypeId });
      let xValue = new Array();
      this.assessmentResults.forEach(result => {
        let dayTypeResult = result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId });
        xValue.push(dayTypeResult.modificationSavings.adjustedResults.power);
      });
      xValue.unshift(baselineDayTypeResult.energyUse);
      let traceData = [];
      let text = xValue.map(v => {return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v) + ' kWh'});
      let trace = this.getTrace(xValue, y, 'Adjusted Annual Energy Use', text);
      traceData.push(trace);

      let flowReallocationX = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).flowReallocationResults?.savings.savings.power });
      flowReallocationX.unshift(0);
      trace = this.getTrace(flowReallocationX, y, 'Flow Reallocation');
      traceData.push(trace);

      if (this.assessmentResults.some(result => { return result.modification.reduceAirLeaks.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).reduceAirLeaksResults?.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Reduce Air Leaks');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.improveEndUseEfficiency.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).improveEndUseEfficiencyResults?.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Improve End Use Efficiency');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.reduceSystemAirPressure.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).reduceSystemAirPressureResults?.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Reduce System Air Pressure');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.adjustCascadingSetPoints.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).adjustCascadingSetPointsResults?.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Adjust Cascading Set Points');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.useAutomaticSequencer.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).useAutomaticSequencerResults?.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Use Automatic Sequencer');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.reduceRuntime.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).reduceRunTimeResults?.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Reduce Runtime');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.addPrimaryReceiverVolume.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).addPrimaryReceiverVolumeResults?.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Add Primary Receiver Volume');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.replaceCompressor.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).replaceCompressorResults?.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Replace Compressors');
        traceData.push(trace);
      }
      var layout = {
        showlegend: true,
        barmode: 'stack',
        title: {
          text: `Adjust Annual Energy Usage by Modification <br> ${dayType.name}`,
        },
        yaxis: {
          autotick: false,
          automargin: true,
        },
        xaxis: {
          tickprefix: '',
          tickformat: '~s',
          hoverformat: '~s',
          ticksuffix: ' kWh',
        },
        margin: {},
        legend: {
          orientation: 'h',
        },
        hovermode: 'y unified'
      }
      var config = {
        responsive: true,
        displaylogo: false
      };
      this.plotlyService.newPlot(this.modificationGraph.nativeElement, traceData, layout, defaultPlotlyConfig(config, traceData));
    }
  }

  drawCombinedDayTypeModificationGraph() {
    if (this.assessmentResults && this.combinedDayTypeResults && this.combinedDayTypeResults.length != 0 && this.modificationGraph) {
      const chart = this.compressedAirChartsService.buildEnergySavingsChart(this.assessmentResults, this.combinedDayTypeResults);
      var config = {
        responsive: true,
        displaylogo: false
      };
      this.plotlyService.newPlot(this.modificationGraph.nativeElement, chart.traces, chart.layout, defaultPlotlyConfig(config, chart.traces));
    }
  }

  getTrace(xValue: Array<number>, y: Array<string>, name: string, text?: Array<string>) {
    return {
      x: xValue,
      y: y,
      type: 'bar',
      orientation: 'h',
      name: name,
      hovertemplate: name + ': %{x:,.0f} kWh<extra></extra>',
      text: text,
      textposition: 'auto',
      marker: {
        line: {
          width: 3
        }
      },
    }
  }

}
