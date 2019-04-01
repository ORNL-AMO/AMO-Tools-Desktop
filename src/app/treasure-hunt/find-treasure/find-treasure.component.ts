import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet } from '../../shared/models/treasure-hunt';
import { ModalDirective } from 'ngx-bootstrap';

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
  @ViewChild('saveCalcModal') public saveCalcModal: ModalDirective;


  selectedCalc: string = 'none';

  newLightingCalc: LightingReplacementTreasureHunt;
  calcName: string;
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
    if (this.treasureHunt.lightingReplacements) {
      this.calcName = 'Lighting Replacement #' + (this.treasureHunt.lightingReplacements.length + 1);
    } else {
      this.calcName = 'Lighting Replacement #1';
    }
    this.newLightingCalc = newCalcToSave;
    this.newLightingCalc.selected = true;
    this.saveCalcModal.show();
  }

  saveLighting() {
    this.treasureHunt.lightingReplacements.push(this.newLightingCalc);
    this.closeSaveCalcModal();
    this.selectCalc('none');
    this.emitSave.emit(this.treasureHunt);
  }


  saveNewOpportunitySheet(newSheet: OpportunitySheet){
    if(!this.treasureHunt.opportunitySheets){
      this.treasureHunt.opportunitySheets = new Array<OpportunitySheet>();
    }
    this.treasureHunt.opportunitySheets.push(newSheet);
    this.selectCalc('none');
    this.emitSave.emit(this.treasureHunt);
  }
}
