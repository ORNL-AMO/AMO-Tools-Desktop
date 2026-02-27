import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { CompressedAirAssessment, Modification } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentModificationResults } from '../../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { DayTypeModificationResult } from '../../../calculations/caCalculationModels';
import { CompressedAirModificationValid } from '../../../compressed-air-assessment-validation/CompressedAirAssessmentValidation';
import * as Plotly from 'plotly.js-dist';

@Component({
  selector: 'app-compressed-air-cost-savings-graph',
  templateUrl: './compressed-air-cost-savings-graph.component.html',
  styleUrl: './compressed-air-cost-savings-graph.component.css',
  standalone: false
})
export class CompressedAirCostSavingsGraphComponent {
  @Input({ required: true })
  assessmentResults: Array<CompressedAirAssessmentModificationResults>;
  @Input({ required: true })
  combinedDayTypeResults: Array<{ modification: Modification, combinedResults: DayTypeModificationResult, validation: CompressedAirModificationValid }>;
  @Input({ required: true })
  compressedAirAssessment: CompressedAirAssessment;

  @ViewChild("modificationGraph", { static: false }) modificationGraph: ElementRef;
  constructor(private plotlyService: PlotlyService) { }

  ngAfterViewInit() {
    this.drawModificationGraph();
  }

  drawModificationGraph() {
    console.log('drawing cost savings graph');
    if (this.assessmentResults && this.combinedDayTypeResults && this.combinedDayTypeResults.length != 0 && this.modificationGraph) {
      let y: Array<string> = this.combinedDayTypeResults.map(result => {
        return result.modification.name
      });
      y.unshift('Baseline');

      let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.allSavingsResults.adjustedResults.cost });
      xValue.unshift(this.assessmentResults[0].totalBaselineCost);
      let traceData = [];
      traceData.push({
        x: xValue,
        y: y,
        type: 'bar',
        orientation: 'h',
        name: 'Adjusted Annual Cost',
        hoverinfo: "name+x",
        text: xValue.map(v => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)), textposition: 'auto',
        marker: {
          line: {
            width: 3
          }
        },
      })

      let flowReallocationX = this.combinedDayTypeResults.map(result => { return result.combinedResults.flowReallocationSavings.savings.cost });
      flowReallocationX.unshift(0);
      let trace = {
        x: flowReallocationX,
        y: y,
        type: 'bar',
        orientation: 'h',
        name: 'Flow Reallocation',
        hovertemplate: 'Flow Reallocation: $%{x:~s}<extra></extra>',
        marker: {
          line: {
            width: 3
          }
        },
      }
      traceData.push(trace);
      if (this.combinedDayTypeResults.some(result => { return result.modification.reduceAirLeaks.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.reduceAirLeaksSavings.savings.cost });
        xValue.unshift(0);
        let trace = {
          x: xValue,
          y: y,
          type: 'bar',
          orientation: 'h',
          name: 'Reduce Air Leaks',
          hovertemplate: 'Reduce Air Leaks: $%{x:~s}<extra></extra>',
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }
      if (this.combinedDayTypeResults.some(result => { return result.modification.improveEndUseEfficiency.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.improveEndUseEfficiencySavings.savings.cost });
        xValue.unshift(0);
        let trace = {
          x: xValue,
          y: y,
          type: 'bar',
          orientation: 'h',
          name: 'Improve End Use Efficiency',
          hovertemplate: 'Improve End Use Efficiency: $%{x:~s}<extra></extra>',
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }
      if (this.combinedDayTypeResults.some(result => { return result.modification.reduceSystemAirPressure.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.reduceSystemAirPressureSavings.savings.cost });
        xValue.unshift(0);
        let trace = {
          x: xValue,
          y: y,
          type: 'bar',
          orientation: 'h',
          name: 'Reduce System Air Pressure',
          hovertemplate: 'Reduce System Air Pressure: $%{x:~s}<extra></extra>',
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }
      if (this.combinedDayTypeResults.some(result => { return result.modification.adjustCascadingSetPoints.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.adjustCascadingSetPointsSavings.savings.cost });
        xValue.unshift(0);
        let trace = {
          x: xValue,
          y: y,
          type: 'bar',
          orientation: 'h',
          name: 'Adjust Cascading Set Points',
          hovertemplate: 'Adjust Cascading Set Points: $%{x:~s}<extra></extra>',
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }
      if (this.combinedDayTypeResults.some(result => { return result.modification.useAutomaticSequencer.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.useAutomaticSequencerSavings.savings.cost });
        xValue.unshift(0);
        let trace = {
          x: xValue,
          y: y,
          type: 'bar',
          orientation: 'h',
          name: 'Use Automatic Sequencer',
          hovertemplate: 'Use Automatic Sequencer: $%{x:~s}<extra></extra>',
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }
      if (this.combinedDayTypeResults.some(result => { return result.modification.reduceRuntime.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.reduceRunTimeSavings.savings.cost });
        xValue.unshift(0);
        let trace = {
          x: xValue,
          y: y,
          type: 'bar',
          orientation: 'h',
          name: 'Reduce Runtime',
          hovertemplate: 'Reduce Runtime: $%{x:~s}<extra></extra>',
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }
      if (this.combinedDayTypeResults.some(result => { return result.modification.addPrimaryReceiverVolume.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.addReceiverVolumeSavings.savings.cost });
        xValue.unshift(0);
        let trace = {
          x: xValue,
          y: y,
          type: 'bar',
          orientation: 'h',
          name: 'Add Primary Receiver Volume',
          hovertemplate: 'Add Primary Receiver Volume: $%{x:~s}<extra></extra>',
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }

      if (this.combinedDayTypeResults.some(result => { return result.modification.replaceCompressor.order != 100 })) {
        let xValue = this.combinedDayTypeResults.map(result => { return result.combinedResults.replaceCompressorsSavings.savings.cost });
        xValue.unshift(0);
        let trace = {
          x: xValue,
          y: y,
          type: 'bar',
          orientation: 'h',
          name: 'Replace Compressor',
          hovertemplate: 'Replace Compressor: $%{x:~s}<extra></extra>',
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }


      var layout = {
        showlegend: true,
        barmode: 'stack',
        title: {
          text: "Adjust Annual Cost by Modification"
        },
        yaxis: {
          autotick: false,
          automargin: true,
        },
        xaxis: {
          tickprefix: '',
          tickformat: '$~s',
          hoverformat: '$~s',
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
}
