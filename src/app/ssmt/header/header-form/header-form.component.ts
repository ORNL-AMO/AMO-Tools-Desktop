import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { HeaderService, HeaderRanges } from '../header.service';
import { SsmtService } from '../../ssmt.service';
import { HeaderNotHighestPressure, HeaderWithHighestPressure } from '../../../shared/models/steam/ssmt';
import { CompareService } from '../../compare.service';

@Component({
  selector: 'app-header-form',
  templateUrl: './header-form.component.html',
  styleUrls: ['./header-form.component.css']
})
export class HeaderFormComponent implements OnInit {
  @Input()
  headerForm: FormGroup;
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<HeaderNotHighestPressure | HeaderWithHighestPressure>();
  @Input()
  pressureLevel: string;
  @Input()
  numberOfHeaders: number;
  @Input()
  inSetup: boolean;
  @Input()
  idString: string;

  headerLabel: string;
  minPressureErrorMsg: string;
  maxPressureErrorMsg: string;
  constructor(private headerService: HeaderService, private ssmtService: SsmtService, private compareService: CompareService) { }

  ngOnInit() {
    if (this.selected === false) {
      this.disableForm();
    } else {
      this.enableForm();
    }
    this.setErrorMsgs();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (this.selected === false) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    }

    if (changes.numberOfHeaders && !changes.numberOfHeaders.isFirstChange()) {
      this.setErrorMsgs();
    }
  }

  setErrorMsgs() {
    if (this.pressureLevel === 'highPressure') {
      if (this.numberOfHeaders == 1) {
        this.minPressureErrorMsg = 'Value can\'t be less than deaerator pressure: ';
      } else {
        this.minPressureErrorMsg = 'Value must be greater than ';

      }
      this.maxPressureErrorMsg = 'Value must be less than ';
    } else {
      if (this.pressureLevel === 'lowPressure') {
        this.minPressureErrorMsg = 'Value can\'t be less than deaerator pressure: ';
      } else {
        this.minPressureErrorMsg = 'Value must be greater than low pressure header: ';
      }
      this.maxPressureErrorMsg = 'Value must be less than higher pressure headers: ';
    }
  }


  enableForm() {
    if (this.pressureLevel === 'highPressure') {
      this.headerForm.controls.flashCondensateReturn.enable();
    } else {
      this.headerForm.controls.flashCondensateIntoHeader.enable();
      this.headerForm.controls.desuperheatSteamIntoNextHighest.enable();
    }
  }

  disableForm() {
    if (this.pressureLevel === 'highPressure') {
      this.headerForm.controls.flashCondensateReturn.disable();
    } else {
      this.headerForm.controls.flashCondensateIntoHeader.disable();
      this.headerForm.controls.desuperheatSteamIntoNextHighest.disable();
    }
  }

  focusField(str: string) {
    this.ssmtService.numberOfHeadersHelp.next(this.numberOfHeaders);
    this.ssmtService.headerPressureLevelHelp.next(this.pressureLevel);
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }

  save() {
    if (this.pressureLevel === 'highPressure') {
      let tmpHeader: HeaderWithHighestPressure = this.headerService.getHighestPressureObjFromForm(this.headerForm);
      this.emitSave.emit(tmpHeader);
    } else {
      let tmpHeader: HeaderNotHighestPressure = this.headerService.initHeaderObjFromForm(this.headerForm);
      this.emitSave.emit(tmpHeader);
    }
  }

  setDesuperheatSteam() {
    let ranges: HeaderRanges = this.headerService.getRanges(this.settings, undefined, undefined, undefined, this.headerForm.controls.pressure.value);
    let tmpDesuperheatSteamTemperatureValidators: Array<ValidatorFn>;
    if (this.headerForm.controls.desuperheatSteamIntoNextHighest.value === true) {
      tmpDesuperheatSteamTemperatureValidators = [Validators.required, Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)];
    } else {
      tmpDesuperheatSteamTemperatureValidators = [Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)];
    }
    this.headerForm.controls.desuperheatSteamTemperature.setValidators(tmpDesuperheatSteamTemperatureValidators);
    this.headerForm.controls.desuperheatSteamTemperature.reset(this.headerForm.controls.desuperheatSteamTemperature.value);
    this.headerForm.controls.desuperheatSteamTemperature.markAsDirty();
    this.save();
  }

  canCompare(): boolean {
    if (this.compareService.baselineSSMT && this.compareService.modifiedSSMT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }
  isPressureDifferent(): boolean {
    if (this.canCompare()) {
      return this.compareService.isPressureDifferent(this.pressureLevel+'Header');
    } else {
      return false;
    }
  }
  isProcessSteamUsageDifferent(): boolean {
    if (this.canCompare()) {
      return this.compareService.isProcessSteamUsageDifferent(this.pressureLevel+'Header');
    } else {
      return false;
    }
  }
  isCondensationRecoveryRateDifferent(): boolean {
    if (this.canCompare()) {
      return this.compareService.isCondensationRecoveryRateDifferent(this.pressureLevel+'Header');
    } else {
      return false;
    }
  }
  isHeatLossDifferent(): boolean {
    if (this.canCompare()) {
      return this.compareService.isHeatLossDifferent(this.pressureLevel+'Header');
    } else {
      return false;
    }
  }
  isCondensateReturnTemperatureDifferent(): boolean {
    if (this.canCompare()) {
      return this.compareService.isCondensateReturnTemperatureDifferent();
    } else {
      return false;
    }
  }
  isFlashCondensateReturnDifferent(): boolean {
    if (this.canCompare()) {
      return this.compareService.isFlashCondensateReturnDifferent();
    } else {
      return false;
    }
  }
  isFlashCondensateIntoHeaderDifferent(): boolean {
    if (this.canCompare()) {
      return this.compareService.isFlashCondensateIntoHeaderDifferent(this.pressureLevel+'Header');
    } else {
      return false;
    }
  }
  isDesuperheatSteamIntoNextHighestDifferent(): boolean {
    if (this.canCompare()) {
      return this.compareService.isDesuperheatSteamIntoNextHighestDifferent(this.pressureLevel+'Header');
    } else {
      return false;
    }
  }
  isDesuperheatSteamTemperatureDifferent(): boolean {
    if (this.canCompare()) {
      return this.compareService.isDesuperheatSteamTemperatureDifferent(this.pressureLevel+'Header');
    } else {
      return false;
    }
  }
}
