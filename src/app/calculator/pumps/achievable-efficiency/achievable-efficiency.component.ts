import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';

@Component({
  selector: 'app-achievable-efficiency',
  templateUrl: './achievable-efficiency.component.html',
  styleUrls: ['./achievable-efficiency.component.css']
})
export class AchievableEfficiencyComponent implements OnInit {
  @Input()
  psat: PSAT;

  efficiencyForm: any;
  constructor(private formBuilder: FormBuilder, private psatService: PsatService) { }

  ngOnInit() {
    this.efficiencyForm = this.initForm();
    if (this.psat) {
      if (this.psat.inputs) {
        this.efficiencyForm.patchValue({
          flowRate: this.psat.inputs.flow_rate,
          pumpType: this.psat.inputs.pump_style
        })
      }
    }
  }

  initForm() {
    return this.formBuilder.group({
      'flowRate': [''],
      'units': [''],
      'pumpType': ['']
    })
  }

}
