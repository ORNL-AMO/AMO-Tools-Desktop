import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { TreasureHunt, LightingReplacementTreasureHunt, OpportunitySheet, ReplaceExistingMotorTreasureHunt, MotorDriveInputsTreasureHunt, NaturalGasReductionTreasureHunt, ElectricityReductionTreasureHunt, CompressedAirReductionTreasureHunt } from '../../shared/models/treasure-hunt';
import { ModalDirective } from 'ngx-bootstrap';
import { Settings } from '../../shared/models/settings';
import { ReplaceExistingData, MotorDriveInputs } from '../../shared/models/calculators';

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
  newMotorDrive: MotorDriveInputsTreasureHunt;
  newNaturalGasReductionTreasureHunt: NaturalGasReductionTreasureHunt;
  newElectricityReductionTreasureHunt: ElectricityReductionTreasureHunt;
  newCompressedAirReductionTreasureHunt: CompressedAirReductionTreasureHunt;


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

  closeSaveCalcModalAndSave() {
    this.closeSaveCalcModal();
    this.newOpportunitySheet = undefined;
    this.showOpportunitySheetOnSave = true;
    this.selectCalc('none');
    this.emitSave.emit(this.treasureHunt);
  }

  saveNewCalc() {
    if (this.selectedCalc == 'lighting-replacement') {
      this.saveLighting();
    } else if (this.selectedCalc == 'replace-existing') {
      this.saveReplaceExistingMotor();
    } else if (this.selectedCalc == 'motor-drive') {
      this.saveMotorDrive();
    } else if (this.selectedCalc == 'natural-gas-reduction') {
      this.saveNaturalGasReduction();
    } else if (this.selectedCalc == 'electricity-reduction') {
      this.saveElectricityReduction();
    } else if (this.selectedCalc == 'compressed-air-reduction') {
      this.saveCompressedAirReduction();
    }
  }

  showOpportunitySheetModal() {
    this.opportunitySheetModal.show();
  }

  hideOpportunitySheetModal() {
    this.opportunitySheetModal.hide();
  }
  //lighting replacement
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
    if (!this.treasureHunt.lightingReplacements) {
      this.treasureHunt.lightingReplacements = new Array<LightingReplacementTreasureHunt>();
    }
    this.newLightingCalc.opportunitySheet = this.newOpportunitySheet;
    this.treasureHunt.lightingReplacements.push(this.newLightingCalc);
    this.closeSaveCalcModalAndSave();
  }

  //standalone opp sheets
  saveNewOpportunitySheet(newSheet: OpportunitySheet) {
    if (!this.treasureHunt.opportunitySheets) {
      this.treasureHunt.opportunitySheets = new Array<OpportunitySheet>();
    }
    this.treasureHunt.opportunitySheets.push(newSheet);
    this.selectCalc('none');
    this.emitSave.emit(this.treasureHunt);
  }

  saveOpportunitySheet(newOppSheet: OpportunitySheet) {
    this.newOpportunitySheet = newOppSheet;
    this.showOpportunitySheetOnSave = false;
    this.hideOpportunitySheetModal();
  }

  //replace existing
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
    this.newReplaceExistingMotor.opportunitySheet = this.newOpportunitySheet;
    this.treasureHunt.replaceExistingMotors.push(this.newReplaceExistingMotor);
    this.closeSaveCalcModalAndSave();
  }

  //motor drive
  saveNewMotorDrive(motorDriveInputs: MotorDriveInputs) {
    this.newMotorDrive = {
      motorDriveInputs: motorDriveInputs,
      selected: true,
      opportunitySheet: this.newOpportunitySheet
    }
    if (!this.newMotorDrive.opportunitySheet) {
      this.showOpportunitySheetOnSave = true;
    }
    this.saveCalcModal.show();
  }

  saveMotorDrive() {
    if (!this.treasureHunt.motorDrives) {
      this.treasureHunt.motorDrives = new Array<MotorDriveInputsTreasureHunt>();
    }
    this.newMotorDrive.opportunitySheet = this.newOpportunitySheet;
    this.treasureHunt.motorDrives.push(this.newMotorDrive);
    this.closeSaveCalcModalAndSave();
  }

  //natural gas reduction
  saveNewNaturalGasReduction(ngReductionTh: NaturalGasReductionTreasureHunt) {
    this.newNaturalGasReductionTreasureHunt = ngReductionTh;
    this.newNaturalGasReductionTreasureHunt.selected = true;
    if (!this.newOpportunitySheet) {
      this.showOpportunitySheetOnSave = true;
    }
    this.newNaturalGasReductionTreasureHunt.opportunitySheet = this.newOpportunitySheet;
    this.saveCalcModal.show();
  }

  saveNaturalGasReduction() {
    if (!this.treasureHunt.naturalGasReductions) {
      this.treasureHunt.naturalGasReductions = new Array<NaturalGasReductionTreasureHunt>();
    }
    this.newNaturalGasReductionTreasureHunt.opportunitySheet = this.newOpportunitySheet;
    this.treasureHunt.naturalGasReductions.push(this.newNaturalGasReductionTreasureHunt);
    this.closeSaveCalcModalAndSave();
  }

  //electricity reduction
  saveNewElectricityReduction(electricityReductionTh: ElectricityReductionTreasureHunt) {
    this.newElectricityReductionTreasureHunt = electricityReductionTh;
    this.newElectricityReductionTreasureHunt.selected = true;
    if (!this.newOpportunitySheet) {
      this.showOpportunitySheetOnSave = true;
    }
    this.newElectricityReductionTreasureHunt.opportunitySheet = this.newOpportunitySheet;
    this.saveCalcModal.show();
  }

  saveElectricityReduction() {
    if (!this.treasureHunt.electricityReductions) {
      this.treasureHunt.electricityReductions = new Array<ElectricityReductionTreasureHunt>();
    }
    this.newElectricityReductionTreasureHunt.opportunitySheet = this.newOpportunitySheet;
    this.treasureHunt.electricityReductions.push(this.newElectricityReductionTreasureHunt);
    this.closeSaveCalcModalAndSave();
  }

  //compressed air reduction
  saveNewCompressedAirReduction(compressedAirReductionTh: CompressedAirReductionTreasureHunt) {
    this.newCompressedAirReductionTreasureHunt = compressedAirReductionTh;
    this.newCompressedAirReductionTreasureHunt.selected = true;
    if (!this.newOpportunitySheet) {
      this.showOpportunitySheetOnSave = true;
    }
    this.newCompressedAirReductionTreasureHunt.opportunitySheet = this.newOpportunitySheet;
    this.saveCalcModal.show();
  }

  saveCompressedAirReduction() {
    if (!this.treasureHunt.compressedAirReductions) {
      this.treasureHunt.compressedAirReductions = new Array<CompressedAirReductionTreasureHunt>();
    }
    this.newCompressedAirReductionTreasureHunt.opportunitySheet = this.newOpportunitySheet;
    this.treasureHunt.compressedAirReductions.push(this.newCompressedAirReductionTreasureHunt);
    this.closeSaveCalcModalAndSave();
  }
}
