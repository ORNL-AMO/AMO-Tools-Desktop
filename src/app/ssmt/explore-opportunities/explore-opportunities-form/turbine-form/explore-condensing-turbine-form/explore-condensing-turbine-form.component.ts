import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../../shared/models/settings';
import { SSMT, CondensingTurbineOperationTypes } from '../../../../../shared/models/steam/ssmt';
import { SsmtService } from '../../../../ssmt.service';
import { Quantity } from '../../../../../shared/models/steam/steam-inputs';

@Component({
  selector: 'app-explore-condensing-turbine-form',
  templateUrl: './explore-condensing-turbine-form.component.html',
  styleUrls: ['./explore-condensing-turbine-form.component.css']
})
export class ExploreCondensingTurbineFormComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<SSMT>();
  @Output('emitShowTurbine')
  emitShowTurbine = new EventEmitter<boolean>();
  @Input()
  showFormToggle: boolean;

  showCondenserPressure: boolean;
  showOperation: boolean;
  turbineOptionTypes: Array<Quantity>;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.turbineOptionTypes = CondensingTurbineOperationTypes;
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.showFormToggle && !changes.showFormToggle.isFirstChange()){
      if(this.showFormToggle == false){
        this.showOperation = false;
        this.showCondenserPressure = false;
      }
    }
  }


  initForm() {
    this.initCondenserPressure();
    this.initOperationType();
    if (this.showCondenserPressure || this.showOperation) {
      this.emitShowTurbine.emit(true);
    }
  }

  initCondenserPressure() {
    if (this.ssmt.turbineInput.condensingTurbine.condenserPressure != this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine.condenserPressure) {
      this.showCondenserPressure = true;
    }
  }

  initOperationType() {
    if (this.ssmt.turbineInput.condensingTurbine.operationType != this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine.operationType ||
      this.ssmt.turbineInput.condensingTurbine.operationValue != this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine.operationValue) {
      this.showOperation = true;
    }
  }

  toggleCondenserPressure() {
    if (this.showCondenserPressure == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine.condenserPressure = this.ssmt.turbineInput.condensingTurbine.condenserPressure;
      this.save();
    }
  }

  toggleOperationType() {
    if (this.showOperation == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine.operationType = this.ssmt.turbineInput.condensingTurbine.operationType;
      this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine.operationValue = this.ssmt.turbineInput.condensingTurbine.operationValue;
      this.save();
    }
  }

  save() {
    this.emitSave.emit(this.ssmt);
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }
}
