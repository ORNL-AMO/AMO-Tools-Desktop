import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet, ReplaceExistingMotorTreasureHunt } from '../../shared/models/treasure-hunt';
import { ModalDirective } from 'ngx-bootstrap';
import { Settings } from '../../shared/models/settings';
import { ReplaceExistingData } from '../../shared/models/calculators';

@Component({
  selector: 'app-find-treasure',
  templateUrl: './find-treasure.component.html',
  styleUrls: ['./find-treasure.component.css']
})
export class FindTreasureComponent implements OnInit {
  @Input()
  treasureHunt: TreasureHunt;
  @Output('emitSave')
  emitSave = new EventEmitter<TreasureHunt>();
  @Input()
  settings: Settings;

  @ViewChild('saveCalcModal') public saveCalcModal: ModalDirective;
  @ViewChild('opportunitySheetModal') public opportunitySheetModal: ModalDirective;

  selectedCalc: string = 'none';

  newLightingCalc: LightingReplacementTreasureHunt;
  newOpportunitySheet: OpportunitySheet;
  newReplaceExistingMotor: ReplaceExistingMotorTreasureHunt;
  showOpportunitySheetOnSave: boolean;
  opperatingHoursPerYear: number;
  constructor() { }

  ngOnInit() {
    this.opperatingHoursPerYear = this.treasureHunt.operatingHours.hoursPerYear;
  }

  selectCalc(str: string) {
    this.selectedCalc = str;
  }

  closeSaveCalcModal() {
    this.saveCalcModal.hide();
  }

  saveNewCalc() {
    if (this.selectedCalc == 'lighting-replacement') {
      this.saveLighting();
    } else if (this.selectedCalc == 'replace-existing') {
      this.saveReplaceExistingMotor();
    }
  }


  saveNewLighting(newCalcToSave: LightingReplacementTreasureHunt) {
    this.newLightingCalc = newCalcToSave;
    this.newLightingCalc.selected = true;
    if (!this.newOpportunitySheet) {
      this.showOpportunitySheetOnSave = true;
    }
    this.newLightingCalc.opportunitySheet = this.newOpportunitySheet;
    this.saveCalcModal.show();
  }

  saveLighting() {
    this.treasureHunt.lightingReplacements.push(this.newLightingCalc);
    this.closeSaveCalcModal();
    this.newOpportunitySheet = undefined;
    this.showOpportunitySheetOnSave = true;
    this.selectCalc('none');
    this.emitSave.emit(this.treasureHunt);
  }


  saveNewOpportunitySheet(newSheet: OpportunitySheet) {
    if (!this.treasureHunt.opportunitySheets) {
      this.treasureHunt.opportunitySheets = new Array<OpportunitySheet>();
    }
    this.treasureHunt.opportunitySheets.push(newSheet);
    this.selectCalc('none');
    this.emitSave.emit(this.treasureHunt);
  }

  showOpportunitySheetModal() {
    this.opportunitySheetModal.show();
  }

  hideOpportunitySheetModal() {
    this.opportunitySheetModal.hide();
  }

  saveOpportunitySheet(newOppSheet: OpportunitySheet) {
    this.newOpportunitySheet = newOppSheet;
    this.showOpportunitySheetOnSave = false;
    this.hideOpportunitySheetModal();
  }

  saveNewReplaceExistingMotor(replaceExistingData: ReplaceExistingData) {
    this.newReplaceExistingMotor = {
      replaceExistingData: replaceExistingData,
      selected: true,
      opportunitySheet: this.newOpportunitySheet
    }
    if (!this.newReplaceExistingMotor.opportunitySheet) {
      this.showOpportunitySheetOnSave = true;
    }
    this.saveCalcModal.show();
  }

  saveReplaceExistingMotor() {
    if (!this.treasureHunt.replaceExistingMotors) {
      this.treasureHunt.replaceExistingMotors = new Array<ReplaceExistingMotorTreasureHunt>();
    }
    this.treasureHunt.replaceExistingMotors.push(this.newReplaceExistingMotor);
    this.closeSaveCalcModal();
    this.newOpportunitySheet = undefined;
    this.showOpportunitySheetOnSave = true;
    this.selectCalc('none');
    this.emitSave.emit(this.treasureHunt);
  }
}
