import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { CompressedAirAssessment, CompressedAirDayType, Modification } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentModificationResults } from '../../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { BaselineResults, DayTypeModificationResult } from '../../../calculations/caCalculationModels';
import { CompressedAirModificationValid } from '../../../compressed-air-assessment-validation/CompressedAirAssessmentValidation';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-compressed-air-airflow-savings-graph',
  templateUrl: './compressed-air-airflow-savings-graph.component.html',
  styleUrl: './compressed-air-airflow-savings-graph.component.css',
  standalone: false
})
export class CompressedAirAirflowSavingsGraphComponent {
  @Input({ required: true })
  assessmentResults: Array<CompressedAirAssessmentModificationResults>;
  // @Input({ required: true })
  // combinedDayTypeResults: Array<{ modification: Modification, combinedResults: DayTypeModificationResult, validation: CompressedAirModificationValid }>;
  @Input({ required: true })
  compressedAirAssessment: CompressedAirAssessment;
  @Input()
  dayTypeId: string;
  @Input()
  baselineResults: BaselineResults;
  @Input()
  settings: Settings;

  @ViewChild("modificationGraph", { static: false }) modificationGraph: ElementRef;
  constructor(private plotlyService: PlotlyService) { }

  ngAfterViewInit() {
    this.drawModificationGraph();
  }

  drawModificationGraph() {
    // if (!this.dayTypeId) {
    //   this.drawCombinedDayTypeModificationGraph();
    // } else {
    this.drawDayTypeModificationGraph();
    // }
  }

  drawDayTypeModificationGraph() {
    if (this.assessmentResults && this.baselineResults && this.dayTypeId && this.modificationGraph) {
      let dayType: CompressedAirDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => { return dayType.dayTypeId === this.dayTypeId });

      let y: Array<string> = this.assessmentResults.map(result => {
        return result.modification.name
      });
      y.unshift('Baseline');

      let baselineDayTypeResult = this.baselineResults.dayTypeResults.find(result => { return result.dayTypeId === this.dayTypeId });
      let xValue = new Array();
      this.assessmentResults.forEach(result => {
        let dayTypeResult = result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId });
        xValue.push(dayTypeResult.averageAirFlow);
      });
      xValue.unshift(baselineDayTypeResult.averageAirFlow);
      let traceData = [];
      let text = xValue.map(v => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v) + ' ' + this.getUnits());
      let trace = this.getTrace(xValue, y, 'Adjusted Average Air Flow', text);
      traceData.push(trace);

      // let flowReallocationX = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).flowReallocationResults.savings.savings.cost });
      // flowReallocationX.unshift(0);
      // trace = this.getTrace(flowReallocationX, y, 'Flow Reallocation');
      // traceData.push(trace);

      // if (this.assessmentResults.some(result => { return result.modification.reduceAirLeaks.order != 100 })) {
      //   let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).reduceAirLeaksResults?.savings.savings.cost });
      //   xValue.unshift(0);
      //   let trace = this.getTrace(xValue, y, 'Reduce Air Leaks');
      //   traceData.push(trace);
      // }
      // if (this.assessmentResults.some(result => { return result.modification.improveEndUseEfficiency.order != 100 })) {
      //   let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).improveEndUseEfficiencyResults?.savings.savings.cost });
      //   xValue.unshift(0);
      //   let trace = this.getTrace(xValue, y, 'Improve End Use Efficiency');
      //   traceData.push(trace);
      // }
      // if (this.assessmentResults.some(result => { return result.modification.reduceSystemAirPressure.order != 100 })) {
      //   let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).reduceSystemAirPressureResults?.savings.savings.cost });
      //   xValue.unshift(0);
      //   let trace = this.getTrace(xValue, y, 'Reduce System Air Pressure');
      //   traceData.push(trace);
      // }
      // if (this.assessmentResults.some(result => { return result.modification.adjustCascadingSetPoints.order != 100 })) {
      //   let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).adjustCascadingSetPointsResults?.savings.savings.cost });
      //   xValue.unshift(0);
      //   let trace = this.getTrace(xValue, y, 'Adjust Cascading Set Points');
      //   traceData.push(trace);
      // }
      // if (this.assessmentResults.some(result => { return result.modification.useAutomaticSequencer.order != 100 })) {
      //   let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).useAutomaticSequencerResults?.savings.savings.cost });
      //   xValue.unshift(0);
      //   let trace = this.getTrace(xValue, y, 'Use Automatic Sequencer');
      //   traceData.push(trace);
      // }
      // if (this.assessmentResults.some(result => { return result.modification.reduceRuntime.order != 100 })) {
      //   let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).reduceRunTimeResults?.savings.savings.cost });
      //   xValue.unshift(0);
      //   let trace = this.getTrace(xValue, y, 'Reduce Runtime');
      //   traceData.push(trace);
      // }
      // if (this.assessmentResults.some(result => { return result.modification.addPrimaryReceiverVolume.order != 100 })) {
      //   let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).addPrimaryReceiverVolumeResults?.savings.savings.cost });
      //   xValue.unshift(0);
      //   let trace = this.getTrace(xValue, y, 'Add Primary Receiver Volume');
      //   traceData.push(trace);
      // }
      // if (this.assessmentResults.some(result => { return result.modification.replaceCompressor.order != 100 })) {
      //   let xValue = this.assessmentResults.map(result => { return result.modifiedDayTypeProfileSummaries.find(dayTypeResult => { return dayTypeResult.dayType.dayTypeId === this.dayTypeId }).replaceCompressorResults?.savings.savings.cost });
      //   xValue.unshift(0);
      //   let trace = this.getTrace(xValue, y, 'Replace Compressors');
      //   traceData.push(trace);
      // }
      var layout = {
        showlegend: true,
        barmode: 'stack',
        title: {
          text: `Adjust Average Air Flow by Modification <br> ${dayType.name}`,
        },
        yaxis: {
          autotick: false,
          automargin: true,
        },
        xaxis: {
          tickprefix: '',
          tickformat: '~s',
          hoverformat: '~s',
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

  // drawCombinedDayTypeModificationGraph() {
  //   if (this.assessmentResults && this.combinedDayTypeResults && this.combinedDayTypeResults.length != 0 && this.modificationGraph) {
  //     let y: Array<string> = this.combinedDayTypeResults.map(result => {
  //       return result.modification.name
  //     });
  //     y.unshift('Baseline');

  //     let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.allSavingsResults.adjustedResults.cost });
  //     xValue.unshift(this.assessmentResults[0].totalBaselineCost);
  //     let traceData = [];
  //     let text = xValue.map(v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v));
  //     let trace = this.getTrace(xValue, y, 'Adjusted Annual Cost', text);
  //     traceData.push(trace);

  //     let flowReallocationX = this.combinedDayTypeResults.map(result => { return result.combinedResults.flowReallocationSavings.savings.cost });
  //     flowReallocationX.unshift(0);
  //     trace = this.getTrace(flowReallocationX, y, 'Flow Reallocation');
  //     traceData.push(trace);
  //     if (this.combinedDayTypeResults.some(result => { return result.modification.reduceAirLeaks.order != 100 })) {
  //       let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.reduceAirLeaksSavings.savings.cost });
  //       xValue.unshift(0);
  //       let trace = this.getTrace(xValue, y, 'Reduce Air Leaks');
  //       traceData.push(trace);
  //     }
  //     if (this.combinedDayTypeResults.some(result => { return result.modification.improveEndUseEfficiency.order != 100 })) {
  //       let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.improveEndUseEfficiencySavings.savings.cost });
  //       xValue.unshift(0);
  //       let trace = this.getTrace(xValue, y, 'Improve End Use Efficiency');
  //       traceData.push(trace);
  //     }
  //     if (this.combinedDayTypeResults.some(result => { return result.modification.reduceSystemAirPressure.order != 100 })) {
  //       let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.reduceSystemAirPressureSavings.savings.cost });
  //       xValue.unshift(0);
  //       let trace = this.getTrace(xValue, y, 'Reduce System Air Pressure');
  //       traceData.push(trace);
  //     }
  //     if (this.combinedDayTypeResults.some(result => { return result.modification.adjustCascadingSetPoints.order != 100 })) {
  //       let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.adjustCascadingSetPointsSavings.savings.cost });
  //       xValue.unshift(0);
  //       let trace = this.getTrace(xValue, y, 'Adjust Cascading Set Points');
  //       traceData.push(trace);
  //     }
  //     if (this.combinedDayTypeResults.some(result => { return result.modification.useAutomaticSequencer.order != 100 })) {
  //       let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.useAutomaticSequencerSavings.savings.cost });
  //       xValue.unshift(0);
  //       let trace = this.getTrace(xValue, y, 'Use Automatic Sequencer');
  //       traceData.push(trace);
  //     }
  //     if (this.combinedDayTypeResults.some(result => { return result.modification.reduceRuntime.order != 100 })) {
  //       let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.reduceRunTimeSavings.savings.cost });
  //       xValue.unshift(0);
  //       let trace = this.getTrace(xValue, y, 'Reduce Runtime');
  //       traceData.push(trace);
  //     }
  //     if (this.combinedDayTypeResults.some(result => { return result.modification.addPrimaryReceiverVolume.order != 100 })) {
  //       let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.addReceiverVolumeSavings.savings.cost });
  //       xValue.unshift(0);
  //       let trace = this.getTrace(xValue, y, 'Add Primary Receiver Volume');
  //       traceData.push(trace);
  //     }

  //     if (this.combinedDayTypeResults.some(result => { return result.modification.replaceCompressor.order != 100 })) {
  //       let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.replaceCompressorsSavings.savings.cost });
  //       xValue.unshift(0);
  //       let trace = this.getTrace(xValue, y, 'Replace Compressors');
  //       traceData.push(trace);
  //     }

  //     var layout = {
  //       showlegend: true,
  //       barmode: 'stack',
  //       title: {
  //         text: "Adjust Annual Cost by Modification <br> All Day Types Combined",
  //       },
  //       yaxis: {
  //         autotick: false,
  //         automargin: true,
  //       },
  //       xaxis: {
  //         tickprefix: '',
  //         tickformat: '$~s',
  //         hoverformat: '$~s',
  //       },
  //       margin: {},
  //       legend: {
  //         orientation: 'h',
  //       },
  //       hovermode: 'y unified'
  //     }
  //     var config = {
  //       responsive: true,
  //       displaylogo: false
  //     };
  //     this.plotlyService.newPlot(this.modificationGraph.nativeElement, traceData, layout, config);
  //   }
  // }

  getTrace(xValue: Array<number>, y: Array<string>, name: string, text?: Array<string>) {
    return {
      x: xValue,
      y: y,
      type: 'bar',
      orientation: 'h',
      name: name,
      hovertemplate: name + ': $%{x:,.0f}<extra></extra> ' + this.getUnits(),
      text: text,
      textposition: 'auto',
      marker: {
        line: {
          width: 3
        }
      },
    }
  }

  getUnits(): string{
    if(this.settings.unitsOfMeasure == 'Imperial'){
      return 'acfm';
    } else {
      //
      return 'm<sup>3</sup>/min';
    }
  }
}
