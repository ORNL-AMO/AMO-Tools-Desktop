import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModelingOptions, WasteWater } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';
import { ModelingOptionsFormService } from './modeling-options-form.service';

@Component({
  selector: 'app-modeling-options-form',
  templateUrl: './modeling-options-form.component.html',
  styleUrls: ['./modeling-options-form.component.css']
})
export class ModelingOptionsFormComponent implements OnInit {
  @Input()
  isModification: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;

  form: FormGroup;
  constructor(private wasteWaterService: WasteWaterService, private modelingOptionsFormService: ModelingOptionsFormService) { }

  ngOnInit(): void {
    let wasteWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    this.form = this.modelingOptionsFormService.getFormFromObj(wasteWater.modelingOptions);
  }

  save() {
    let modelingOptions: ModelingOptions = this.modelingOptionsFormService.getObjFromForm(this.form);
    let wastWater: WasteWater = this.wasteWaterService.wasteWater.getValue();
    wastWater.modelingOptions = modelingOptions;
    this.wasteWaterService.wasteWater.next(wastWater);
  }

  focusField(str: string) {

  }
}
