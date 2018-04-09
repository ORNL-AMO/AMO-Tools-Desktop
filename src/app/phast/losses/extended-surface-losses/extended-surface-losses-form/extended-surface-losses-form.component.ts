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
  temperatureError: string = null;
  emissivityError: string = null;
  constructor(private extendedSurfaceCompareService: ExtendedSurfaceCompareService) { }

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
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  disableForm() {
    // this.lossesForm.disable();
  }

  enableForm() {
    // this.lossesForm.enable();
  }

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
      this.extendedSurfaceCompareService.inputError.next(true);
    }else{
      this.inputError.emit(false);
      this.extendedSurfaceCompareService.inputError.next(false);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  focusOut() {
    this.changeField.emit('default');
  }
  startSavePolling() {
    this.saveEmit.emit(true);
    this.calculate.emit(true);
  }
  canCompare() {
    if (this.extendedSurfaceCompareService.baselineSurface && this.extendedSurfaceCompareService.modifiedSurface) {
      return true;
    } else {
      return false;
    }
  }
  compareSurfaceArea(): boolean {
    if (this.canCompare()) {
      return this.extendedSurfaceCompareService.compareSurfaceArea(this.lossIndex);
    } else {
      return false;
    }
  }
  compareAmbientTemperature(): boolean {
    if (this.canCompare()) {
      return this.extendedSurfaceCompareService.compareAmbientTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSurfaceTemperature(): boolean {
    if (this.canCompare()) {
      return this.extendedSurfaceCompareService.compareSurfaceTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareSurfaceEmissivity(): boolean {
    if (this.canCompare()) {
      return this.extendedSurfaceCompareService.compareSurfaceEmissivity(this.lossIndex);
    } else {
      return false;
    }
  }

}
