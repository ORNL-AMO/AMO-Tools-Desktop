import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CalculateUsableCapacity } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';
import { CompressedAirService } from '../../compressed-air.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-air-capacity-form',
  templateUrl: './air-capacity-form.component.html',
  styleUrls: ['./air-capacity-form.component.css']
})
export class AirCapacityFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  inputs: CalculateUsableCapacity;
  airCapacity: number;
  tankCubicFoot: number;

  constructor(private compressedAirService: CompressedAirService, private standaloneService: StandaloneService, private convertUnitsService: ConvertUnitsService) {
  }

  ngOnInit() {
    this.inputs = this.compressedAirService.airCapacityInputs;
    this.getAirCapacity();
  }

  getAirCapacity() {
    this.airCapacity = this.standaloneService.usableAirCapacity(this.inputs, this.settings);
    this.getTankSize();
  }

  getTankSize() {
    if(this.settings.unitsOfMeasure == 'Metric'){
      this.tankCubicFoot = this.inputs.tankSize;
    }else{
      this.tankCubicFoot = this.convertUnitsService.value(this.inputs.tankSize).from('gal').to('ft3');
    }
  }

  changeField(str: string){
    this.emitChangeField.emit(str);
  }
}
