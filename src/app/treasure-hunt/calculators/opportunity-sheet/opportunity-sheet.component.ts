import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OpportunitySheet } from '../../../shared/models/treasure-hunt';
import { TreasureHuntService } from '../../treasure-hunt.service';

@Component({
  selector: 'app-opportunity-sheet',
  templateUrl: './opportunity-sheet.component.html',
  styleUrls: ['./opportunity-sheet.component.css']
})
export class OpportunitySheetComponent implements OnInit {
  @Input()
  opportunitySheet: OpportunitySheet;
  @Output('emitSave')
  emitSave = new EventEmitter<OpportunitySheet>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();

  constructor(private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    if (!this.opportunitySheet) {
      this.opportunitySheet = this.treasureHuntService.initOpportunitySheet();
    }
  }

  hideOpportunitySheetModal(){
    this.emitCancel.emit(true);
  }

  saveOpportunitySheet(){
    this.emitSave.emit(this.opportunitySheet);
  }
}
