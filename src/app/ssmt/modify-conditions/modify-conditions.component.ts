import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { SsmtService } from '../ssmt.service';
import { SSMT } from '../../shared/models/ssmt';
import { Assessment } from '../../shared/models/assessment';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-modify-conditions',
  templateUrl: './modify-conditions.component.html',
  styleUrls: ['./modify-conditions.component.css']
})
export class ModifyConditionsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  modificationIndex: number;
  @Input()
  modificationExists: boolean;
  @Output('emitSaveAssessment')
  emitSaveAssessment = new EventEmitter<SSMT>();
  @Input()
  containerHeight: number;
  
  modelTab: string;
  modelTabSub: Subscription;
  baselineSelected: boolean = false;
  modifiedSelected: boolean = true;
  isModalOpen: boolean = false;
  modalOpenSubscription: Subscription;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.modelTabSub = this.ssmtService.steamModelTab.subscribe(val => {
      this.modelTab = val;
    })

     this.modalOpenSubscription = this.ssmtService.modalOpen.subscribe(isOpen => {
       this.isModalOpen = isOpen;
     })
  }

  ngOnChanges() {
  }

  ngOnDestroy() {
    this.modelTabSub.unsubscribe();
    this.modalOpenSubscription.unsubscribe();
  }

  togglePanel(bool: boolean) {
    if (bool == this.baselineSelected) {
      this.baselineSelected = true;
      this.modifiedSelected = false;
    }
    else if (bool == this.modifiedSelected) {
      this.modifiedSelected = true;
      this.baselineSelected = false;
    }
  }

  addModification() {
    this.ssmtService.openNewModificationModal.next(true);
  }

  saveAssessment() {
    this.emitSaveAssessment.emit(this.assessment.ssmt);
  }

  // saveBaselineGasDensity(newGasDensity: BaseGasDensity) {
  //   this.assessment.fsat.baseGasDensity = newGasDensity;
  //   this.saveAssessment();
  // }

  // saveBaselineFanSetup(newSetup: FanSetup) {
  //   this.assessment.fsat.fanSetup = newSetup;
  //   this.saveAssessment();
  // }

  // saveBaselineFanMotor(newFanMotor: FanMotor) {
  //   this.assessment.fsat.fanMotor = newFanMotor;
  //   this.saveAssessment();
  // }

  // saveBaselineFieldData(newFieldData: FieldData) {
  //   this.assessment.fsat.fieldData = newFieldData;
  //   this.saveAssessment();
  // }

  // saveModGasDensity(newGasDensity: BaseGasDensity) {
  //   this.assessment.fsat.modifications[this.modificationIndex].fsat.baseGasDensity = newGasDensity;
  //   this.saveAssessment();
  // }

  // saveModFanSetup(newSetup: FanSetup) {
  //   this.assessment.fsat.modifications[this.modificationIndex].fsat.fanSetup = newSetup;
  //   this.saveAssessment();
  // }

  // saveModFanMotor(newFanMotor: FanMotor) {
  //   this.assessment.fsat.modifications[this.modificationIndex].fsat.fanMotor = newFanMotor;
  //   this.saveAssessment();
  // }

  // saveModFieldData(newFieldData: FieldData) {
  //   this.assessment.fsat.modifications[this.modificationIndex].fsat.fieldData = newFieldData;
  //   this.saveAssessment();
  // }

  // saveModExtra(newFsat: FSAT) {
  //   this.assessment.fsat.modifications[this.modificationIndex].fsat = newFsat;
  //   this.saveAssessment();
  // }
}
