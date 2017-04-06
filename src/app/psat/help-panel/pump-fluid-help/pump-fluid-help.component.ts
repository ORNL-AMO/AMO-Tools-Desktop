import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pump-fluid-help',
  templateUrl: './pump-fluid-help.component.html',
  styleUrls: ['./pump-fluid-help.component.css']
})
export class PumpFluidHelpComponent implements OnInit {

  @Input()
  currentField: string;

  // defaultOpen: boolean = false;
  // pumpTypeOpen: boolean = false;
  // pumpRPMOpen: boolean = false;
  // driveOpen: boolean = false;
  // kinematicViscosityOpen: boolean = false;
  // specificGravityOpen: boolean = false;
  // stagesOpen: boolean = false;
  // fixedSpecificSpeedOpen: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  // toggleOpen(bool: boolean, str: string){
  //   if(this.currentField == str){
  //     this.currentField = '';
  //   }
  //   return !bool;
  // }


}
