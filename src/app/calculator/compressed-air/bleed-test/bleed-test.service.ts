import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) {
    this.bleedTestInput = new BehaviorSubject<BleedTestInput>(undefined);
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.bleedTestOutput = new BehaviorSubject<number>(undefined);
  }


  initDefaultEmptyInputs() {
    let emptyBleedTest: BleedTestInput = {
      totalSystemVolume: 0,
      normalOperatingPressure: 150,
      testPressure: 0,
      time: 0
    }
    this.bleedTestInput.next(emptyBleedTest);
  }


  getExampleData(settings: Settings): BleedTestInput {
    let emptyBleedTest: BleedTestInput = {
      totalSystemVolume: 100,
      normalOperatingPressure: 150,
      testPressure: 75,
      time: 120
    }
    emptyBleedTest = this.convertBleedTestExample(emptyBleedTest, settings);
    this.bleedTestInput.next(emptyBleedTest);
    return emptyBleedTest;
  }

  convertBleedTestExample(inputs: BleedTestInput, settings: Settings): BleedTestInput {
    let copyInputs: BleedTestInput = inputs;
    if (settings.unitsOfMeasure == 'Metric') {
      copyInputs.totalSystemVolume = Math.round(this.convertUnitsService.value(copyInputs.totalSystemVolume).from('ft3').to('m3') * 100) / 100;
      copyInputs.normalOperatingPressure = Math.round(this.convertUnitsService.value(copyInputs.normalOperatingPressure).from('psig').to('barg') * 100) / 100;
      copyInputs.testPressure = Math.round(this.convertUnitsService.value(copyInputs.testPressure).from('psig').to('barg') * 100) / 100;
    }
    return copyInputs;
  }

  calculate(settings: Settings) {
    let leakage: number;
    let inputs: BleedTestInput = this.bleedTestInput.value;
    let copyInputs: BleedTestInput = JSON.parse(JSON.stringify(inputs));
    let validInput: boolean = this.getBleedFormFromObj(copyInputs).valid;
    if (!validInput) {
      this.bleedTestOutput.next(undefined);
    } else {
      if (settings.unitsOfMeasure == 'Metric') {
        copyInputs.totalSystemVolume = this.convertUnitsService.value(copyInputs.totalSystemVolume).from('m3').to('ft3');
        copyInputs.normalOperatingPressure = this.convertUnitsService.value(copyInputs.normalOperatingPressure).from('barg').to('psig');
        copyInputs.testPressure = this.convertUnitsService.value(copyInputs.testPressure).from('barg').to('psig');
      }
      
      let leakageNumerator: number = copyInputs.totalSystemVolume * (copyInputs.normalOperatingPressure - copyInputs.testPressure);
      let leakageDenominator: number = copyInputs.time * 14.7;
      // ft3/min
      let leakageResult: number = (leakageNumerator / leakageDenominator) * 1.25;

      if (settings.unitsOfMeasure == 'Metric') {
        leakageResult = this.convertUnitsService.value(leakageResult).from('ft3/min').to('m3/min');
      }
      this.bleedTestOutput.next(leakageResult);
    }
  }

  getBleedFormFromObj(inputObj: BleedTestInput): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      totalSystemVolume: [inputObj.totalSystemVolume],
      normalOperatingPressure: [inputObj.normalOperatingPressure],
      testPressure: [inputObj.testPressure],
      time: [inputObj.time]

    });
    form = this.setValidators(form);
    return form;
  }

  getBleedTestObjFromForm(form: UntypedFormGroup): BleedTestInput {
    form = this.setValidators(form);
    let bleedTestInput: BleedTestInput = {
      totalSystemVolume: form.controls.totalSystemVolume.value,
      normalOperatingPressure: form.controls.normalOperatingPressure.value,
      testPressure: form.controls.testPressure.value,
      time: form.controls.time.value
    }
    return bleedTestInput;
  }

  setValidators(form: UntypedFormGroup): UntypedFormGroup {
    form.controls.totalSystemVolume.setValidators([Validators.required, Validators.min(0)]);
    form.controls.normalOperatingPressure.setValidators([Validators.required, Validators.min(0)]);
    form.controls.testPressure.setValidators([Validators.required, Validators.min(0), Validators.max(form.controls.normalOperatingPressure.value)]);
    form.controls.time.setValidators([Validators.required, Validators.min(0)]);
    return form;
  }

}
