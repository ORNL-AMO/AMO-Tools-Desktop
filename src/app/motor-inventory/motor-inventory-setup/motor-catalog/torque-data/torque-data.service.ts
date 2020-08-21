import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TorqueData } from '../../../motor-inventory';

@Injectable()
export class TorqueDataService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromTorqueData(torqueData: TorqueData): FormGroup {
    return this.formBuilder.group({
      torqueFullLoad: [torqueData.torqueFullLoad, [Validators.min(0)]],
      torqueBreakDown: [torqueData.torqueBreakDown, [Validators.min(0)]],
      torqueLockedRotor: [torqueData.torqueLockedRotor, [Validators.min(0)]],
    });
  }

  updateTorqueDataFromForm(form: FormGroup, torqueData: TorqueData): TorqueData {
    torqueData.torqueFullLoad= form.controls.torqueFullLoad.value;
    torqueData.torqueBreakDown= form.controls.torqueBreakDown.value;
    torqueData.torqueLockedRotor= form.controls.torqueLockedRotor.value;
    return torqueData;
  }
}
