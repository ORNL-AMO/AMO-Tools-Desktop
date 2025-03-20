import { Component, OnInit, Input } from '@angular/core';
import { Modification, PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { ScenarioSummary } from '../../../../shared/models/reports';

@Component({
    selector: 'app-report-graphs-print',
    templateUrl: './report-graphs-print.component.html',
    styleUrls: ['./report-graphs-print.component.css'],
    standalone: false
})
export class ReportGraphsPrintComponent implements OnInit {
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
      modification?: Modification
    }>;
    @Input()
    barChartYAxisLabel: string;
    @Input()
    lossUnit: string
    @Input()
    phast: PHAST;
  
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
      if (modification.notes.chargeNotes) {
        notes.push("Charge Material - " + modification.notes.chargeNotes);
    }
    if (modification.notes.wallNotes) {
        notes.push("Wall Loss - " + modification.notes.wallNotes);
    }
    if (modification.notes.atmosphereNotes) {
        notes.push("Atmosphere Loss - " + modification.notes.atmosphereNotes);
    }
    if (modification.notes.fixtureNotes) {
        notes.push("Fixture Loss - " + modification.notes.fixtureNotes);
    }
    if (modification.notes.openingNotes) {
        notes.push("Opening Loss - " + modification.notes.openingNotes);
    }
    if (modification.notes.coolingNotes) {
        notes.push("Cooling Loss - " + modification.notes.coolingNotes);
    }
    if (modification.notes.flueGasNotes) {
        notes.push("Flue Gas Loss - " + modification.notes.flueGasNotes);
    }
    if (modification.notes.otherNotes) {
        notes.push("Other Loss - " + modification.notes.otherNotes);
    }
    if (modification.notes.leakageNotes) {
        notes.push("Leakage Loss - " + modification.notes.leakageNotes);
    }
    if (modification.notes.extendedNotes) {
        notes.push("Extended Surface Loss - " + modification.notes.extendedNotes);
    }
    if (modification.notes.slagNotes) {
        notes.push("Slag Loss - " + modification.notes.slagNotes);
    }
    if (modification.notes.auxiliaryPowerNotes) {
        notes.push("Auxiliary Power - " + modification.notes.auxiliaryPowerNotes);
    }
    if (modification.notes.exhaustGasNotes) {
        notes.push("Exhaust Loss - " + modification.notes.exhaustGasNotes);
    }
    if (modification.notes.energyInputExhaustGasNotes) {
        notes.push("EAF Loss - " + modification.notes.energyInputExhaustGasNotes);
    }
    if (modification.notes.heatSystemEfficiencyNotes) {
        notes.push("System Heat Efficiency - " + modification.notes.heatSystemEfficiencyNotes);
    }
    if (modification.notes.operationsNotes) {
        notes.push("Operations - " + modification.notes.operationsNotes);
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
