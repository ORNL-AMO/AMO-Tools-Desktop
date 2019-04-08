import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet } from '../../shared/models/treasure-hunt';
import { ModalDirective } from 'ngx-bootstrap';
import { Settings } from '../../shared/models/settings';

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
  showOpportunitySheetOnSave: boolean;
  constructor() { }

  ngOnInit() {
  }

  selectCalc(str: string) {
    this.selectedCalc = str;
  }

  closeSaveCalcModal() {
    this.saveCalcModal.hide();
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

}
