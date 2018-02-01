import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { GasLeakageCompareService } from "../gas-leakage-compare.service";
import { WindowRefService } from "../../../../indexedDb/window-ref.service";
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-gas-leakage-losses-form',
  templateUrl: './gas-leakage-losses-form.component.html',
  styleUrls: ['./gas-leakage-losses-form.component.css']
})
export class GasLeakageLossesFormComponent implements OnInit {
  @Input()
  lossesForm: FormGroup;
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
  @Input()
  settings: Settings;

  openingAreaError: string = null;
  specificGravityError: string = null;
  firstChange: boolean = true;
  counter: any;
  temperatureError: string = null;
  constructor(private gasLeakageCompareService: GasLeakageCompareService, private windowRefService: WindowRefService) { }

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

  ngOnInit() {
    this.checkTemperature(true);
  }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }
  focusOut() {
    this.changeField.emit('default');
  }
  disableForm() {
    this.lossesForm.disable();
  }

  enableForm() {
    this.lossesForm.enable();
  }

  checkForm() {
    this.calculate.emit(true);
  }

  checkTemperature(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.lossesForm.controls.ambientTemperature.value > this.lossesForm.controls.leakageGasTemperature.value) {
      this.temperatureError = 'Ambient Temperature is greater than Temperature of Gases Leaking';
    } else {
      this.temperatureError = null;
    }
  }

  checkInputError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.lossesForm.controls.openingArea.value < 0) {
      this.openingAreaError = 'Opening Area must be equal or greater than 0';
    } else {
      this.openingAreaError = null;
    }
    if (this.lossesForm.controls.specificGravity.value < 0) {
      this.specificGravityError = 'Specific Density of Flue Gases must be equal or greater than 0';
    } else {
      this.specificGravityError = null;
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
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
    if (this.gasLeakageCompareService.baselineLeakageLoss && this.gasLeakageCompareService.modifiedLeakageLoss && this.gasLeakageCompareService.differentArray.length != 0) {
      if (this.gasLeakageCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();
        //draftPressure
        this.gasLeakageCompareService.differentArray[this.lossIndex].different.draftPressure.subscribe((val) => {
          let draftPressureElements = doc.getElementsByName('draftPressure_' + this.lossIndex);
          draftPressureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //openingArea
        this.gasLeakageCompareService.differentArray[this.lossIndex].different.openingArea.subscribe((val) => {
          let openingAreaElements = doc.getElementsByName('openingArea_' + this.lossIndex);
          openingAreaElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //leakageGasTemperature
        this.gasLeakageCompareService.differentArray[this.lossIndex].different.leakageGasTemperature.subscribe((val) => {
          let leakageGasTemperatureElements = doc.getElementsByName('leakageGasTemperature_' + this.lossIndex);
          leakageGasTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //specificGravity
        this.gasLeakageCompareService.differentArray[this.lossIndex].different.specificGravity.subscribe((val) => {
          let specificGravityElements = doc.getElementsByName('specificGravity_' + this.lossIndex);
          specificGravityElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //ambientTemperature
        this.gasLeakageCompareService.differentArray[this.lossIndex].different.ambientTemperature.subscribe((val) => {
          let ambientTemperatureElements = doc.getElementsByName('ambientTemperature_' + this.lossIndex);
          ambientTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}
