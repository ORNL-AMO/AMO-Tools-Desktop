import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { OutletPressureData } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-calculate-outlet-pressure',
  templateUrl: './calculate-outlet-pressure.component.html',
  styleUrls: ['./calculate-outlet-pressure.component.css']
})
export class CalculateOutletPressureComponent implements OnInit {
  @Input()
  outletPressureData: OutletPressureData;
  @Output('emitSave')
  emitSave = new EventEmitter<OutletPressureData>();
  @Input()
  settings: Settings;

  currentField: string = 'inletLoss';
  constructor() { }

  ngOnInit() {
    if (!this.outletPressureData) {
      this.outletPressureData = {
        outletSystemEffectLoss: 0,
        outletDamperLoss: 0,
        airTreatmentLoss: 0,
        systemDamperLoss: 0,
        processRequirements: 0,
        calculatedOutletPressure: 0
      }
    }
  }

  calculate() {
    let sum: number = 0;
    Object.keys(this.outletPressureData).map((key, index) => {
      if (key.valueOf() != 'calculatedOutletPressure') {
        sum = sum + this.outletPressureData[key];
      }
    })
    this.outletPressureData.calculatedOutletPressure = sum;
    this.emitSave.emit(this.outletPressureData);
  }

  changeField(str: string) {
    this.currentField = str;
  }

}
