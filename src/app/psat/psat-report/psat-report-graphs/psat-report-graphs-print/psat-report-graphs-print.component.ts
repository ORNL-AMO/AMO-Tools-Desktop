import { Component, OnInit, Input } from '@angular/core';
import { PSAT, Modification } from '../../../../shared/models/psat';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-psat-report-graphs-print',
  templateUrl: './psat-report-graphs-print.component.html',
  styleUrls: ['./psat-report-graphs-print.component.css']
})
export class PsatReportGraphsPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  graphColors: Array<string>;
  @Input()
  psatOptions: Array<{ name: string, psat: PSAT }>;
  @Input()
  barChartWidth: number;
  @Input()
  pieChartWidth: number;
  @Input()
  printView: boolean;
  @Input()
  modExists: boolean;
  @Input()
  printSankey: boolean;
  @Input()
  printGraphs: boolean;
  @Input()
  allChartData: { pieLabels: Array<Array<string>>, pieValues: Array<Array<number>>, barLabels: Array<string>, barValues: Array<Array<number>> }
  // @Input()
  // allPieLabels: Array<Array<string>>;
  // @Input()
  // allPieValues: Array<Array<number>>;

  baselinePsat: { name: string, psat: PSAT };
  allNotes: Array<Array<string>>;
  modifications: Array<Modification>;


  constructor() { }

  ngOnInit() {
    this.modifications = new Array<Modification>();
    this.allNotes = new Array<Array<string>>();
    if (this.psatOptions === null || this.psatOptions === undefined) {
      console.error('psat print error');
      return;
    }
    this.setBaseline();
    if (this.modExists) {
      this.getAllModifications();
      this.getAllNotes();
    }
  }


  setBaseline(): void {
    this.baselinePsat = this.psatOptions[0];
  }

  getAllModifications() {
    this.modifications = (JSON.parse(JSON.stringify(this.baselinePsat.psat.modifications)))
    console.log('modifications.length = ' + this.modifications.length);
    console.log('psatOptions.length = ' + this.psatOptions.length);
  }

  getAllNotes() {
    for (let i = 0; i < this.modifications.length; i++) {
      let notes = new Array<string>();

      if (this.modifications[i].notes) {
        if (this.modifications[i].notes.systemBasicsNotes) {
          notes.push("Charge Material - " + this.modifications[i].notes.systemBasicsNotes);
        }
        if (this.modifications[i].notes.pumpFluidNotes) {
          notes.push("Wall Loss - " + this.modifications[i].notes.pumpFluidNotes);
        }
        if (this.modifications[i].notes.motorNotes) {
          notes.push("Atmosphere Loss - " + this.modifications[i].notes.motorNotes);
        }
        if (this.modifications[i].notes.fieldDataNotes) {
          notes.push("Fixture Loss - " + this.modifications[i].notes.fieldDataNotes);
        }
      }
      this.allNotes.push(notes);
    }
  }


}
