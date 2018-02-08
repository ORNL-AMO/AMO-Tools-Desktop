import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BagMethod } from '../bag-method.component';

@Component({
  selector: 'app-bag-method-form',
  templateUrl: './bag-method-form.component.html',
  styleUrls: ['./bag-method-form.component.css']
})
export class BagMethodFormComponent implements OnInit {
  @Input()
  inputs: BagMethod;
  @Output('calculate')
  calculate = new EventEmitter<BagMethod>();
  constructor() { }

  ngOnInit() {
  }


  emitChange(){
    this.calculate.emit(this.inputs);
  }
}
