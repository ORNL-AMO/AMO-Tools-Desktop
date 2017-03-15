import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-field-data-help',
  templateUrl: './field-data-help.component.html',
  styleUrls: ['./field-data-help.component.css']
})
export class FieldDataHelpComponent implements OnInit {
  @Input()
  currentField: string;

  defaultOpen: boolean = false;
  operatingFractionOpen: boolean = false;
  costKwHrOpen: boolean = false;
  flowRateOpen: boolean = false;
  headOpen: boolean = false;
  loadEstimatedMethodOpen: boolean = false;
  motorKWOpen: boolean = false;
  voltageOpen: boolean = false;
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
