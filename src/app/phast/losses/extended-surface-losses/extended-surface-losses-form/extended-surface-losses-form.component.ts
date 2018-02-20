import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ExtendedSurfaceCompareService } from '../extended-surface-compare.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-extended-surface-losses-form',
  templateUrl: './extended-surface-losses-form.component.html',
  styleUrls: ['./extended-surface-losses-form.component.css']
})
export class ExtendedSurfaceLossesFormComponent implements OnInit {
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

  surfaceAreaError: string = null;
  firstChange: boolean = true;
  counter: any;
  temperatureError: string = null;
  emissivityError: string = null;
  constructor(private extendedSurfaceCompareService: ExtendedSurfaceCompareService, private windowRefService: WindowRefService) { }

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
    this.calculate.emit(true);
  }

  // checkEmissivity(bool?: boolean) {
  //   if (!bool) {
  //     this.startSavePolling();
  //   }
  //   if (this.lossesForm.controls.surfaceEmissivity.value > 1 || this.lossesForm.controls.surfaceEmissivity.value < 0) {
  //     this.emissivityError = 'Surface emissivity must be between 0 and 1';
  //   } else {
  //     this.emissivityError = null;
  //   }
  // }

  checkInputError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.lossesForm.controls.ambientTemp.value > this.lossesForm.controls.avgSurfaceTemp.value) {
      this.temperatureError = 'Ambient Temperature is greater than Surface Temperature';
    } else {
      this.temperatureError = null;
    }
    if (this.lossesForm.controls.surfaceArea.value < 0) {
      this.surfaceAreaError = 'Total Outside Surface Area must be equal or greater than 0 ';
    } else {
      this.surfaceAreaError = null;
    }
    if (this.lossesForm.controls.surfaceEmissivity.value > 1 || this.lossesForm.controls.surfaceEmissivity.value < 0) {
      this.emissivityError = 'Surface emissivity must be between 0 and 1';
    } else {
      this.emissivityError = null;
    }
    if(this.temperatureError || this.surfaceAreaError || this.emissivityError){
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
    if (this.extendedSurfaceCompareService.baselineSurface && this.extendedSurfaceCompareService.modifiedSurface && this.extendedSurfaceCompareService.differentArray.length != 0) {
      if (this.extendedSurfaceCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        //surfaceArea
        this.extendedSurfaceCompareService.differentArray[this.lossIndex].different.surfaceArea.subscribe((val) => {
          let surfaceAreaElements = doc.getElementsByName('surfaceArea_' + this.lossIndex);
          surfaceAreaElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //avgSurfaceTemp
        this.extendedSurfaceCompareService.differentArray[this.lossIndex].different.surfaceTemperature.subscribe((val) => {
          let avgSurfaceTempElements = doc.getElementsByName('avgSurfaceTemp_' + this.lossIndex);
          avgSurfaceTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //ambientTemp
        this.extendedSurfaceCompareService.differentArray[this.lossIndex].different.ambientTemperature.subscribe((val) => {
          let ambientTempElements = doc.getElementsByName('ambientTemp_' + this.lossIndex);
          ambientTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //surfaceEmissivity
        this.extendedSurfaceCompareService.differentArray[this.lossIndex].different.surfaceEmissivity.subscribe((val) => {
          let surfaceEmissivityElements = doc.getElementsByName('surfaceEmissivity_' + this.lossIndex);
          surfaceEmissivityElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}
