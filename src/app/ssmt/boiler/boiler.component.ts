import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-boiler',
  templateUrl: './boiler.component.html',
  styleUrls: ['./boiler.component.css']
})
export class BoilerComponent implements OnInit {
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  fuelOptions: Array<string> =[
    'Natural Gas',
    'Coal',
    'Heavy Fuel Oil',
    'Tires'
  ];

  constructor() { }

  ngOnInit() {
  }

  save(){

  }

  focus(){

  }

  focusOut(){

  }
}
