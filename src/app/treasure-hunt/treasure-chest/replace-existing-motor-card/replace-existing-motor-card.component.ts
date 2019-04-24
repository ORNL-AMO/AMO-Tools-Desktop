import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ReplaceExistingMotorTreasureHunt, TreasureHunt, OpportunitySheet } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { ReplaceExistingResults } from '../../../shared/models/calculators';
import { ReplaceExistingService } from '../../../calculator/motors/replace-existing/replace-existing.service';

@Component({
  selector: 'app-replace-existing-motor-card',
  templateUrl: './replace-existing-motor-card.component.html',
  styleUrls: ['./replace-existing-motor-card.component.css']
})
export class ReplaceExistingMotorCardComponent implements OnInit {
  @Input()
  replaceExistingMotor: ReplaceExistingMotorTreasureHunt;
  @Input()
  settings: Settings;
  @Input()
  index: number;
  @Output('emitEditOpportunitySheet')
  emitEditOpportunitySheet = new EventEmitter<OpportunitySheet>();
  @Output('emitEditReplaceExistingMotor')
  emitEditReplaceExistingMotor = new EventEmitter<ReplaceExistingMotorTreasureHunt>();
  @Input()
  treasureHunt: TreasureHunt;
  @Output('emitDeleteReplaceExistingMotor')
  emitDeleteReplaceExistingMotor = new EventEmitter<string>();
  @Output('emitSaveTreasureHunt')
  emitSaveTreasureHunt = new EventEmitter<boolean>();


  replaceExistingMotorResults: ReplaceExistingResults;
  percentSavings: number;
  constructor(private replaceExistingService: ReplaceExistingService) { }

  ngOnInit() {
    this.replaceExistingMotorResults = this.replaceExistingService.getResults(this.replaceExistingMotor.replaceExistingData);
    this.percentSavings = (this.replaceExistingMotorResults.costSavings / this.treasureHunt.currentEnergyUsage.electricityCosts) * 100;
  }

  editOpportunitySheet() {
    this.emitEditOpportunitySheet.emit(this.replaceExistingMotor.opportunitySheet);
  }

  editMotorReplacement() {
    this.emitEditReplaceExistingMotor.emit(this.replaceExistingMotor);
  }

  toggleSelected() {
    this.replaceExistingMotor.selected = !this.replaceExistingMotor.selected;
    this.emitSaveTreasureHunt.emit(true);
  }

  deleteMotorReplacement() {
    let name: string = 'Replace Motor #' + (this.index + 1);
    if (this.replaceExistingMotor.opportunitySheet && this.replaceExistingMotor.opportunitySheet.name) {
      name = this.replaceExistingMotor.opportunitySheet.name;
    }
    this.emitDeleteReplaceExistingMotor.emit(name);
  }

}
