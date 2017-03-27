import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import {SystemCurveGraphComponent} from '../system-curve-graph/system-curve-graph.component';

@Component({
  selector: 'app-system-curve-form',
  templateUrl: './system-curve-form.component.html',
  styleUrls: ['./system-curve-form.component.css']
})
export class SystemCurveFormComponent implements OnInit {
  @Input()
  curveConstants: any;
  @Input()
  pointOne: any;
  @Input()
  pointTwo: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Output('calculateP1')
  calculateP1 = new EventEmitter<boolean>();
  @Output('calculateP2')
  calculateP2 = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  checkInputs(){
    let p1 = this.checkForm(this.pointOne);
    let p2 = this.checkForm(this.pointTwo);
    let cc = this.checkForm(this.curveConstants);
    if(p1){
      this.calculateP1.emit(true);
    }
    if(p2){
      this.calculateP2.emit(true);
    }
    if(p1 && p2 && cc){
      this.calculate.emit(true);
    }
  }

  checkForm(point: any){
    if(point.form.status == "VALID"){
      return true;
    }
    else{
      return false;
    }
  }

}
