import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { Modification } from '../../../../shared/models/fans';
import { ScenarioSummary } from '../../../../shared/models/reports';

@Component({
  selector: 'app-fsat-report-graphs-print',
  templateUrl: './fsat-report-graphs-print.component.html',
  styleUrls: ['./fsat-report-graphs-print.component.css']
})
export class FsatReportGraphsPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printSankey: boolean;
  @Input()
  printGraphs: boolean;
  @Input()
  allChartData: Array<{
    name: string,
    pieChartLabels: Array<string>,
    pieChartValues: Array<number>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>,
    modification?: Modification
  }>;

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
    pieChartLabels: Array<string>,
    pieChartValues: Array<number>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>,
    modification?: Modification
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
    if (modification.fsat.notes) {
      if (modification.fsat.notes.fieldDataNotes) {
        notes.push("Field Data - " + modification.fsat.notes.fieldDataNotes);
      }
      if (modification.fsat.notes.fanMotorNotes) {
        notes.push("Fan Motor - " + modification.fsat.notes.fanMotorNotes);
      }
      if (modification.fsat.notes.fanSetupNotes) {
        notes.push("Fan Setup - " + modification.fsat.notes.fanSetupNotes);
      }
      if (modification.fsat.notes.fluidNotes) {
        notes.push("Fluid - " + modification.fsat.notes.fluidNotes);
      }
    }
    return notes;
  }

  baselineGraphData(): {
    name: string,
    pieChartLabels: Array<string>,
    pieChartValues: Array<number>,
    barChartLabels: Array<string>,
    barChartValues: Array<number>
  } {
    return {
      name: 'Baseline',
      pieChartLabels: this.allChartData[0].pieChartLabels,
      pieChartValues: this.allChartData[0].pieChartValues,
      barChartLabels: this.allChartData[0].barChartLabels,
      barChartValues: this.allChartData[0].barChartValues
    }
  }
}
