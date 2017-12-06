import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { AuxiliaryPowerCompareService } from '../auxiliary-power-compare.service';
@Component({
  selector: 'app-auxiliary-power-losses-form',
  templateUrl: './auxiliary-power-losses-form.component.html',
  styleUrls: ['./auxiliary-power-losses-form.component.css']
})
export class AuxiliaryPowerLossesFormComponent implements OnInit {
  @Input()
  auxLossesForm: any;
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

  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  elements: any;
  inputError: string = null;
  firstChange: boolean = true;
  counter: any;
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
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = true;
    }
  }

  enableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
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

  startSavePolling() {
    this.checkForm();
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.emitSave();
    }, 3000)
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
