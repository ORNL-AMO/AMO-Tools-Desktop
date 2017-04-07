import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-nema-energy-efficiency',
  templateUrl: './nema-energy-efficiency.component.html',
  styleUrls: ['./nema-energy-efficiency.component.css']
})
export class NemaEnergyEfficiencyComponent implements OnInit {

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
  }

  initForm() {
    return this.formBuilder.group({
      ratedHorsePower: ['', Validators.required],
      synchronousRPM: ['', Validators.required]
    })
  }

}
