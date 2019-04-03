import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet } from '../../shared/models/treasure-hunt';
import { Settings } from 'http2';
import { LightingReplacementService } from '../../calculator/lighting/lighting-replacement/lighting-replacement.service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-treasure-chest',
  templateUrl: './treasure-chest.component.html',
  styleUrls: ['./treasure-chest.component.css']
})
export class TreasureChestComponent implements OnInit {
  @Input()
  treasureHunt: TreasureHunt;
  @Input()
  settings: Settings;
  @Output('emitUpdateTreasureHunt')
  emitUpdateTreasureHunt = new EventEmitter<TreasureHunt>();

  @ViewChild('saveCalcModal') public saveCalcModal: ModalDirective;
  @ViewChild('opportunitySheetModal') public opportunitySheetModal: ModalDirective;

  selectedCalc: string = 'none';
  selectedEditIndex: number;
  selectedEditLightingReplacement: LightingReplacementTreasureHunt;
  selectedEditOpportunitySheet: OpportunitySheet;
  constructor(private lightingReplacementService: LightingReplacementService) { }

  ngOnInit() {
  }

  selectCalc(str: string) {
    this.selectedCalc = str;
  }

  editLighting(lightingReplacement: LightingReplacementTreasureHunt, index: number) {
    this.selectedEditIndex = index;
    this.selectedEditLightingReplacement = lightingReplacement;
    this.lightingReplacementService.baselineData = lightingReplacement.baseline;
    this.lightingReplacementService.modificationData = lightingReplacement.modifications;
    this.selectedEditOpportunitySheet = lightingReplacement.opportunitySheet;
    this.selectCalc('lighting-replacement');
  }

  saveEditLighting(updatedData: LightingReplacementTreasureHunt) {
    this.selectedEditLightingReplacement.baseline = updatedData.baseline;
    this.selectedEditLightingReplacement.modifications = updatedData.modifications;
    this.saveCalcModal.show();
  }

  saveLighting(){
    this.treasureHunt.lightingReplacements[this.selectedEditIndex] = this.selectedEditLightingReplacement;
    this.emitUpdateTreasureHunt.emit(this.treasureHunt);
    this.selectedEditLightingReplacement = undefined;
    this.selectedEditOpportunitySheet = undefined;
    this.saveCalcModal.hide();
  }

  showOpportunitySheetModal(){
    this.opportunitySheetModal.show();
  }
}
