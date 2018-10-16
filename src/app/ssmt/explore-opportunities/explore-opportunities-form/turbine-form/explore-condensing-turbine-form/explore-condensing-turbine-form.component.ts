import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
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
  emitSave = new EventEmitter<boolean>();
  @Output('emitShowTurbine')
  emitShowTurbine = new EventEmitter<boolean>();

  showCondenserPressure: boolean;
  showOperation: boolean;
  turbineOptionTypes: Array<Quantity>;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.turbineOptionTypes = CondensingTurbineOperationTypes;
    this.initForm();
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
    }
  }

  toggleOperationType() {
    if (this.showOperation == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine.operationType = this.ssmt.turbineInput.condensingTurbine.operationType;
      this.ssmt.modifications[this.exploreModIndex].ssmt.turbineInput.condensingTurbine.operationValue = this.ssmt.turbineInput.condensingTurbine.operationValue;
    }
  }

  save() {
    this.emitSave.emit(true);
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }
}
