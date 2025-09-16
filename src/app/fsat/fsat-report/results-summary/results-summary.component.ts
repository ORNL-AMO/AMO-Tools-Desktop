import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { FSAT } from '../../../shared/models/fans';
import { CompareService } from '../../compare.service';
import { FsatReportRollupService } from '../../../report-rollup/fsat-report-rollup.service';

@Component({
    selector: 'app-results-summary',
    templateUrl: './results-summary.component.html',
    styleUrls: ['./results-summary.component.css'],
    standalone: false
})
export class ResultsSummaryComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;

  selectedModificationIndex: number;
  fsat: FSAT;
  

  notes: Array<SummaryNote>;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor(private fsatReportRollupService: FsatReportRollupService, private compareService: CompareService) { }

  ngOnInit() {
    this.fsat = this.assessment.fsat;
    this.notes = new Array();
    if (this.inRollup) {
      this.fsatReportRollupService.selectedFsats.forEach(val => {
        if (val) {
          val.forEach(assessment => {
            if (assessment.assessmentId === this.assessment.id) {
              this.selectedModificationIndex = assessment.selectedIndex;
            }
          });
        }
      });
    }

    if(this.fsat.modifications){
      this.notes = this.buildSummaryNotes(this.fsat);
    }

  }

  getModificationsMadeList(modifiedFsat: FSAT): Array<string> {
    let modificationsMadeList: Array<string> = new Array();
    let isOperationsDifferent: boolean = this.compareService.checkFanOperationsDifferent(this.fsat, modifiedFsat);
    if(isOperationsDifferent == true){
      modificationsMadeList.push('Operations');
    }
    let isFluidDifferent: boolean = this.compareService.checkFluidDifferent(this.fsat, modifiedFsat);
    if(isFluidDifferent == true){
      modificationsMadeList.push('Fluid');
    }
    let isFanDifferent: boolean = this.compareService.checkFanSetupDifferent(this.settings, this.fsat, modifiedFsat);
    if(isFanDifferent == true){
      modificationsMadeList.push('Fan');
    }
    let isMotorDifferent: boolean = this.compareService.checkFanMotorDifferent(this.fsat, modifiedFsat);
    if(isMotorDifferent == true){
      modificationsMadeList.push('Motor');
    }
    let isFieldDataDifferent: boolean = this.compareService.checkFanFieldDataDifferent(this.fsat, modifiedFsat);
    if(isFieldDataDifferent == true){
      modificationsMadeList.push('Field Data');
    }
    return modificationsMadeList;
  }

  useModification() {
    this.fsatReportRollupService.updateSelectedFsats({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }
  
  buildSummaryNotes(fsat: FSAT): Array<SummaryNote>{
    let tmpNotesArr: Array<SummaryNote> = new Array<SummaryNote>();
    fsat.modifications.forEach(mod =>{
      if(mod.fsat.notes){
        if(mod.fsat.notes.fluidNotes){
          let note = this.buildNoteObject(mod.fsat.name, 'Fluid', mod.fsat.notes.fluidNotes);
          tmpNotesArr.push(note);
        }
        if(mod.fsat.notes.fanSetupNotes){
          let note = this.buildNoteObject(mod.fsat.name, 'Fan', mod.fsat.notes.fanSetupNotes);
          tmpNotesArr.push(note);
        }
        if(mod.fsat.notes.fanMotorNotes){
          let note = this.buildNoteObject(mod.fsat.name, 'Motor', mod.fsat.notes.fanMotorNotes);
          tmpNotesArr.push(note);
        }
        if(mod.fsat.notes.fieldDataNotes){
          let note = this.buildNoteObject(mod.fsat.name, 'Field Data', mod.fsat.notes.fieldDataNotes);
          tmpNotesArr.push(note);
        }

      }

    });
    return tmpNotesArr;
  }

  buildNoteObject(modName: string, modMade: string, modNote: string): SummaryNote {
    let summaryNote: SummaryNote = {
      modName: modName,
      modMade: modMade,
      modNote: modNote
    };
    return summaryNote;
  }

  getModificationScenario(modifiedFsat: FSAT): Array<string> {
    let modificationScenario: Array<string> = new Array();
    if (modifiedFsat.whatIfScenario == true) {
      modificationScenario.push('Modify Fan');
    } else if (modifiedFsat.whatIfScenario == false) {
      modificationScenario.push('Compare Two Fans');
    }
    return modificationScenario;
  }

  getPaybackPeriod(modification: FSAT) {
    let result = 0;
    let annualCostSavings = this.getDiff(this.fsat.outputs.annualCost, modification.outputs.annualCost);
    if (isNaN(annualCostSavings) == false) {
      if (annualCostSavings > 1) {
        result = (modification.implementationCosts / annualCostSavings) * 12;
      }
    }
    return result;
  }

  getDiff(num1: number, num2: number) {
    let diff = num1 - num2;
    if ((diff < .005) && (diff > -.005)) {
      return null;
    } else {
      return diff;
    }
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }

}

export interface SummaryNote {
  modName: string;
  modMade: string;
  modNote: string;
}