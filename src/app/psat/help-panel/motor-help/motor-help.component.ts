import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-motor-help',
  templateUrl: './motor-help.component.html',
  styleUrls: ['./motor-help.component.css']
})
export class MotorHelpComponent implements OnInit {
  @Input()
  currentField: string;

  defaultOpen: boolean = false; 
  lineFrequencyOpen: boolean = false;
  horsePowerOpen: boolean = false;
  motorRPMOpen: boolean = false;
  efficiencyClassOpen: boolean = false;
  voltageOpen: boolean = false;
  fullLoadAmpsOpen: boolean = false;
  sizeMarginOpen: boolean = false;
  constructor() { }

  ngOnInit() {
    console.log(this.currentField)
  }

  toggleOpen(bool: boolean, str: string){
    if(this.currentField == str){
      this.currentField = '';
    }
    return !bool;
  }

}
