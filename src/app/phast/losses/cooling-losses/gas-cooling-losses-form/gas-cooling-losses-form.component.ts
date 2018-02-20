import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { CoolingLossesCompareService } from '../cooling-losses-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-gas-cooling-losses-form',
  templateUrl: './gas-cooling-losses-form.component.html',
  styleUrls: ['./gas-cooling-losses-form.component.css']
})
export class GasCoolingLossesFormComponent implements OnInit {
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
  @Output('inputError')
  inputError = new EventEmitter<boolean>();

  specificHeatError: string = null;
  gasFlowError: string = null;
  gasDensityError: string = null;
  firstChange: boolean = true;
  counter: any;
  temperatureError: string = null;
  constructor(private windowRefService: WindowRefService, private coolingLossesCompareService: CoolingLossesCompareService) { }

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

  ngOnInit() { this.checkInputError(true); }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }


  disableForm() {
    this.lossesForm.disable();
  }

  enableForm() {
    this.lossesForm.enable();
  }

  // checkTemperature(bool?: boolean) {
  //   if (!bool) {
  //     this.startSavePolling();
  //   }
  //   if (this.lossesForm.controls.inletTemp.value > this.lossesForm.controls.outletTemp.value) {
  //     this.temperatureError = 'Inlet temperature is greater than outlet temperature'
  //   } else {
  //     this.temperatureError = null;
  //   }
  // }

  checkInputError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.lossesForm.controls.avgSpecificHeat.value < 0) {
      this.specificHeatError = 'Specific Heat must be equal or greater than 0';
    } else {
      this.specificHeatError = null;
    }
    if (this.lossesForm.controls.gasFlow.value < 0) {
      this.gasFlowError = 'Gas Flow must be equal or greater than 0';
    } else {
      this.gasFlowError = null;
    }
    if (this.lossesForm.controls.gasDensity.value < 0) {
      this.gasDensityError = 'Gas Density must be equal or greater than 0';
    } else {
      this.gasDensityError = null;
    }
    if (this.lossesForm.controls.inletTemp.value > this.lossesForm.controls.outletTemp.value) {
      this.temperatureError = 'Inlet temperature is greater than outlet temperature'
    } else {
      this.temperatureError = null;
    }

    if (this.specificHeatError || this.gasFlowError || this.gasDensityError || this.temperatureError) {
      this.inputError.emit(true);
    } else {
      this.inputError.emit(false);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  emitSave() {
    this.saveEmit.emit(true);
  }
  focusOut() {
    this.changeField.emit('default');
  }
  startSavePolling() {
    this.calculate.emit(true)
    this.emitSave();
  }

  initDifferenceMonitor() {
    if (this.coolingLossesCompareService.baselineCoolingLosses && this.coolingLossesCompareService.modifiedCoolingLosses && this.coolingLossesCompareService.differentArray.length != 0) {
      if (this.coolingLossesCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        //avgSpecificHeat
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.gasCoolingLossDifferent.specificHeat.subscribe((val) => {
          let avgSpecificHeatElements = doc.getElementsByName('avgSpecificHeat_' + this.lossIndex);
          avgSpecificHeatElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //gasFlow
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.gasCoolingLossDifferent.flowRate.subscribe((val) => {
          let gasFlowElements = doc.getElementsByName('gasFlow_' + this.lossIndex);
          gasFlowElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //inletTemp
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.gasCoolingLossDifferent.initialTemperature.subscribe((val) => {
          let inletTempElements = doc.getElementsByName('inletTemp_' + this.lossIndex);
          inletTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //outletTemp
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.gasCoolingLossDifferent.finalTemperature.subscribe((val) => {
          let outletTempElements = doc.getElementsByName('outletTemp_' + this.lossIndex);
          outletTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //correctionFactor
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.gasCoolingLossDifferent.correctionFactor.subscribe((val) => {
          let correctionFactorElements = doc.getElementsByName('correctionFactor_' + this.lossIndex);
          correctionFactorElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //gasDensity
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.gasCoolingLossDifferent.gasDensity.subscribe((val) => {
          let gasDensityElements = doc.getElementsByName('gasDensity_' + this.lossIndex);
          gasDensityElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //coolingMedium
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.gasCoolingLossDifferent.coolingMedium.subscribe((val) => {
          let coolingMediumElements = doc.getElementsByName('coolingMedium_' + this.lossIndex);
          coolingMediumElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}
