import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {ReceiverTankDedicatedStorage} from "../../../../../shared/models/standalone";

@Component({
  selector: 'app-dedicated-storage-form',
  templateUrl: './dedicated-storage-form.component.html',
  styleUrls: ['./dedicated-storage-form.component.css']
})
export class DedicatedStorageFormComponent implements OnInit {
  @Input()
  inputs: ReceiverTankDedicatedStorage;
  @Input()
  receiverVolume: number;
  @Output('calculate')
  calculate = new EventEmitter();


  constructor() { }

  ngOnInit() {
  }
  emitChange() {
    this.calculate.emit(this.inputs);
  }
}
