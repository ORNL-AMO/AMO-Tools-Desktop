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

  tefc: number;
  constructor(private formBuilder: FormBuilder, private psatService: PsatService) { }

  ngOnInit() {
    debugger
    if (!this.psat) {
      this.nemaForm = this.psatService.initForm();
      console.log(this.nemaForm);
    } else {
      this.nemaForm = this.psatService.getFormFromPsat(this.psat);
      console.log(this.nemaForm);
    }
  }
}
