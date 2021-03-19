import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { InletPressureData } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';

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
  constructor() { }

  ngOnInit() {
    if (!this.inletPressureData) {
      this.inletPressureData = {
        inletLoss: undefined,
        inletDuctworkLoss: undefined,
        systemDamperLoss: undefined,
        airTreatmentLoss: undefined,
        flowMeasurementLoss: undefined,
        inletDamperLoss: undefined,
        processRequirementsFixed: undefined,
        processRequirements: undefined,
        inletSystemEffectLoss: undefined,
        calculatedInletPressure: undefined
      };
    }
  }

  calculate() {
    let sum: number = 0;
    Object.keys(this.inletPressureData).map((key, index) => {
      if (key.valueOf() !== 'calculatedInletPressure') {
        sum = sum + this.inletPressureData[key];
      }
    });
    this.inletPressureData.calculatedInletPressure = (sum * -1);
    this.emitSave.emit(this.inletPressureData);
  }

  changeField(str: string) {
    this.currentField = str;
  }
}
