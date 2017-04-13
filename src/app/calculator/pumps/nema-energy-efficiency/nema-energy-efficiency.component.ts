import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
@Component({
  selector: 'app-nema-energy-efficiency',
  templateUrl: './nema-energy-efficiency.component.html',
  styleUrls: ['./nema-energy-efficiency.component.css']
})
export class NemaEnergyEfficiencyComponent implements OnInit {
  @Input()
  psat: PSAT;

  nemaForm: any;

  constructor(private formBuilder: FormBuilder, private psatService: PsatService) { }

  ngOnInit() {
    if (!this.psat) {
      this.nemaForm = this.psatService.initForm();
      this.nemaForm.patchValue({
        frequency: '50 Hz',
        horsePower: '5',
        efficiencyClass: 'Standard Efficiency',
        motorRPM: 1
      })
    } else {
      this.nemaForm = this.psatService.getFormFromPsat(this.psat.inputs);

    }
  }
}
