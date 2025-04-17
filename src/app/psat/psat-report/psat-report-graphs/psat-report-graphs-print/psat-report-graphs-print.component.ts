import { Component, OnInit, Input } from '@angular/core';
import { Modification, PSAT } from '../../../../shared/models/psat';
import { Settings } from '../../../../shared/models/settings';
import { ScenarioSummary } from '../../../../shared/models/reports';

@Component({
    selector: 'app-psat-report-graphs-print',
    templateUrl: './psat-report-graphs-print.component.html',
    styleUrls: ['./psat-report-graphs-print.component.css'],
    standalone: false
})
export class PsatReportGraphsPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printSankey: boolean;
  @Input()
  printGraphs: boolean;
  @Input()
  allChartData: Array<{
    name: string,
    valuesAndLabels: Array<{ value: number, label: string }>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>,
    modification?: Modification,
    isValid: boolean
  }>;
  @Input()
  psat: PSAT;

  scenarioSummaries: Array<ScenarioSummary>;


  constructor() { }

  ngOnInit() {
    this.setScenarioSummaries();
  }

  setScenarioSummaries() {
    this.scenarioSummaries = new Array();
    if (this.allChartData.length > 1) {
      //modificaitons exist
      for (let i = 1; i < this.allChartData.length; i++) {
        let modificationScenarioSummary: ScenarioSummary = this.getScenarioSummary(this.allChartData[i]);
        this.scenarioSummaries.push(modificationScenarioSummary);
      }
    } else {
      //no modifications
      let baselineGraphData = this.baselineGraphData();
      this.scenarioSummaries = [
        {
          notes: new Array(),
          baselineGraphData: baselineGraphData,
          modificationGraphData: undefined
        }
      ]
    }
  }

  getScenarioSummary(chartDataObj: {
    name: string,
    valuesAndLabels: Array<{ value: number, label: string }>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>,
    modification?: Modification,
    isValid: boolean
  }): ScenarioSummary {
    let notes: Array<string> = this.getModificationNotes(chartDataObj.modification);
    let baselineGraphData = this.baselineGraphData();
    return {
      notes: notes,
      baselineGraphData: baselineGraphData,
      modificationGraphData: chartDataObj
    }
  }

  getModificationNotes(modification: Modification): Array<string> {
    let notes: Array<string> = new Array();
    if (modification.notes.systemBasicsNotes) {
      notes.push("System Basics - " + modification.notes.systemBasicsNotes);
    } else if (modification.notes.pumpFluidNotes) {
      notes.push("Pump Fluid - " + modification.notes.pumpFluidNotes);

    } else if (modification.notes.motorNotes) {
      notes.push("Motor- " + modification.notes.motorNotes);

    } else if (modification.notes.fieldDataNotes) {
      notes.push("Field Data - " + modification.notes.fieldDataNotes);
    }
    return notes;
  }

  baselineGraphData(): {
    name: string,
    valuesAndLabels: Array<{ value: number, label: string }>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>
  } {
    return {
      name: 'Baseline',
      valuesAndLabels: this.allChartData[0].valuesAndLabels,
      barChartLabels: this.allChartData[0].barChartLabels,
      barChartValues: this.allChartData[0].barChartValues
    }
  }
}
