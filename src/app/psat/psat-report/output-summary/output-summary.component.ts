import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { CompareService } from '../../compare.service';
import { PsatReportRollupService } from '../../../report-rollup/psat-report-rollup.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-output-summary',
  templateUrl: './output-summary.component.html',
  styleUrls: ['./output-summary.component.css']
})
export class OutputSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;

  selectedModificationIndex: number;
  psat: PSAT;
  currCurrency: string = "$";
  

  notes: Array<SummaryNote>;

  constructor(private psatReportRollupService: PsatReportRollupService, private compareService: CompareService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.psat = this.assessment.psat;
    this.notes = new Array();
    if (this.inRollup) {
      this.psatReportRollupService.selectedPsats.forEach(val => {
        if (val) {
          val.forEach(assessment => {
            if (assessment.assessmentId == this.assessment.id) {
              this.selectedModificationIndex = assessment.selectedIndex;
            }
          })
        }
      })
    }
    if (this.currCurrency != this.settings.currency) {
      this.convertCurrency();
    }
  }

  convertCurrency() {
    this.psat.modifications.forEach((modification) => {
      modification.psat.outputs.annual_cost = this.convertUnitsService.convertValue(modification.psat.outputs.annual_cost, this.currCurrency, this.settings.currency);
      modification.psat.inputs.implementationCosts = this.convertUnitsService.convertValue(modification.psat.inputs.implementationCosts, this.currCurrency, this.settings.currency);
    });

    if(this.psat.modifications){
      this.notes = this.buildSummaryNotes(this.psat);
    }

  }

  getModificationsMadeList(modifiedPsat: PSAT): Array<string> {
    
    let modificationsMadeList: Array<string> = new Array();

    let isPumpAndFluidDifferent: boolean = this.compareService.checkPumpDifferent(this.settings, this.psat, modifiedPsat);
    if(isPumpAndFluidDifferent == true){
      modificationsMadeList.push('Pump and Fluid');
    }

    

    let isMotorDifferent: boolean = this.compareService.checkMotorDifferent(this.psat, modifiedPsat);
    if(isMotorDifferent == true){
      modificationsMadeList.push('Motor');
    }
    
    let isFieldDataDifferent: boolean = this.compareService.checkFieldDataDifferent(this.psat, modifiedPsat);
    if(isFieldDataDifferent == true){
      modificationsMadeList.push('Field Data');
    }
    
    return modificationsMadeList;
  }

  useModification() {
    this.psatReportRollupService.updateSelectedPsats({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

  getDiff(num1: number, num2: number) {
    let diff = num1 - num2;
    if ((diff < .005) && (diff > -.005)) {
      return null;
    } else {
      return diff;
    }
  }

  getPaybackPeriod(modification: PSAT) {
    let result = 0;
    let annualCostSavings = this.getDiff(this.psat.outputs.annual_cost, modification.outputs.annual_cost);
    if (isNaN(annualCostSavings) == false) {
      if (annualCostSavings > 1) {
        result = (modification.inputs.implementationCosts / annualCostSavings) * 12;
      }
    }
    return result;
  }

  buildSummaryNotes(psat: PSAT): Array<SummaryNote>{
    let tmpNotesArr: Array<SummaryNote> = new Array<SummaryNote>();
    psat.modifications.forEach(mod =>{
      if(mod.notes){
        if(mod.notes.pumpFluidNotes){
          let note = this.buildNoteObject(mod.psat.name, 'Pump and Fluid', mod.notes.pumpFluidNotes);
          tmpNotesArr.push(note);
        }
        if(mod.notes.motorNotes){
          let note = this.buildNoteObject(mod.psat.name, 'Motor', mod.notes.motorNotes);
          tmpNotesArr.push(note);
        }
        if(mod.notes.fieldDataNotes){
          let note = this.buildNoteObject(mod.psat.name, 'Field Data', mod.notes.fieldDataNotes);
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

}

export interface SummaryNote {
  modName: string;
  modMade: string;
  modNote: string;
}

