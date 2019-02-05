import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TurbineInput, CondensingTurbine, PressureTurbine } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { TurbineService } from './turbine.service';
import { SsmtService } from '../ssmt.service';

@Component({
  selector: 'app-turbine',
  templateUrl: './turbine.component.html',
  styleUrls: ['./turbine.component.css']
})
export class TurbineComponent implements OnInit {
  @Input()
  turbineInput: TurbineInput;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<TurbineInput>();
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  numberOfHeaders: number;

  condensingTurbineForm: FormGroup;
  highToLowTurbineForm: FormGroup;
  highToMediumTurbineForm: FormGroup;
  mediumToLowTurbineForm: FormGroup;
  idString: string = 'baseline_';
  constructor(private turbineService: TurbineService, private ssmtService: SsmtService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = 'modification_';
    }
    if (!this.turbineInput) {
      this.turbineInput = this.turbineService.initTurbineInputObj();
    }
    this.initForms();
  }

  initForms() {
    if (this.turbineInput.condensingTurbine) {
      this.condensingTurbineForm = this.turbineService.getCondensingFormFromObj(this.turbineInput.condensingTurbine, this.settings);
    } else {
      this.condensingTurbineForm = this.turbineService.initCondensingTurbineForm(this.settings);
    }
    if (this.turbineInput.highToLowTurbine) {
      this.highToLowTurbineForm = this.turbineService.getPressureFormFromObj(this.turbineInput.highToLowTurbine);

    } else {
      this.highToLowTurbineForm = this.turbineService.initPressureForm();
    }
    if (this.turbineInput.highToMediumTurbine) {
      this.highToMediumTurbineForm = this.turbineService.getPressureFormFromObj(this.turbineInput.highToMediumTurbine);

    } else {
      this.highToMediumTurbineForm = this.turbineService.initPressureForm();
    }
    if (this.turbineInput.mediumToLowTurbine) {
      this.mediumToLowTurbineForm = this.turbineService.getPressureFormFromObj(this.turbineInput.mediumToLowTurbine);

    } else {
      this.mediumToLowTurbineForm = this.turbineService.initPressureForm();
    }
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }

  saveCondensingTurbine() {
    let tmpCondensingTurbine: CondensingTurbine = this.turbineService.getCondensingTurbineFromForm(this.condensingTurbineForm);
    this.turbineInput.condensingTurbine = tmpCondensingTurbine;
    this.emitSave.emit(this.turbineInput);
  }

  saveHighLowPressureTurbine() {
    let tmpPressureTurbine: PressureTurbine = this.turbineService.getPressureTurbineFromForm(this.highToLowTurbineForm);
    this.turbineInput.highToLowTurbine = tmpPressureTurbine;
    this.emitSave.emit(this.turbineInput)
  }

  saveHighMediumPressureTurbine() {
    let tmpPressureTurbine: PressureTurbine = this.turbineService.getPressureTurbineFromForm(this.highToMediumTurbineForm);
    this.turbineInput.highToMediumTurbine = tmpPressureTurbine;
    this.emitSave.emit(this.turbineInput)
  }

  saveMediumLowPressureTurbine() {
    let tmpPressureTurbine: PressureTurbine = this.turbineService.getPressureTurbineFromForm(this.mediumToLowTurbineForm);
    this.turbineInput.mediumToLowTurbine = tmpPressureTurbine;
    this.emitSave.emit(this.turbineInput)
  }
}
