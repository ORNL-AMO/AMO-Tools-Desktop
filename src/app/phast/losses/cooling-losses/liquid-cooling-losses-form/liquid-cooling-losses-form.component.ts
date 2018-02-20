import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { CoolingLossesCompareService } from '../cooling-losses-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-liquid-cooling-losses-form',
  templateUrl: './liquid-cooling-losses-form.component.html',
  styleUrls: ['./liquid-cooling-losses-form.component.css']
})
export class LiquidCoolingLossesFormComponent implements OnInit {
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
  firstChange: boolean = true;
  counter: any;
  temperatureError: string = null;
  densityLiquidError: string = null;
  liquidFlowError: string = null;
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


  ngOnInit() {
    this.checkInputError(true);
  }

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

  checkForm() {
    this.calculate.emit(true)
  }

  // checkTemperature(bool?: boolean) {
  //   if (!bool) {
  //     this.startSavePolling();
  //   }
  //   if (this.lossesForm.controls.inletTemp.value > this.lossesForm.controls.outletTemp.value) {
  //     this.temperatureError = 'Inlet temperature is greater than outlet temperature';
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
    if (this.lossesForm.controls.density.value < 0) {
      this.densityLiquidError = 'Density must be equal or greater than 0';
    } else {
      this.densityLiquidError = null;
    }
    if (this.lossesForm.controls.liquidFlow.value < 0) {
      this.liquidFlowError = 'Liquid Flow must be equal or greater than 0';
    } else {
      this.liquidFlowError = null;
    }

    if (this.lossesForm.controls.inletTemp.value > this.lossesForm.controls.outletTemp.value) {
      this.temperatureError = 'Inlet temperature is greater than outlet temperature';
    } else {
      this.temperatureError = null;
    }

    if(this.specificHeatError || this.densityLiquidError || this.liquidFlowError || this.temperatureError){
      this.inputError.emit(true);
    }else{
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
    this.checkForm();
    this.emitSave();
  }

  initDifferenceMonitor() {
    if (this.coolingLossesCompareService.baselineCoolingLosses && this.coolingLossesCompareService.modifiedCoolingLosses && this.coolingLossesCompareService.differentArray.length != 0) {
      if (this.coolingLossesCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        //avgSpecificHeat
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.liquidCoolingLossDifferent.specificHeat.subscribe((val) => {
          let avgSpecificHeatElements = doc.getElementsByName('avgSpecificHeat_' + this.lossIndex);
          avgSpecificHeatElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //density
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.liquidCoolingLossDifferent.density.subscribe((val) => {
          let densityElements = doc.getElementsByName('density_' + this.lossIndex);
          densityElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //liquidFlow
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.liquidCoolingLossDifferent.flowRate.subscribe((val) => {
          let liquidFlowElements = doc.getElementsByName('liquidFlow_' + this.lossIndex);
          liquidFlowElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //inletTemp
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.liquidCoolingLossDifferent.initialTemperature.subscribe((val) => {
          let inletTempElements = doc.getElementsByName('inletTemp_' + this.lossIndex);
          inletTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //outletTemp
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.liquidCoolingLossDifferent.outletTemperature.subscribe((val) => {
          let outletTempElements = doc.getElementsByName('outletTemp_' + this.lossIndex);
          outletTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //correctionFactor
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.liquidCoolingLossDifferent.correctionFactor.subscribe((val) => {
          let correctionFactorElements = doc.getElementsByName('correctionFactor_' + this.lossIndex);
          correctionFactorElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //coolingMedium
        this.coolingLossesCompareService.differentArray[this.lossIndex].different.liquidCoolingLossDifferent.coolingMedium.subscribe((val) => {
          let coolingMediumElements = doc.getElementsByName('coolingMedium_' + this.lossIndex);
          coolingMediumElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}
