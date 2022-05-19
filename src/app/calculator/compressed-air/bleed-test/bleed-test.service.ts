import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { BleedTestInput } from '../../../shared/models/standalone';

@Injectable()
export class BleedTestService {
  bleedTestInput: BehaviorSubject<BleedTestInput>;
  bleedTestOutput: BehaviorSubject<number>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  settings: Settings;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { 
    this.bleedTestInput = new BehaviorSubject<BleedTestInput>(undefined);
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.bleedTestOutput = new BehaviorSubject<number>(undefined);
  }


  initDefaultEmptyInputs() {
    let emptyBleedTest = {
      totalSystemVolume: 0,
      normalOperatingPressure: 150,
      testPressure: 0,
      time: 0
    }    
    this.bleedTestInput.next(emptyBleedTest);
  }


  getExampleData(): BleedTestInput {
    let emptyBleedTest = {
      totalSystemVolume: 100,
      normalOperatingPressure: 150,
      testPressure: 75,
      time: 120
    }
    this.bleedTestInput.next(emptyBleedTest);
    return emptyBleedTest;
  }

  convertBleedTestExample(inputs: BleedTestInput, settings: Settings): BleedTestInput {
    let tmpInputs: BleedTestInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpInputs.totalSystemVolume = Math.round(this.convertUnitsService.value(tmpInputs.totalSystemVolume).from('ft3').to('m3') * 100) / 100;
      tmpInputs.normalOperatingPressure = Math.round(this.convertUnitsService.value(tmpInputs.normalOperatingPressure).from('psig').to('kPa') * 100) / 100;
      tmpInputs.testPressure = Math.round(this.convertUnitsService.value(tmpInputs.testPressure).from('psig').to('kPa') * 100) / 100;
    }
    return tmpInputs;
  }

  calculate(settings: Settings) {
    let leakage: number;    
    let inputs: BleedTestInput = this.bleedTestInput.value;
    let tmpInputs: BleedTestInput = JSON.parse(JSON.stringify(inputs));
    let validInput: boolean = this.getBleedFormFromObj(tmpInputs).valid;
    if(!validInput){
      leakage = undefined;
      this.bleedTestOutput.next(leakage);
    } else {
      if (settings.unitsOfMeasure == 'Metric') {
        tmpInputs.totalSystemVolume = this.convertUnitsService.value(tmpInputs.totalSystemVolume).from('m3').to('ft3');
        tmpInputs.normalOperatingPressure = this.convertUnitsService.value(tmpInputs.normalOperatingPressure).from('kPa').to('psig');
        tmpInputs.testPressure = this.convertUnitsService.value(tmpInputs.testPressure).from('kPa').to('psig');
      }
      leakage = (tmpInputs.totalSystemVolume * (tmpInputs.normalOperatingPressure - tmpInputs.testPressure) / tmpInputs.time * 14.7 ) * 1.25;
      this.bleedTestOutput.next(leakage);
    }
  }

  getBleedFormFromObj(inputObj: BleedTestInput): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      totalSystemVolume: [inputObj.totalSystemVolume],
      normalOperatingPressure: [inputObj.normalOperatingPressure],
      testPressure: [inputObj.testPressure],
      time: [inputObj.time]
      
    });
    form = this.setValidators(form);
    return form;
  }

  getBleedTestObjFromForm(form: FormGroup): BleedTestInput{
    form = this.setValidators(form);
    let bleedTestInput: BleedTestInput = {
      totalSystemVolume: form.controls.totalSystemVolume.value,
      normalOperatingPressure: form.controls.normalOperatingPressure.value,
      testPressure: form.controls.testPressure.value,
      time: form.controls.time.value
    }
    return bleedTestInput;
  }

  setValidators(form: FormGroup): FormGroup {
    form.controls.totalSystemVolume.setValidators([Validators.required, Validators.min(0)]);
    form.controls.normalOperatingPressure.setValidators([Validators.required, Validators.min(0)]);
    form.controls.testPressure.setValidators([Validators.required, Validators.min(0), Validators.max(form.controls.normalOperatingPressure.value)]);
    form.controls.time.setValidators([Validators.required, Validators.min(0)]);
    return form;
  }

}
