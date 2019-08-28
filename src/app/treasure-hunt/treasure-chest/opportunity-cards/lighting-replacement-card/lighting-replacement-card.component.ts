import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { LightingReplacementTreasureHunt, OpportunitySheet, TreasureHunt } from '../../../../shared/models/treasure-hunt';
import { Settings } from '../../../../shared/models/settings';
import { OpportunityCardData } from '../opportunity-cards.service';

@Component({
  selector: 'app-lighting-replacement-card',
  templateUrl: './lighting-replacement-card.component.html',
  styleUrls: ['./lighting-replacement-card.component.css']
})
export class LightingReplacementCardComponent implements OnInit {
  @Input()
  cardData: OpportunityCardData;
  @Input()
  settings: Settings;
  @Output('emitEditOpportunitySheet')
  emitEditOpportunitySheet = new EventEmitter<OpportunitySheet>();
  @Output('emitEditLighting')
  emitEditLighting = new EventEmitter<LightingReplacementTreasureHunt>();


  cardItemLabel: string;
  constructor() { }

  ngOnInit() {
    if (this.cardData.lightingReplacement.opportunitySheet && this.cardData.lightingReplacement.opportunitySheet.name) {
      this.cardItemLabel = this.cardData.lightingReplacement.opportunitySheet.name;
    } else {
      this.cardItemLabel = 'Lighting Replacement #' + (this.cardData.opportunityIndex + 1);
    }
  }


  editOpportunitySheet() {
   // this.emitEditOpportunitySheet.emit(this.replacement.opportunitySheet);
  }

  editLighting() {
   // this.emitEditLighting.emit(this.replacement);
  }

  // toggleSelected() {
  //   this.replacement.selected = !this.replacement.selected;
  //   this.emitSaveTreasureHunt.emit(true);
  // }

  // deleteItem() {
  //   let name: string = 'Lighting Replacement #' + (this.index + 1);
  //   if (this.replacement.opportunitySheet && this.replacement.opportunitySheet.name) {
  //     name = this.replacement.opportunitySheet.name;
  //   }
  //   this.emitDeleteItem.emit(name);
  // }
}
