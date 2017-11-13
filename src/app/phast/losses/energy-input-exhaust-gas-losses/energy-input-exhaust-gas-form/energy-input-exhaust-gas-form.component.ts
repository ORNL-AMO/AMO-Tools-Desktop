import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { EnergyInputExhaustGasCompareService } from '../energy-input-exhaust-gas-compare.service';
import { FormControl, Validators } from '@angular/forms'
import * as _ from 'lodash';
//used for other loss monitoring
import { EnergyInputExhaustGasService } from '../energy-input-exhaust-gas.service';
import { PhastService } from '../../../phast.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-energy-input-exhaust-gas-form',
  templateUrl: './energy-input-exhaust-gas-form.component.html',
  styleUrls: ['./energy-input-exhaust-gas-form.component.css']
})
export class EnergyInputExhaustGasFormComponent implements OnInit {
  @Input()
  exhaustGasForm: any;
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
  availableHeat: number;
  //different for other losses monitoring
  @Input()
  isBaseline: boolean;
  @Input()
  settings: Settings;

  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  elements: any;

  firstChange: boolean = true;
  counter: any;

  //otherLossArray: Array<number>;
  constructor(private windowRefService: WindowRefService, private energyInputExhaustGasCompareService: EnergyInputExhaustGasCompareService, private energyInputExhaustGasService: EnergyInputExhaustGasService, private phastService: PhastService) { }

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
    // this.otherLossArray = new Array<number>();
    // let i = 1;
    // Object.keys(this.exhaustGasForm.controls).forEach(key => {
    //   if (_.includes(key, "otherLoss")) {
    //     this.addOther(i);
    //     i++;
    //   }
    // })

    // this.energyInputExhaustGasService.addOtherMonitor.subscribe((val) => {
    //   if (val) {
    //     this.addOther();
    //   }
    // })
    // this.energyInputExhaustGasService.deleteOtherMonitor.subscribe((val) => {
    //   if (val) {
    //     this.removeOther(val.index, val.lossNumber);
    //   }
    // })
  }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }

  ngOnDestroy() {
    // this.energyInputExhaustGasService.deleteOtherMonitor.next(null);
    this.energyInputExhaustGasService.addLossBaselineMonitor.next(null);
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

  // addOtherSignal() {
  //   this.energyInputExhaustGasService.addOtherMonitor.next(true);
  // }

  // addOther(index?: number) {
  //   if (index) {
  //     let otherControl = new FormControl('', Validators.required);
  //     this.exhaustGasForm.addControl(
  //       'otherLoss' + index, otherControl
  //     );
  //     this.otherLossArray.push(index);
  //   } else {
  //     let lastNum = this.otherLossArray[this.otherLossArray.length - 1] + 1;
  //     if (Number.isNaN(lastNum)) {
  //       lastNum = 1;
  //     }
  //     let otherControl = new FormControl('', Validators.required);
  //     this.exhaustGasForm.addControl(
  //       'otherLoss' + lastNum, otherControl
  //     );
  //     this.otherLossArray.push(lastNum);
  //     if (this.energyInputExhaustGasCompareService.differentArray.length != 0) {
  //       this.addMonitor(this.otherLossArray.length - 1);
  //     }
  //   }
  // }

  // addMonitor(index: number) {
  //   this.energyInputExhaustGasCompareService.addOther();
  //   let doc = this.windowRefService.getDoc();
  //   this.energyInputExhaustGasCompareService.differentArray[this.lossIndex].different.otherLossObjects[index].subscribe((val) => {
  //     let otherLossElements = doc.getElementsByName('otherLoss' + this.otherLossArray[index] + '_' + this.lossIndex);
  //     otherLossElements.forEach(element => {
  //       element.classList.toggle('indicate-different', val);
  //     });
  //   })
  // }

  // signalRemove(index: number, lossNumber: number) {
  //   this.energyInputExhaustGasService.deleteOtherMonitor.next({ index: index, lossNumber: lossNumber })
  // }

  // removeOther(index: number, lossNumber: number) {
  //   this.otherLossArray.splice(index, 1);
  //   //only splice service value once (baseline)
  //   if (this.isBaseline && this.energyInputExhaustGasCompareService.differentArray.length != 0) {
  //     this.energyInputExhaustGasCompareService.differentArray[this.lossIndex].different.otherLossObjects.splice(index, 1);
  //   }
  //   this.exhaustGasForm.removeControl('otherLoss' + lossNumber);
  // }

  initDifferenceMonitor() {
    if (this.energyInputExhaustGasCompareService.baselineEnergyInputExhaustGasLosses && this.energyInputExhaustGasCompareService.modifiedEnergyInputExhaustGasLosses && this.energyInputExhaustGasCompareService.differentArray.length != 0) {
      if (this.energyInputExhaustGasCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();
        //excessAir
        this.energyInputExhaustGasCompareService.differentArray[this.lossIndex].different.excessAir.subscribe((val) => {
          let excessAirElements = doc.getElementsByName('excessAir_' + this.lossIndex);
          excessAirElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //combustionAirTemp
        this.energyInputExhaustGasCompareService.differentArray[this.lossIndex].different.combustionAirTemp.subscribe((val) => {
          let combustionAirTempElements = doc.getElementsByName('combustionAirTemp_' + this.lossIndex);
          combustionAirTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //exhaustGasTemp
        this.energyInputExhaustGasCompareService.differentArray[this.lossIndex].different.exhaustGasTemp.subscribe((val) => {
          let exhaustGasTempElements = doc.getElementsByName('exhaustGasTemp_' + this.lossIndex);
          exhaustGasTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //totalHeatInput
        this.energyInputExhaustGasCompareService.differentArray[this.lossIndex].different.totalHeatInput.subscribe((val) => {
          let totalHeatInputElements = doc.getElementsByName('totalHeatInput_' + this.lossIndex);
          totalHeatInputElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //electricalPowerInput
        this.energyInputExhaustGasCompareService.differentArray[this.lossIndex].different.electricalPowerInput.subscribe((val) => {
          let electricalPowerInputElements = doc.getElementsByName('electricalPowerInput_' + this.lossIndex);
          electricalPowerInputElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //otherLoss
        // for (let i = 0; i < this.otherLossArray.length; i++) {
        //   this.energyInputExhaustGasCompareService.differentArray[this.lossIndex].different.otherLossObjects[i].subscribe((val) => {
        //     let otherLossElements = doc.getElementsByName('otherLoss' + this.otherLossArray[i] + '_' + this.lossIndex);
        //     otherLossElements.forEach(element => {
        //       element.classList.toggle('indicate-different', val);
        //     });
        //   })
        // }
      }
    }
  }
}
