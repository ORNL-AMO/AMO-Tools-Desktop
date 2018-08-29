import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CalculateUsableCapacity } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';
import { CompressedAirService } from '../../compressed-air.service';

@Component({
  selector: 'app-air-capacity-form',
  templateUrl: './air-capacity-form.component.html',
  styleUrls: ['./air-capacity-form.component.css']
})
export class AirCapacityFormComponent implements OnInit {
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  inputs: CalculateUsableCapacity;
  airCapacity: number;
  tankCubicFoot: number;

  constructor(private compressedAirService: CompressedAirService) {
  }

  ngOnInit() {
    this.inputs = this.compressedAirService.airCapacityInputs;
    this.getAirCapacity();
  }

  getAirCapacity() {
    this.airCapacity = StandaloneService.usableAirCapacity(this.inputs);
    this.getTankSize();
  }

  getTankSize() {
    this.tankCubicFoot = this.inputs.tankSize / 7.48;
  }

  changeField(str: string){
    this.emitChangeField.emit(str);
  }
}
