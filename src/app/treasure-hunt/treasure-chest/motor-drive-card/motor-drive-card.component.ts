import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MotorDriveInputsTreasureHunt, OpportunitySheet, TreasureHunt } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { MotorDriveService } from '../../../calculator/motors/motor-drive/motor-drive.service';
import { MotorDriveOutputs } from '../../../shared/models/calculators';

@Component({
  selector: 'app-motor-drive-card',
  templateUrl: './motor-drive-card.component.html',
  styleUrls: ['./motor-drive-card.component.css']
})
export class MotorDriveCardComponent implements OnInit {
  @Input()
  motorDrive: MotorDriveInputsTreasureHunt;
  @Input()
  settings: Settings;
  @Input()
  index: number;
  @Output('emitEditOpportunitySheet')
  emitEditOpportunitySheet = new EventEmitter<OpportunitySheet>();
  @Output('emitEditItem')
  emitEditItem = new EventEmitter<MotorDriveInputsTreasureHunt>();
  @Input()
  treasureHunt: TreasureHunt;
  @Output('emitDeleteItem')
  emitDeleteItem = new EventEmitter<string>();
  @Output('emitSaveTreasureHunt')
  emitSaveTreasureHunt = new EventEmitter<boolean>();

  motorDriveResults: MotorDriveOutputs;
  percentSavings: number;
  constructor(private motorDriveService: MotorDriveService) { }

  ngOnInit() {
    this.motorDriveResults = this.motorDriveService.getResults(this.motorDrive.motorDriveInputs);
    this.percentSavings = (this.motorDriveResults.annualCostSavings / this.treasureHunt.currentEnergyUsage.electricityCosts) * 100;
  }

  editOpportunitySheet() {
    this.emitEditOpportunitySheet.emit(this.motorDrive.opportunitySheet);
  }

  editItem() {
    this.emitEditItem.emit(this.motorDrive);
  }

  toggleSelected() {
    this.motorDrive.selected = !this.motorDrive.selected;
    this.emitSaveTreasureHunt.emit(true);
  }

  deleteItem() {
    let name: string = 'Motor Drive #' + (this.index + 1);
    if (this.motorDrive.opportunitySheet && this.motorDrive.opportunitySheet.name) {
      name = this.motorDrive.opportunitySheet.name;
    }
    this.emitDeleteItem.emit(name);
  }
}
