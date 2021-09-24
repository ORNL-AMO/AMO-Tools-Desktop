import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { InletPressureData } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { FsatWarningService } from '../../fsat-warning.service';
import { FsatService, InletVelocityPressureInputs } from '../../fsat.service';

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
  @Input()
  usingStaticPressure: boolean;
  @Input()
  inletVelocityPressureInputs: InletVelocityPressureInputs;
  @Output('emitInvalid')
  emitInvalid = new EventEmitter<boolean>();

  calcInletVelocityPressureError: string = null;
  currentField: string = 'inletLoss';
  constructor(private fsatService: FsatService, private fsatWarningService: FsatWarningService) { }

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
        calculatedInletPressure: undefined,
        inletVelocityPressure: undefined,
        userDefinedVelocityPressure: undefined,
        fanInletArea: undefined
      };
    } 
  }

  toggleUserDefinedVelocityPressure() {
    this.inletPressureData.userDefinedVelocityPressure = !this.inletPressureData.userDefinedVelocityPressure
    this.calculate();
  }

  setInletVelocityPressure() {
    if (!this.inletPressureData.userDefinedVelocityPressure) {
      this.inletVelocityPressureInputs.ductArea = this.inletPressureData.fanInletArea;
      let calculatedInletVelocityPressure: number = this.fsatService.calculateInletVelocityPressure(this.inletVelocityPressureInputs);
      this.inletPressureData.inletVelocityPressure = calculatedInletVelocityPressure; 
      this.calcInletVelocityPressureError = this.fsatWarningService.checkCalcInletVelocityPressureError(this.inletVelocityPressureInputs.flowRate);
      this.emitInvalid.emit(true);
    } else {
      this.calcInletVelocityPressureError = null;
    }
  }

  calculate() {
    this.setInletVelocityPressure();
    let sum: number = 0;
    Object.keys(this.inletPressureData).map((key, index) => {
      if (key.valueOf() !== 'calculatedInletPressure' 
          && key.valueOf() !== 'fanInletArea'
          && key.valueOf() !== 'userDefinedVelocityPressure') {
        sum = sum + this.inletPressureData[key];
      }
    });    
    this.inletPressureData.calculatedInletPressure = (sum * -1);  
    if(this.inletPressureData.calculatedInletPressure){
      this.emitInvalid.emit(false);
    } else{
      this.emitInvalid.emit(true);
    }
    this.emitSave.emit(this.inletPressureData);
  }

  changeField(str: string) {
    this.currentField = str;
  }
}
