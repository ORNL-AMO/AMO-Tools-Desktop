import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {ReceiverTankMeteredStorage} from "../../../../../shared/models/standalone";

@Component({
  selector: 'app-metered-storage-form',
  templateUrl: './metered-storage-form.component.html',
  styleUrls: ['./metered-storage-form.component.css']
})
export class MeteredStorageFormComponent implements OnInit {
  @Input()
  totalReceiverVolume: number;
  @Input()
  inputs: ReceiverTankMeteredStorage;
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
