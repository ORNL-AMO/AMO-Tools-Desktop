import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FanRatedInfo } from '../../../../../shared/models/fans';

@Component({
  selector: 'app-fan-basics',
  templateUrl: './fan-basics.component.html',
  styleUrls: ['./fan-basics.component.css']
})
export class FanBasicsComponent implements OnInit {
  @Input()
  fanRatedInfo: FanRatedInfo;
  @Input()
  basicsDone: number;
  @Output('emitSave')
  emitSave = new EventEmitter<FanRatedInfo>();
  planes: Array<number> = [
    1, 2, 3
  ]
  constructor() { }

  ngOnInit() {
  }

  focusField(){

  }

  save(){
    this.emitSave.emit(this.fanRatedInfo);
  }
}
