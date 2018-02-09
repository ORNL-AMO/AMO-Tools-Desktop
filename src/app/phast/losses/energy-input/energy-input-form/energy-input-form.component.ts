import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { EnergyInputCompareService } from '../energy-input-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-energy-input-form',
  templateUrl: './energy-input-form.component.html',
  styleUrls: ['./energy-input-form.component.css']
})
export class EnergyInputFormComponent implements OnInit {
  @Input()
  energyInputForm: FormGroup;
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
  flowInput: boolean;
  firstChange: boolean = true;
  counter: any;
  constructor(private energyInputCompareService: EnergyInputCompareService, private windowRefService: WindowRefService) { }

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
    if (this.energyInputForm.controls.flowRateInput.value) {
      this.flowInput = false;
    }
  }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }

  setHeatInput() {
    let heatVal = this.energyInputForm.controls.flowRateInput.value * (1020 / (Math.pow(10, 6)));
    this.energyInputForm.patchValue({
      'naturalGasHeatInput': heatVal
    })
    this.checkForm();
  }

  disableForm() {
    this.energyInputForm.disable();
  }

  enableForm() {
    this.energyInputForm.enable();
  }

  checkForm() {
    this.calculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  emitSave() {
    this.saveEmit.emit(true);
  }

  startSavePolling() {
    this.checkForm();
    this.emitSave();
  }

  showHideInputField() {
    this.flowInput = !this.flowInput;
  }

  initDifferenceMonitor() {
    if (this.energyInputCompareService.baselineEnergyInput && this.energyInputCompareService.modifiedEnergyInput && this.energyInputCompareService.differentArray.length != 0) {
      if (this.energyInputCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        // naturalGasHeatInput
        this.energyInputCompareService.differentArray[this.lossIndex].different.naturalGasHeatInput.subscribe((val) => {
          let naturalGasHeatInputElements = doc.getElementsByName('naturalGasHeatInput_' + this.lossIndex);
          naturalGasHeatInputElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        // Natural gas flowRateInput
        this.energyInputCompareService.differentArray[this.lossIndex].different.flowRateInput.subscribe((val) => {
          let flowRateInputElements = doc.getElementsByName('flowRateInput_' + this.lossIndex);
          flowRateInputElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //naturalGasFlow
        // this.energyInputCompareService.differentArray[this.lossIndex].different.naturalGasFlow.subscribe((val) => {
        //   let naturalGasFlowElements = doc.getElementsByName('naturalGasFlow_' + this.lossIndex);
        //   naturalGasFlowElements.forEach(element => {
        //     element.classList.toggle('indicate-different', val);
        //   });
        // })
        //measuredOxygenFlow
        // this.energyInputCompareService.differentArray[this.lossIndex].different.measuredOxygenFlow.subscribe((val) => {
        //   let measuredOxygenFlowElements = doc.getElementsByName('measuredOxygenFlow_' + this.lossIndex);
        //   measuredOxygenFlowElements.forEach(element => {
        //     element.classList.toggle('indicate-different', val);
        //   });
        // })
        // coalCarbonInjection
        this.energyInputCompareService.differentArray[this.lossIndex].different.coalCarbonInjection.subscribe((val) => {
          let coalCarbonInjectionInputElements = doc.getElementsByName('coalCarbonInjection_' + this.lossIndex);
          coalCarbonInjectionInputElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        // coalHeatingValue
        this.energyInputCompareService.differentArray[this.lossIndex].different.coalHeatingValue.subscribe((val) => {
          let coalHeatingValueElements = doc.getElementsByName('coalHeatingValue_' + this.lossIndex);
          coalHeatingValueElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        // electrodeUse
        this.energyInputCompareService.differentArray[this.lossIndex].different.electrodeUse.subscribe((val) => {
          let electrodeUseElements = doc.getElementsByName('electrodeUse_' + this.lossIndex);
          electrodeUseElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        // electrodeHeatingValue
        this.energyInputCompareService.differentArray[this.lossIndex].different.electrodeHeatingValue.subscribe((val) => {
          let electrodeHeatingValueElements = doc.getElementsByName('electrodeHeatingValue_' + this.lossIndex);
          electrodeHeatingValueElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        // otherFuels
        this.energyInputCompareService.differentArray[this.lossIndex].different.otherFuels.subscribe((val) => {
          let otherFuelsElements = doc.getElementsByName('otherFuels_' + this.lossIndex);
          otherFuelsElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        // electricityInput
        this.energyInputCompareService.differentArray[this.lossIndex].different.electricityInput.subscribe((val) => {
          let electricityInputElements = doc.getElementsByName('electricityInput_' + this.lossIndex);
          electricityInputElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}
