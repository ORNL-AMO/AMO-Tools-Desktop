import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { CompressedAirAssessment, CompressedAirDayType, Modification } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentModificationResults } from '../../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { BaselineResults, DayTypeModificationResult } from '../../../calculations/caCalculationModels';
import { CompressedAirModificationValid } from '../../../compressed-air-assessment-validation/CompressedAirAssessmentValidation';

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

      let flowReallocationX = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).flowReallocationResults.savings.savings.power });
      flowReallocationX.unshift(0);
      trace = this.getTrace(flowReallocationX, y, 'Flow Reallocation');
      traceData.push(trace);

      if (this.assessmentResults.some(result => { return result.modification.reduceAirLeaks.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).reduceAirLeaksResults.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Reduce Air Leaks');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.improveEndUseEfficiency.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).improveEndUseEfficiencyResults.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Improve End Use Efficiency');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.reduceSystemAirPressure.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).reduceSystemAirPressureResults.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Reduce System Air Pressure');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.adjustCascadingSetPoints.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).adjustCascadingSetPointsResults.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Adjust Cascading Set Points');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.useAutomaticSequencer.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).useAutomaticSequencerResults.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Use Automatic Sequencer');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.reduceRuntime.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).reduceRunTimeResults.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Reduce Runtime');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.addPrimaryReceiverVolume.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).addPrimaryReceiverVolumeResults.savings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Add Primary Receiver Volume');
        traceData.push(trace);
      }
      if (this.assessmentResults.some(result => { return result.modification.replaceCompressor.order != 100 })) {
        let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).replaceCompressorResults.savings.savings.power });
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
      this.plotlyService.newPlot(this.modificationGraph.nativeElement, traceData, layout, config);
    }
  }

  drawCombinedDayTypeModificationGraph() {
    if (this.assessmentResults && this.combinedDayTypeResults && this.combinedDayTypeResults.length != 0 && this.modificationGraph) {
      let y: Array<string> = this.combinedDayTypeResults.map(result => {
        return result.modification.name
      });
      y.unshift('Baseline');

      let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.allSavingsResults.adjustedResults.power });
      xValue.unshift(this.assessmentResults[0].totalBaselinePower);
      let traceData = [];
      let text = xValue.map(v => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v) + ' kWh');
      let trace = this.getTrace(xValue, y, 'Adjusted Annual Energy', text);
      traceData.push(trace);

      let flowReallocationX = this.combinedDayTypeResults.map(result => { return result.combinedResults.flowReallocationSavings.savings.power });
      flowReallocationX.unshift(0);
      trace = this.getTrace(flowReallocationX, y, 'Flow Reallocation');
      traceData.push(trace);
      if (this.combinedDayTypeResults.some(result => { return result.modification.reduceAirLeaks.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.reduceAirLeaksSavings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Reduce Air Leaks');
        traceData.push(trace);
      }
      if (this.combinedDayTypeResults.some(result => { return result.modification.improveEndUseEfficiency.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.improveEndUseEfficiencySavings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Improve End Use Efficiency');
        traceData.push(trace);
      }
      if (this.combinedDayTypeResults.some(result => { return result.modification.reduceSystemAirPressure.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.reduceSystemAirPressureSavings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Reduce System Air Pressure');
        traceData.push(trace);
      }
      if (this.combinedDayTypeResults.some(result => { return result.modification.adjustCascadingSetPoints.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.adjustCascadingSetPointsSavings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Adjust Cascading Set Points');
        traceData.push(trace);
      }
      if (this.combinedDayTypeResults.some(result => { return result.modification.useAutomaticSequencer.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.useAutomaticSequencerSavings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Use Automatic Sequencer');
        traceData.push(trace);
      }
      if (this.combinedDayTypeResults.some(result => { return result.modification.reduceRuntime.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.reduceRunTimeSavings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Reduce Runtime');
        traceData.push(trace);
      }
      if (this.combinedDayTypeResults.some(result => { return result.modification.addPrimaryReceiverVolume.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.addReceiverVolumeSavings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Add Primary Receiver Volume');
        traceData.push(trace);
      }

      if (this.combinedDayTypeResults.some(result => { return result.modification.replaceCompressor.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.replaceCompressorsSavings.savings.power });
        xValue.unshift(0);
        let trace = this.getTrace(xValue, y, 'Replace Compressors');
        traceData.push(trace);
      }

      var layout = {
        showlegend: true,
        barmode: 'stack',
        title: {
          text: "Adjust Annual Energy Usage by Modification <br> All Day Types Combined",
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
      this.plotlyService.newPlot(this.modificationGraph.nativeElement, traceData, layout, config);
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
