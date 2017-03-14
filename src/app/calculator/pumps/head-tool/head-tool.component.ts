import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-head-tool',
  templateUrl: './head-tool.component.html',
  styleUrls: ['./head-tool.component.css']
})
export class HeadToolComponent implements OnInit {

  headToolForm: any;
  tabSelect: string = 'help';

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.headToolForm = this.initForm();
  }

  initForm() {
    return this.formBuilder.group({
      'type': [''],
      'suctionPipeDiameter': [''],
      'overpressure': [''],
      'surfaceElevation': [''],
      'suctionLossCoefficients': [''],
      'dischargePipeDiameter': [''],
      'dischargePressure': [''],
      'dischargeElevation': [''],
      'dischargeLineCoefficients': [''],
      'specificGravity': [''],
      'flowRate': [''],
    })
  }

}
