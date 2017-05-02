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
  toggleCalculate: boolean = true;
  constructor(private formBuilder: FormBuilder, private psatService: PsatService) { }

  ngOnInit() {
    if (!this.psat) {
      this.efficiencyForm = this.psatService.initForm();
    } else {
      this.efficiencyForm = this.psatService.getFormFromPsat(this.psat.inputs);
    }
  }

  calculate() {
    this.toggleCalculate = !this.toggleCalculate;
  }

}
