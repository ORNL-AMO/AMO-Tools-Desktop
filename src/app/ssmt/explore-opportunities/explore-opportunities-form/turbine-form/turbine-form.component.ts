import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SSMT } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { SsmtService } from '../../../ssmt.service';

@Component({
  selector: 'app-turbine-form',
  templateUrl: './turbine-form.component.html',
  styleUrls: ['./turbine-form.component.css']
})
export class TurbineFormComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();


  showCondensingTurbine: boolean;
  showHighToLowPressureTurbine: boolean;
  showHighToMediumPressureTurbine: boolean;
  showMediumToLowPressureTurbine: boolean;

  constructor(private ssmtService: SsmtService) { }
  ngOnInit() {
    console.log(this.ssmt);
    this.ssmt.turbineInput.mediumToLowTurbine
  }

  toggleCondensingTurbine() {

  }

  toggleHighPressureToLowPressure() {

  }

  toggleHighPressureToMediumPressure() {

  }

  toggleMediumPressureToLowPressure() {

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
