import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompressedAirItem } from '../../../compressed-air-inventory';

@Injectable()
export class CompressedAirBasicsService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromCompressedAirItem(compressedAirItem: CompressedAirItem): FormGroup {
    return this.formBuilder.group({
      name: [compressedAirItem.name, Validators.required],
      description: [compressedAirItem.description],
      notes: [compressedAirItem.notes],
    });
  }

  updateCompressedAirItemFromForm(form: FormGroup, compressedAirItem: CompressedAirItem): CompressedAirItem {
    compressedAirItem.name = form.controls.name.value
    compressedAirItem.description = form.controls.description.value
    compressedAirItem.notes = form.controls.notes.value
    return compressedAirItem;
  }
}