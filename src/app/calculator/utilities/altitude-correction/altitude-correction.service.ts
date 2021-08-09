import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class AltitudeCorrectionService {

  currentField: BehaviorSubject<string>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;

  altitudeCorrectionInputs: BehaviorSubject<number>; 
  altitudeCorrectionOutputs: BehaviorSubject<number>;

  constructor(private convertUnitsService: ConvertUnitsService, private formBuilder: FormBuilder) {
    this.currentField = new BehaviorSubject<string>('default');
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.altitudeCorrectionInputs = new BehaviorSubject<number>(undefined);
    this.altitudeCorrectionOutputs = new BehaviorSubject<number>(undefined);
  }

  getFormFromObj(inputData: number): FormGroup {
    let form = this.formBuilder.group({
      altitude: [inputData, Validators.required]
    });
    return form;
  }

  getObjFromForm(form: FormGroup): number {
    let altitude: number = form.controls.altitude.value;
    return altitude;
  }

  initDefaultData() {
    let altitude: number = 0;
    this.altitudeCorrectionInputs.next(altitude);
    this.initDefualtResults();
  }

  initDefualtResults(){
    this.altitudeCorrectionOutputs.next(undefined);
  }

  initExampleData(settings: Settings) {
    let altitude: number = 830;
    if (settings.unitsOfMeasure == 'Metric') {
      altitude = this.convertUnitsService.value(altitude).from('m').to('ft')
    }
    this.altitudeCorrectionInputs.next(altitude);
  }

  calculateBarometricPressure(settings: Settings) {
    let altitude: number = this.altitudeCorrectionInputs.getValue();
    if (settings.unitsOfMeasure != 'Metric') {
      altitude = this.convertUnitsService.value(altitude).from('ft').to('m');
    }
    let parensOp: number = 1 - .0000225577 * altitude;
    let exponentOp: number = Math.pow(parensOp, 5.2559);
    let barometricPressure: number = 101.325 * exponentOp;
    if (settings.unitsOfMeasure != 'Metric') {
      barometricPressure = this.convertUnitsService.value(barometricPressure).from('kPaa').to('inHg');
    }
    this.altitudeCorrectionOutputs.next(barometricPressure);
  }

}
