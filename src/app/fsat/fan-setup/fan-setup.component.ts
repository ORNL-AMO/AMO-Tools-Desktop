import { Component, OnInit } from '@angular/core';
import { FanSetupService, FanSetup } from './fan-setup.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-fan-setup',
  templateUrl: './fan-setup.component.html',
  styleUrls: ['./fan-setup.component.css']
})
export class FanSetupComponent implements OnInit {

  fanTypes: Array<string> = [
    'Airfoil (SISW)',
    'Backward Curved (SISW)',
    'Radial (SISW)',
    'Radial Tip (SISW)',
    'Backward Inclined (SISW)',
    'Airfoil (DIDW)',
    'Backward Inclined (DIDW)',
    'ICF Air handling',
    'ICF Material handling',
    'ICF Long shavings'
  ]

  drives: Array<string> = [
    'Direct Drive',
    'V-Belt Drive',
    'Notched V-Belt Drive',
    'Synchronous Belt Drive'
  ];

  tmpFormData: FanSetup = {
    fanType: 'Airfoil (SISW)',
    fanSpeed: 0,
    drive: 'Direct Drive',
    stages: 0
  }
  fanForm: FormGroup;
  constructor(private fanSetupService: FanSetupService) { }

  ngOnInit() {
    this.fanForm =  this.fanSetupService.getFormFromObj(this.tmpFormData);
  }

  focusField(){

  }

  save(){

  }

  subtractNum(){

  }

  addNum(){

  }
}
