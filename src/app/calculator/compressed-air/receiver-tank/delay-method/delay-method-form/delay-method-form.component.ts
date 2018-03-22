import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {ReceiverTankBridgingCompressor} from "../../../../../shared/models/standalone";

@Component({
  selector: 'app-delay-method-form',
  templateUrl: './delay-method-form.component.html',
  styleUrls: ['./delay-method-form.component.css']
})
export class DelayMethodFormComponent implements OnInit {
  @Input()
  inputs: ReceiverTankBridgingCompressor;
  @Input()
  totalReceiverVolume: number;
  @Output('calculate')
  calculate = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  emitChange() {
    this.calculate.emit(this.inputs);
  }
}
