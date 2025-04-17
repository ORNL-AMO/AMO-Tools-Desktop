import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { OutletPressureData } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { FsatWarningService } from '../../fsat-warning.service';
import { FsatService, InletVelocityPressureInputs } from '../../fsat.service';

@Component({
    selector: 'app-calculate-outlet-pressure',
    templateUrl: './calculate-outlet-pressure.component.html',
    styleUrls: ['./calculate-outlet-pressure.component.css'],
    standalone: false
})
export class CalculateOutletPressureComponent implements OnInit {
  @Input()
  outletPressureData: OutletPressureData;
  @Output('emitSave')
  emitSave = new EventEmitter<OutletPressureData>();
  @Input()
  settings: Settings;
  @Input()
  bodyHeight: number;
  currentField: string = 'inletLoss';
  @Output('emitInvalid')
  emitInvalid = new EventEmitter<boolean>();

  @Input()
  usingStaticPressure: boolean;
  @Input()
  inletVelocityPressureInputs: InletVelocityPressureInputs;

  calcInletVelocityPressureError: string = null;
  constructor(private fsatService: FsatService, private fsatWarningService: FsatWarningService) { }

  ngOnInit() {
    if (!this.outletPressureData) {
      this.outletPressureData = {
        outletSystemEffectLoss: 0,
        outletDamperLoss: 0,
        airTreatmentLoss: 0,
        systemDamperLoss: 0,
        outletDuctworkLoss: 0,
        processRequirementsFixed: 0,
        processRequirements: 0,
        calculatedOutletPressure: 0,
        inletVelocityPressure: 0,
        userDefinedVelocityPressure: false,
        fanOutletArea: 0
      };
    }
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.calculate();
    });
  }

  toggleUserDefinedVelocityPressure() {
    this.outletPressureData.userDefinedVelocityPressure = !this.outletPressureData.userDefinedVelocityPressure;
    this.calculate();
  }

  setInletVelocityPressure() {
    if (!this.outletPressureData.userDefinedVelocityPressure && !this.usingStaticPressure) {
      this.inletVelocityPressureInputs.ductArea = this.outletPressureData.fanOutletArea;
      let calculatedInletVelocityPressure: number = this.fsatService.calculateInletVelocityPressure(this.inletVelocityPressureInputs, this.settings);
      this.outletPressureData.inletVelocityPressure = calculatedInletVelocityPressure;
      this.calcInletVelocityPressureError = this.fsatWarningService.checkCalcInletVelocityPressureError(this.inletVelocityPressureInputs.flowRate);
    } else {
      this.outletPressureData.fanOutletArea = 0;
      this.calcInletVelocityPressureError = null;
    }
  }

  calculate() {
    this.setInletVelocityPressure();
    let sum: number = 0;
    Object.keys(this.outletPressureData).map((key, index) => {
      if (key.valueOf() !== 'calculatedOutletPressure'
        && key.valueOf() !== 'fanOutletArea'
        && key.valueOf() !== 'userDefinedVelocityPressure') {
        sum = sum + this.outletPressureData[key];
      }
    });
    this.outletPressureData.calculatedOutletPressure = sum;
    if (!this.usingStaticPressure) {
      if (!this.outletPressureData.userDefinedVelocityPressure) {
        if (this.outletPressureData.fanOutletArea !== 0) {
          this.emitInvalid.emit(false);
        } else {
          this.emitInvalid.emit(true);
        }
      } else {
        if (this.outletPressureData.inletVelocityPressure !== 0) {
          this.emitInvalid.emit(false);
        } else {
          this.emitInvalid.emit(true);
        }
      }
    } else {
      this.emitInvalid.emit(false);
    }

    this.emitSave.emit(this.outletPressureData);
  }

  changeField(str: string) {
    this.currentField = str;
  }
}
