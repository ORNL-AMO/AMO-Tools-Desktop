import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { AuxiliaryPowerCompareService } from '../auxiliary-power-compare.service';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-auxiliary-power-losses-form',
  templateUrl: './auxiliary-power-losses-form.component.html',
  styleUrls: ['./auxiliary-power-losses-form.component.css']
})
export class AuxiliaryPowerLossesFormComponent implements OnInit {
  @Input()
  auxLossesForm: FormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;
  @Output('inputError')
  inputError = new EventEmitter<boolean>();
  firstChange: boolean = true;
  counter: any;
  voltageError: string = null;

  motorPhases: Array<number> = [
    1,
    3
  ]
  constructor(private windowRefService: WindowRefService, private auxiliaryPowerCompareService: AuxiliaryPowerCompareService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    } else {
      this.firstChange = false;
    }
  }

  ngOnInit() { }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }

  disableForm() {
    this.auxLossesForm.disable();
  }

  enableForm() {
    this.auxLossesForm.enable();
  }

  checkForm() {
    this.calculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }
  emitSave() {
    this.saveEmit.emit(true);
  }

  checkVoltageError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.auxLossesForm.controls.supplyVoltage.value < 0 || this.auxLossesForm.controls.supplyVoltage.value > 480) {
      this.voltageError = 'Supply Voltage must be between 0 and 480';
    } else {
      this.voltageError = null;
    }

    if(this.voltageError){
      this.inputError.emit(true);
    }else{
      this.inputError.emit(false);
    }
  }

  startSavePolling() {
    this.checkForm();
    this.emitSave();
  }

  initDifferenceMonitor() {
    if (this.auxiliaryPowerCompareService.baselineAuxLosses && this.auxiliaryPowerCompareService.modifiedAuxLosses && this.auxiliaryPowerCompareService.differentArray.length != 0) {
      if (this.auxiliaryPowerCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        //motorPhase
        this.auxiliaryPowerCompareService.differentArray[this.lossIndex].different.motorPhase.subscribe((val) => {
          let motorPhaseElements = doc.getElementsByName('motorPhase_' + this.lossIndex);
          motorPhaseElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //supplyVoltage
        this.auxiliaryPowerCompareService.differentArray[this.lossIndex].different.supplyVoltage.subscribe((val) => {
          let supplyVoltageElements = doc.getElementsByName('supplyVoltage_' + this.lossIndex);
          supplyVoltageElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //avgCurrent
        this.auxiliaryPowerCompareService.differentArray[this.lossIndex].different.avgCurrent.subscribe((val) => {
          let avgCurrentElements = doc.getElementsByName('avgCurrent_' + this.lossIndex);
          avgCurrentElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //powerFactor
        this.auxiliaryPowerCompareService.differentArray[this.lossIndex].different.powerFactor.subscribe((val) => {
          let powerFactorElements = doc.getElementsByName('powerFactor_' + this.lossIndex);
          powerFactorElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //operatingTime
        this.auxiliaryPowerCompareService.differentArray[this.lossIndex].different.operatingTime.subscribe((val) => {
          let operatingTimeElements = doc.getElementsByName('operatingTime_' + this.lossIndex);
          operatingTimeElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}
