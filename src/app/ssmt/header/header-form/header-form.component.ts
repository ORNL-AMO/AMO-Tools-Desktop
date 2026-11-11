import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { UntypedFormGroup, Validators, ValidatorFn } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Settings } from '../../../shared/models/settings';
import { HeaderService, HeaderRanges, HeaderWarnings} from '../header.service';
import { SsmtService } from '../../ssmt.service';
import { BoilerInput, HeaderNotHighestPressure, HeaderWithHighestPressure, ProcessSteamUsageData, SSMT } from '../../../shared/models/steam/ssmt';
import { CompareService } from '../../compare.service';
import { ProcessSteamUsageModalComponent } from '../process-steam-usage-modal/process-steam-usage-modal.component';
import { ProcessSteamUsageService, SteamHeaderPressureLevel } from '../process-steam-usage-modal/process-steam-usage.service';

@Component({
    selector: 'app-header-form',
    templateUrl: './header-form.component.html',
    styleUrls: ['./header-form.component.css'],
    standalone: false
})
export class HeaderFormComponent implements OnInit {
  @Input()
  headerForm: UntypedFormGroup;
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<HeaderNotHighestPressure | HeaderWithHighestPressure>();
  @Input()
  pressureLevel: SteamHeaderPressureLevel;
  @Input()
  numberOfHeaders: number;
  @Input()
  inSetup: boolean;
  @Input()
  idString: string;
  @Input()
  isBaseline: boolean;
  @Input()
  headerInput: HeaderNotHighestPressure | HeaderWithHighestPressure;
  @Input()
  boilerInput: BoilerInput;
  @Input()
  ssmt: SSMT;
  @ViewChild('processSteamUsageModal', { static: false }) processSteamUsageModal: ModalDirective;
  @ViewChild(ProcessSteamUsageModalComponent) processSteamUsageCalculator: ProcessSteamUsageModalComponent;

  warnings: HeaderWarnings;
  headerLabel: string;
  minPressureErrorMsg: string;
  maxPressureErrorMsg: string;
  showProcessSteamUsage: boolean = true;
  processSteamUsageData: ProcessSteamUsageData;
  processSteamUsageDataCopy: ProcessSteamUsageData;
  constructor(
    private headerService: HeaderService,
    private ssmtService: SsmtService,
    private compareService: CompareService,
    private processSteamUsageService: ProcessSteamUsageService
  ) { }

  ngOnInit() {
    this.processSteamUsageData = this.headerInput?.processSteamUsageData;
    this.warnings = this.headerService.checkHeaderWarnings(this.ssmt, this.pressureLevel, this.settings);
    if (this.selected === false) {
      this.disableForm();
    } else {
      this.enableForm();
    }
    this.setErrorMsgs();
    if (this.isBaseline == false && this.pressureLevel != 'highPressure' && this.headerForm.controls.useBaselineProcessSteamUsage.value == true) {
      this.showProcessSteamUsage = false;
    }
    // numberOfHeaders may have changed before init. save to update ssmt-tab status - causes ngChangedAfterCheckedError
    this.save();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.headerInput && !changes.headerInput.isFirstChange()) {
      this.processSteamUsageData = changes.headerInput.currentValue?.processSteamUsageData;
    }
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
      if (this.numberOfHeaders !== 1) {
        this.minPressureErrorMsg = 'Value must be greater than Lower pressure Headers: ';
      }
      this.maxPressureErrorMsg = 'Value must be less than ';
    } else if (this.pressureLevel === 'mediumPressure') {
      this.minPressureErrorMsg = 'Value must be greater than Low Pressure Header: ';
      this.maxPressureErrorMsg = 'Value must be less than Higher Pressure Headers: ';
    } else if (this.pressureLevel === 'lowPressure') {
      this.maxPressureErrorMsg = 'Value must be less than Higher Pressure Headers: ';
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
    this.ssmtService.isBaselineFocused.next(this.isBaseline);
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }

  save() {
    if (this.pressureLevel === 'highPressure') {
      let tmpHeader: HeaderWithHighestPressure = this.headerService.getHighestPressureObjFromForm(this.headerForm);
      tmpHeader.processSteamUsageData = this.processSteamUsageData;
      this.ssmt.headerInput.highPressureHeader = tmpHeader;
      this.emitSave.emit(tmpHeader);
    } else {
      let tmpHeader: HeaderNotHighestPressure = this.headerService.initHeaderObjFromForm(this.headerForm);
      tmpHeader.processSteamUsageData = this.processSteamUsageData;
      if(this.pressureLevel  == 'mediumPressure'){
        this.ssmt.headerInput.mediumPressureHeader = tmpHeader;
      }else{
        this.ssmt.headerInput.lowPressureHeader = tmpHeader;
      }
      this.emitSave.emit(tmpHeader);
    }
    this.warnings = this.headerService.checkHeaderWarnings(this.ssmt, this.pressureLevel, this.settings);
  }

  showProcessSteamUsageModal() {
    if (!this.selected || !this.showProcessSteamUsage) {
      return;
    }
    const data = this.processSteamUsageData
      ? JSON.parse(JSON.stringify(this.processSteamUsageData))
      : this.processSteamUsageService.getDefaultData(
        this.headerForm.controls.processSteamUsage.value,
        this.headerForm.controls.condensationRecoveryRate.value
      );
    this.processSteamUsageDataCopy = this.processSteamUsageService.updateCalculatedLosses(data, this.pressureLevel, this.settings);
    this.ssmtService.modalOpen.next(true);
    this.processSteamUsageModal.show();
  }

  hideProcessSteamUsageModal() {
    this.ssmtService.modalOpen.next(false);
    this.processSteamUsageModal.hide();
    this.processSteamUsageDataCopy = undefined;
  }

  applyProcessSteamUsageData() {
    if (!this.processSteamUsageCalculator || this.processSteamUsageCalculator.form.invalid) {
      this.processSteamUsageCalculator?.form.markAllAsTouched();
      return;
    }
    this.processSteamUsageData = this.processSteamUsageService.updateCalculatedLosses(
      this.processSteamUsageCalculator.getData(),
      this.pressureLevel,
      this.settings
    );
    const totals = this.processSteamUsageService.calculateTotals(this.processSteamUsageData);
    this.headerForm.patchValue({
      processSteamUsage: totals.processSteamUsage,
      condensationRecoveryRate: totals.condensateRecoveryRate
    });
    this.save();
    this.hideProcessSteamUsageModal();
  }

  setDesuperheatSteam() {
    if (this.pressureLevel != 'highPressure') {
      let ranges: HeaderRanges = this.headerService.getRanges(this.settings, undefined, undefined, this.headerForm.controls.pressure.value);
      let tmpDesuperheatSteamTemperatureValidators: Array<ValidatorFn>;
      if (this.headerForm.controls.desuperheatSteamIntoNextHighest.value === true) {
        tmpDesuperheatSteamTemperatureValidators = [Validators.required, Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)];
      } else {
        tmpDesuperheatSteamTemperatureValidators = [Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)];
      }
      this.headerForm.controls.desuperheatSteamTemperature.setValidators(tmpDesuperheatSteamTemperatureValidators);
      this.headerForm.controls.desuperheatSteamTemperature.reset(this.headerForm.controls.desuperheatSteamTemperature.value);
      this.headerForm.controls.desuperheatSteamTemperature.markAsDirty();
    }
    this.save();
  }

  setCustomProcessUsage() {
    this.headerForm.controls.useBaselineProcessSteamUsage.patchValue(false);
    this.showProcessSteamUsage = true;
    if (this.processSteamUsageData) {
      const totals = this.processSteamUsageService.calculateTotals(this.processSteamUsageData);
      this.headerForm.patchValue({
        processSteamUsage: totals.processSteamUsage,
        condensationRecoveryRate: totals.condensateRecoveryRate
      });
    }
    this.save();
  }

  setUseBaselineProcessUsage() {
    this.headerForm.controls.useBaselineProcessSteamUsage.patchValue(true);
    if (this.pressureLevel == 'lowPressure') {
      this.headerForm.controls.processSteamUsage.patchValue(this.compareService.baselineSSMT.headerInput.lowPressureHeader.processSteamUsage);
    } else if (this.pressureLevel == 'mediumPressure') {
      this.headerForm.controls.processSteamUsage.patchValue(this.compareService.baselineSSMT.headerInput.mediumPressureHeader.processSteamUsage);
    }
    this.showProcessSteamUsage = false;
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
      return this.compareService.isPressureDifferent(this.pressureLevel + 'Header');
    } else {
      return false;
    }
  }
  isProcessSteamUsageDifferent(): boolean {
    if (this.canCompare()) {
      if (this.pressureLevel == 'highPressure') {
        return this.compareService.isHighPressureProcessSteamUsageDifferent();
      } else {
        return this.compareService.isNotHighPressureProcessSteamUsageDifferent(this.pressureLevel + 'Header');
      }

    } else {
      return false;
    }
  }
  isCondensationRecoveryRateDifferent(): boolean {
    if (this.canCompare()) {
      return this.compareService.isCondensationRecoveryRateDifferent(this.pressureLevel + 'Header');
    } else {
      return false;
    }
  }
  isHeatLossDifferent(): boolean {
    if (this.canCompare()) {
      return this.compareService.isHeatLossDifferent(this.pressureLevel + 'Header');
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
      return this.compareService.isFlashCondensateIntoHeaderDifferent(this.pressureLevel + 'Header');
    } else {
      return false;
    }
  }
  isDesuperheatSteamIntoNextHighestDifferent(): boolean {
    if (this.canCompare()) {
      return this.compareService.isDesuperheatSteamIntoNextHighestDifferent(this.pressureLevel + 'Header');
    } else {
      return false;
    }
  }
  isDesuperheatSteamTemperatureDifferent(): boolean {
    if (this.canCompare()) {
      return this.compareService.isDesuperheatSteamTemperatureDifferent(this.pressureLevel + 'Header');
    } else {
      return false;
    }
  }
}
