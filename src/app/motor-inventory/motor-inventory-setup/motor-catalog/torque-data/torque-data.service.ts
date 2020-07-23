import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TorqueData } from '../../../motor-inventory';

@Injectable()
export class TorqueDataService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromTorqueData(torqueData: TorqueData): FormGroup {
    return this.formBuilder.group({
      torqueFullLoad: [torqueData.torqueFullLoad],
      torqueBreakDown: [torqueData.torqueBreakDown],
      torqueLockedRotor: [torqueData.torqueLockedRotor],
    });
  }

  updateTorqueDataFromForm(form: FormGroup, torqueData: TorqueData): TorqueData {
    torqueData.torqueFullLoad= form.controls.torqueFullLoad.value;
    torqueData.torqueBreakDown= form.controls.torqueBreakDown.value;
    torqueData.torqueLockedRotor= form.controls.torqueLockedRotor.value;
    return torqueData;
  }
}
