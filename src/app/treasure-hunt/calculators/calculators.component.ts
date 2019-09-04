import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CalculatorsService } from './calculators.service';
import { Subscription } from 'rxjs';
import { TreasureHunt, LightingReplacementTreasureHunt, WaterReductionTreasureHunt, CompressedAirPressureReductionTreasureHunt, CompressedAirReductionTreasureHunt, ElectricityReductionTreasureHunt, NaturalGasReductionTreasureHunt, MotorDriveInputsTreasureHunt, ReplaceExistingMotorTreasureHunt, OpportunitySheet } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { TreasureHuntService } from '../treasure-hunt.service';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'app-calculators',
  templateUrl: './calculators.component.html',
  styleUrls: ['./calculators.component.css']
})
export class CalculatorsComponent implements OnInit {
  @Input()
  settings: Settings;


  @ViewChild('saveCalcModal') public saveCalcModal: ModalDirective;
  @ViewChild('opportunitySheetModal') public opportunitySheetModal: ModalDirective;

  lightingReplacementTreasureHunt: LightingReplacementTreasureHunt;
  replaceExistingMotorsTreasureHunt: ReplaceExistingMotorTreasureHunt;
  motorDriveTreasureHunt: MotorDriveInputsTreasureHunt;
  naturalGasReductionTreasureHunt: NaturalGasReductionTreasureHunt;
  electricityReduction: ElectricityReductionTreasureHunt;
  compressedAirReduction: CompressedAirReductionTreasureHunt;
  compressedAirPressureReduction: CompressedAirPressureReductionTreasureHunt;
  waterReduction: WaterReductionTreasureHunt;

  selectedCalc: string;
  selectedCalcSubscription: Subscription;
  treasureHunt: TreasureHunt;
  treasureHuntSub: Subscription;

  calculatorOpportunitySheet: OpportunitySheet;
  constructor(private calculatorsService: CalculatorsService, private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    this.selectedCalcSubscription = this.calculatorsService.selectedCalc.subscribe(val => {
      this.selectedCalc = val;
    });
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
    })
  }
  ngOnDestroy() {
    this.selectedCalcSubscription.unsubscribe();
    this.treasureHuntSub.unsubscribe();
  }

  showSaveCalcModal(){
    this.saveCalcModal.show();
  }
  hideSaveCalcModal(){
    this.saveCalcModal.hide();
  }
  showOpportunitySheetModal(){
    this.opportunitySheetModal.show();
  }
  hideOpportunitySheetModal(){
    this.opportunitySheetModal.hide();
  }

  confirmSaveCalc(){
    if(this.selectedCalc == 'lighting-replacement'){
      this.confirmSaveLighting();
    }else if(this.selectedCalc == 'replace-existing'){
      this.confirmSaveReplaceExisting();
    }else if(this.selectedCalc == 'motor-drive'){
      this.confirmSaveMotorDrive();
    }else if(this.selectedCalc == 'natural-gas-reduction'){
      this.confirmSaveNaturalGasReduction();
    }
  }
  initSaveCalc(){
    this.calculatorOpportunitySheet = this.calculatorsService.calcOpportunitySheet;
    this.showSaveCalcModal();
  }
  finishSaveCalc(){
    this.hideSaveCalcModal();
    this.calculatorsService.selectedCalc.next('none');
  }

  //lighting
  cancelEditLighting() {
    this.calculatorsService.cancelLightingCalc();
  }
  saveLighting(lightingReplacementTreasureHunt: LightingReplacementTreasureHunt) {
    this.lightingReplacementTreasureHunt = lightingReplacementTreasureHunt;
    this.initSaveCalc();
  }
  confirmSaveLighting(){
    this.lightingReplacementTreasureHunt.opportunitySheet = this.calculatorOpportunitySheet;
    this.lightingReplacementTreasureHunt.selected = true;
    if (this.calculatorsService.isNewOpportunity == true) {
      this.treasureHuntService.addNewLightingReplacementTreasureHuntItem(this.lightingReplacementTreasureHunt);
    } else {
      this.treasureHuntService.editLightingReplacementTreasureHuntItem(this.lightingReplacementTreasureHunt, this.calculatorsService.itemIndex);
    }
    this.finishSaveCalc();
  }

  //replace existing
  cancelReplaceExisting(){
    this.calculatorsService.cancelReplaceExistingMotors();
  }
  saveReplaceExisting(replaceExistingTreasureHunt: ReplaceExistingMotorTreasureHunt){
    this.replaceExistingMotorsTreasureHunt = replaceExistingTreasureHunt;
    this.initSaveCalc();
  }
  confirmSaveReplaceExisting(){
    this.replaceExistingMotorsTreasureHunt.opportunitySheet = this.calculatorOpportunitySheet;
    if(this.calculatorsService.isNewOpportunity == true){
      this.treasureHuntService.addNewReplaceExistingMotorsItem(this.replaceExistingMotorsTreasureHunt);
    }else{
      this.treasureHuntService.editReplaceExistingMotorsItem(this.replaceExistingMotorsTreasureHunt, this.calculatorsService.itemIndex);
    }
    this.finishSaveCalc();
  }

  //motor drive
  cancelMotorDrive(){
    this.calculatorsService.cancelMotorDrive();
  }
  saveMotorDrive(motorDriveTreasureHunt: MotorDriveInputsTreasureHunt){
    this.motorDriveTreasureHunt = motorDriveTreasureHunt;
    this.initSaveCalc();
  }
  confirmSaveMotorDrive(){
    this.motorDriveTreasureHunt.opportunitySheet = this.calculatorOpportunitySheet;
    if(this.calculatorsService.isNewOpportunity == true){
      this.treasureHuntService.addNewMotorDrivesItem(this.motorDriveTreasureHunt);
    }else{
      this.treasureHuntService.editMotorDrivesItem(this.motorDriveTreasureHunt, this.calculatorsService.itemIndex);
    }
    this.finishSaveCalc();
  }

  //natural gas reduction
  cancelNaturalGasReduction(){
    this.calculatorsService.cancelNaturalGasReduction();
  }
  saveNaturalGasReduction(naturalGasReductionTreasureHunt: NaturalGasReductionTreasureHunt){
    this.naturalGasReductionTreasureHunt = naturalGasReductionTreasureHunt;
    this.calculatorOpportunitySheet = this.calculatorsService.calcOpportunitySheet;
    this.initSaveCalc();
  }
  confirmSaveNaturalGasReduction(){
    this.naturalGasReductionTreasureHunt.opportunitySheet = this.calculatorOpportunitySheet;
    if(this.calculatorsService.isNewOpportunity == true){
      this.treasureHuntService.addNewNaturalGasReductionsItem(this.naturalGasReductionTreasureHunt);
    }else{
      this.treasureHuntService.editNaturalGasReductionsItem(this.naturalGasReductionTreasureHunt, this.calculatorsService.itemIndex);
    }
  }
}
