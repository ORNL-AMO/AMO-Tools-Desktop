import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

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

  constructor() { }

  ngOnInit() {
  }

  checkInputs(){
    let p1 = this.checkForm(this.pointOne);
    let p2 = this.checkForm(this.pointTwo);
    let cc = this.checkForm(this.curveConstants);
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
