import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';
import { BleedTestInput } from '../../../../shared/models/standalone';
import { BleedTestService } from '../bleed-test.service';

@Component({
  selector: 'app-bleed-test-form',
  templateUrl: './bleed-test-form.component.html',
  styleUrls: ['./bleed-test-form.component.css']
})
export class BleedTestFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inputs: BleedTestInput;
  @Input()
  outputs: number;
  @Output('calculate')
  calculate = new EventEmitter<BleedTestInput>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  bleedForm: FormGroup;
  
  constructor(private bleedTestService: BleedTestService) { }

  ngOnInit() {
    this.bleedForm = this.bleedTestService.getBleedFormFromObj(this.inputs);
  }
  emitChange() {
    this.inputs = this.bleedTestService.getBleedTestObjFromForm(this.bleedForm)
    this.bleedForm = this.bleedTestService.getBleedFormFromObj(this.inputs);
    this.calculate.emit(this.inputs);
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }
}
