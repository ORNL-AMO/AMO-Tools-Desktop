import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CompressedAirAssessmentResult, DayTypeModificationResult } from '../../compressed-air-assessment-results.service';
import * as Plotly from 'plotly.js';
import { CompressedAirAssessment, CompressedAirDayType } from '../../../shared/models/compressed-air-assessment';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-report-graphs',
  templateUrl: './report-graphs.component.html',
  styleUrls: ['./report-graphs.component.css']
})
export class ReportGraphsComponent implements OnInit {
  @Input()
  assessmentResults: Array<CompressedAirAssessmentResult>;
  @Input()
  compressedAirAssessment: CompressedAirAssessment;
  @ViewChild("modificationGraph", { static: false }) modificationGraph: ElementRef;

  selectedDayType: CompressedAirDayType;
  reduceAirLeaks: boolean;
  improveEndUseEfficiency: boolean;
  reduceSystemAirPressure: boolean;
  adjustCascadingSetPoints: boolean;
  useAutomaticSequencer: boolean;
  reduceRuntime: boolean;
  addPrimaryReceiverVolume: boolean;
  constructor() { }

  ngOnInit(): void {
    this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes[0];
    this.setDisplayValues();
  }

  ngAfterViewInit() {
    this.drawModificationGraph();
  }

  drawModificationGraph() {
    if (this.assessmentResults && this.assessmentResults.length != 0 && this.modificationGraph) {
      
      let x: Array<string> = this.assessmentResults.map(result => { return result.modification.name });
      x.unshift('Baseline');
      let yValue = this.getAnnualCost();
      let traceData = new Array();
      let currencyPipe = new CurrencyPipe('en-US')
      traceData.push({
        x: x,
        y: yValue,
        text: yValue.map(value => { return currencyPipe.transform(value, undefined, undefined, '1.0-0')}),
        textposition: 'auto',
        type: 'bar',
        name: 'Adjusted Annual Cost',
        hoverinfo: "name+y",
        marker: {
          line: {
            width: 3
          }
        },
      })
      // let traceData = new Array();
      let trace = {
        x: x,
        y: this.getFlowReallocationTrace(),
        type: 'bar',
        name: 'Flow Reallocation',
        hoverinfo: "name+y",
        marker: {
          line: {
            width: 3
          }
        },
      }
      traceData.push(trace);
      if (this.reduceAirLeaks) {
        let trace = {
          x: x,
          y: this.getReduceAirLeaksTrace(),
          type: 'bar',
          name: 'Reduce Air Leaks',
          hoverinfo: "name+y",
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }
      if (this.improveEndUseEfficiency) {
        let trace = {
          x: x,
          y: this.getImproveEfficiencyTrace(),
          type: 'bar',
          name: 'Improve End Use Efficiency',
          hoverinfo: "name+y",
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }
      if (this.reduceSystemAirPressure) {
        let trace = {
          x: x,
          y: this.getReduceAirSystemPressureTrace(),
          type: 'bar',
          name: 'Reduce System Air Pressure',
          hoverinfo: "name+y",
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }
      if (this.adjustCascadingSetPoints) {
        let trace = {
          x: x,
          y: this.getAdjustCascadePointTrace(),
          type: 'bar',
          name: 'Adjust Cascading Set Points',
          hoverinfo: "name+y",
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }
      if (this.useAutomaticSequencer) {
        let trace = {
          x: x,
          y: this.getAutomaticSequencerTrace(),
          type: 'bar',
          name: 'Use Automatic Sequencer',
          hoverinfo: "name+y",
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }
      if (this.reduceRuntime) {
        let trace = {
          x: x,
          y: this.getReduceRuntimeTrace(),
          type: 'bar',
          name: 'Reduce Runtime',
          hoverinfo: "name+y",
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }
      if (this.addPrimaryReceiverVolume) {
        let trace = {
          x: x,
          y: this.getReceiverVolumeTrace(),
          type: 'bar',
          name: 'Add Primary Receiver Volume',
          hoverinfo: "name+y",
          marker: {
            line: {
              width: 3
            }
          },
        }
        traceData.push(trace);
      }


      var layout = this.getLayout("Modification Project Savings");
      var config = {
        responsive: true,
        displaylogo: false
      };
      Plotly.newPlot(this.modificationGraph.nativeElement, traceData, layout, config);
    }
  }


  getReduceAirLeaksTrace(): Array<number> {
    let y: Array<number> = [0];
    this.assessmentResults.forEach(result => {
      let dayTypeModificationResult: DayTypeModificationResult = result.dayTypeModificationResults.find(dResult => { return dResult.dayTypeId == this.selectedDayType.dayTypeId });
      y.push(dayTypeModificationResult.reduceAirLeaksSavings.savings.cost);
    });
    return y;
  }

  getImproveEfficiencyTrace(): Array<number> {
    let y: Array<number> = [0];
    this.assessmentResults.forEach(result => {
      let dayTypeModificationResult: DayTypeModificationResult = result.dayTypeModificationResults.find(dResult => { return dResult.dayTypeId == this.selectedDayType.dayTypeId });
      y.push(dayTypeModificationResult.improveEndUseEfficiencySavings.savings.cost);
    });
    return y;
  }
  getReduceAirSystemPressureTrace(): Array<number> {
    let y: Array<number> = [0];
    this.assessmentResults.forEach(result => {
      let dayTypeModificationResult: DayTypeModificationResult = result.dayTypeModificationResults.find(dResult => { return dResult.dayTypeId == this.selectedDayType.dayTypeId });
      y.push(dayTypeModificationResult.reduceSystemAirPressureSavings.savings.cost);
    });
    return y;
  }
  getAdjustCascadePointTrace(): Array<number> {
    let y: Array<number> = [0];
    this.assessmentResults.forEach(result => {
      let dayTypeModificationResult: DayTypeModificationResult = result.dayTypeModificationResults.find(dResult => { return dResult.dayTypeId == this.selectedDayType.dayTypeId });
      y.push(dayTypeModificationResult.adjustCascadingSetPointsSavings.savings.cost);
    });
    return y;
  }
  getAutomaticSequencerTrace(): Array<number> {
    let y: Array<number> = [0];
    this.assessmentResults.forEach(result => {
      let dayTypeModificationResult: DayTypeModificationResult = result.dayTypeModificationResults.find(dResult => { return dResult.dayTypeId == this.selectedDayType.dayTypeId });
      y.push(dayTypeModificationResult.useAutomaticSequencerSavings.savings.cost);
    });
    return y;
  }
  getReduceRuntimeTrace(): Array<number> {
    let y: Array<number> = [0];
    this.assessmentResults.forEach(result => {
      let dayTypeModificationResult: DayTypeModificationResult = result.dayTypeModificationResults.find(dResult => { return dResult.dayTypeId == this.selectedDayType.dayTypeId });
      y.push(dayTypeModificationResult.reduceRunTimeSavings.savings.cost);
    });
    return y;
  }
  getReceiverVolumeTrace(): Array<number> {
    let y: Array<number> = [0];
    this.assessmentResults.forEach(result => {
      let dayTypeModificationResult: DayTypeModificationResult = result.dayTypeModificationResults.find(dResult => { return dResult.dayTypeId == this.selectedDayType.dayTypeId });
      y.push(dayTypeModificationResult.addReceiverVolumeSavings.savings.cost);
    });
    return y;
  }

  getAnnualCost(): Array<number> {
    let y: Array<number> = [this.assessmentResults[0].totalBaselineCost];
    this.assessmentResults.forEach(result => {
      let dayTypeModificationResult: DayTypeModificationResult = result.dayTypeModificationResults.find(dResult => { return dResult.dayTypeId == this.selectedDayType.dayTypeId });
      y.push(dayTypeModificationResult.allSavingsResults.adjustedResults.cost);
    });
    return y;
  }

  getFlowReallocationTrace(): Array<number> {
    let y: Array<number> = [0];
    this.assessmentResults.forEach(result => {
      let dayTypeModificationResult: DayTypeModificationResult = result.dayTypeModificationResults.find(dResult => { return dResult.dayTypeId == this.selectedDayType.dayTypeId });
      y.push(dayTypeModificationResult.flowReallocationSavings.savings.cost);
    });
    return y;
  }

  getLayout(yAxisTitle: string) {
    return {
      showlegend: true,
      barmode: 'stack',
      xaxis: {
        autotick: false,
        automargin: true
      },
      title: yAxisTitle,
      yaxis: {
        tickprefix: '$',
        // title: {
        //   text: yAxisTitle,
        //   font: {
        //     size: 16
        //   },
        // },
        hoverformat: ",.0f",
      },
      margin: {
        // t: 20,
        // r: 20
      },
      legend: {
        // orientation: "h",
        // y: 1.5
      }
    };
  }

  setDisplayValues() {
    this.reduceAirLeaks = false;
    this.improveEndUseEfficiency = false;
    this.reduceSystemAirPressure = false;
    this.adjustCascadingSetPoints = false;
    this.useAutomaticSequencer = false;
    this.reduceRuntime = false;
    this.addPrimaryReceiverVolume = false;
    this.assessmentResults.forEach(result => {
      if (result.modification.addPrimaryReceiverVolume.order != 100) {
        this.addPrimaryReceiverVolume = true;
      }
      if (result.modification.adjustCascadingSetPoints.order != 100) {
        this.adjustCascadingSetPoints = true;
      }
      if (result.modification.improveEndUseEfficiency.order != 100) {
        this.improveEndUseEfficiency = true;
      }
      if (result.modification.reduceAirLeaks.order != 100) {
        this.reduceAirLeaks = true;
      }
      if (result.modification.reduceRuntime.order != 100) {
        this.reduceRuntime = true;
      }
      if (result.modification.reduceSystemAirPressure.order != 100) {
        this.reduceSystemAirPressure = true;
      }
      if (result.modification.useAutomaticSequencer.order != 100) {
        this.useAutomaticSequencer = true;
      }
    });
  }
}