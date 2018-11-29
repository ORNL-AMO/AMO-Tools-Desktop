import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { InletPressureData } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-calculate-inlet-pressure',
  templateUrl: './calculate-inlet-pressure.component.html',
  styleUrls: ['./calculate-inlet-pressure.component.css']
})
export class CalculateInletPressureComponent implements OnInit {
  @Input()
  inletPressureData: InletPressureData;
  @Output('emitSave')
  emitSave = new EventEmitter<InletPressureData>();
  @Input()
  settings: Settings;
  @Input()
  bodyHeight: number;
  
  currentField: string = 'inletLoss';
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.inletPressureData) {
      this.inletPressureData = {
        inletLoss: 0,
        inletDuctworkLoss: 0,
        systemDamperLoss: 0,
        airTreatmentLoss: 0,
        flowMeasurementLoss: 0,
        inletDamperLoss: 0,
        processRequirements: 0,
        inletSystemEffectLoss: 0,
        calculatedInletPressure: 0
      }
    }
  }

  calculate() {
    let sum: number = 0;
    Object.keys(this.inletPressureData).map((key, index) => {
      if (key.valueOf() != 'calculatedInletPressure') {
        sum = sum + this.inletPressureData[key];
      }
    })
    this.inletPressureData.calculatedInletPressure = (sum * -1);
    this.emitSave.emit(this.inletPressureData);
  }

  changeField(str: string) {
    this.currentField = str;
  }

  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }
}
