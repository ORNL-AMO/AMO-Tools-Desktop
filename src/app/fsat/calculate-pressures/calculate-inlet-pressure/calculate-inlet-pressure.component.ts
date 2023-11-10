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
        inletLoss: 0,
        inletDuctworkLoss: 0,
        systemDamperLoss: 0,
        airTreatmentLoss: 0,
        flowMeasurementLoss: 0,
        inletDamperLoss: 0,
        processRequirementsFixed: 0,
        processRequirements: 0,
        inletSystemEffectLoss: 0,
        calculatedInletPressure: 0,
        inletVelocityPressure: 0,
        userDefinedVelocityPressure: false,
        fanInletArea: 0
      };
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.calculate();
    });
  }

  toggleUserDefinedVelocityPressure() {
    this.inletPressureData.userDefinedVelocityPressure = !this.inletPressureData.userDefinedVelocityPressure
    this.calculate();
  }

  setInletVelocityPressure() {
    if (!this.inletPressureData.userDefinedVelocityPressure && !this.usingStaticPressure) {
      this.inletVelocityPressureInputs.ductArea = this.inletPressureData.fanInletArea;
      let calculatedInletVelocityPressure: number = this.fsatService.calculateInletVelocityPressure(this.inletVelocityPressureInputs, this.settings);
      this.inletPressureData.inletVelocityPressure = calculatedInletVelocityPressure;
      this.calcInletVelocityPressureError = this.fsatWarningService.checkCalcInletVelocityPressureError(this.inletVelocityPressureInputs.flowRate);
    } else {
      this.inletPressureData.fanInletArea = 0;
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
    if (!this.usingStaticPressure) {
      if (!this.inletPressureData.userDefinedVelocityPressure) {
        if (this.inletPressureData.fanInletArea !== 0) {
          this.emitInvalid.emit(false);
        } else {
          this.emitInvalid.emit(true);
        }
      } else {
        if (this.inletPressureData.inletVelocityPressure !== 0) {
          this.emitInvalid.emit(false);
        } else {
          this.emitInvalid.emit(true);
        }
      }
    } else {
      this.emitInvalid.emit(false);
    }
    this.emitSave.emit(this.inletPressureData);
  }

  changeField(str: string) {
    this.currentField = str;
  }
}
