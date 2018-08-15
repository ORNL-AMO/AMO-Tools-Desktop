import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT, Modification } from '../../../../shared/models/fans';

@Component({
  selector: 'app-fsat-report-graphs-print',
  templateUrl: './fsat-report-graphs-print.component.html',
  styleUrls: ['./fsat-report-graphs-print.component.css']
})
export class FsatReportGraphsPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  graphColors: Array<string>;
  @Input()
  fsatOptions: Array<{ name: string, fsat: FSAT }>;
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
  @Input()
  assessmentName: string;

  baselineFsat: { name: string, fsat: FSAT };
  allNotes: Array<Array<string>>;
  modifications: Array<Modification>;
  // assessmentName: string;


  constructor() { }

  ngOnInit() {
    this.assessmentName = this.assessmentName.replace(/ /g, "-");
    this.modifications = new Array<Modification>();
    this.allNotes = new Array<Array<string>>();
    if (this.fsatOptions === null || this.fsatOptions === undefined) {
      console.error('fsat print error');
      return;
    }
    this.setBaseline();
    if (this.modExists) {
      this.getAllModifications();
      this.getAllNotes();
    }
  }

  setBaseline(): void {
    this.baselineFsat = this.fsatOptions[0];
  }

  getAllModifications() {
    this.modifications = (JSON.parse(JSON.stringify(this.baselineFsat.fsat.modifications)))
  }

  getAllNotes() {
    for (let i = 0; i < this.modifications.length; i++) {
      let notes = new Array<string>();

      // if (this.modifications[i].notes) {
      //   if (this.modifications[i].notes.systemBasicsNotes) {
      //     notes.push("System Basics - " + this.modifications[i].notes.systemBasicsNotes);
      //   }
      //   if (this.modifications[i].notes.pumpFluidNotes) {
      //     notes.push("Pump Fluid - " + this.modifications[i].notes.pumpFluidNotes);
      //   }
      //   if (this.modifications[i].notes.motorNotes) {
      //     notes.push("Motor- " + this.modifications[i].notes.motorNotes);
      //   }
      //   if (this.modifications[i].notes.fieldDataNotes) {
      //     notes.push("Field Data - " + this.modifications[i].notes.fieldDataNotes);
      //   }
      // }
      this.allNotes.push(notes);
    }
  }

}
