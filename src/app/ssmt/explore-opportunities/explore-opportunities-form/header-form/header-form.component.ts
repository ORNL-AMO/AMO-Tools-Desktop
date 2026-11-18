import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SSMT, HeaderWithHighestPressure, HeaderNotHighestPressure, ProcessSteamUsageData } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { HeaderService, HeaderRanges, HeaderWarnings } from '../../../header/header.service';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { SsmtService } from '../../../ssmt.service';
import { ProcessSteamUsageModalComponent } from '../../../header/process-steam-usage-modal/process-steam-usage-modal.component';
import { ProcessSteamUsageService, SteamHeaderKey, SteamHeaderPressureLevel } from '../../../header/process-steam-usage-modal/process-steam-usage.service';
import { CondensateHandlingFormComponent } from './condensate-handling-form/condensate-handling-form.component';

@Component({
    selector: 'app-header-form',
    templateUrl: './header-form.component.html',
    styleUrls: ['./header-form.component.css'],
    standalone: false
})
export class HeaderFormComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<SSMT>();
  @ViewChild('processSteamUsageModal', { static: false }) processSteamUsageModal: ModalDirective;
  @ViewChild(ProcessSteamUsageModalComponent) processSteamUsageCalculator: ProcessSteamUsageModalComponent;
  @ViewChild(CondensateHandlingFormComponent) condensateHandlingForm: CondensateHandlingFormComponent;

  showHighPressureHeatLoss: boolean = false;
  showMediumPressureHeatLoss: boolean = false;
  showLowPressureHeatLoss: boolean = false;
  showHighPressureSteamUsage: boolean = false;
  showMediumPressureSteamUsage: boolean = false;
  showLowPressureSteamUsage: boolean = false;

  baselineHighPressureForm: UntypedFormGroup;
  modificationHighPressureForm: UntypedFormGroup;

  baselineLowPressureForm: UntypedFormGroup;
  modificationLowPressureForm: UntypedFormGroup;

  baselineMediumPressureForm: UntypedFormGroup;
  modificationMediumPressureForm: UntypedFormGroup;
  baselineWarnings: HeaderWarnings;
  modificationWarnings: HeaderWarnings;
  processSteamUsageHeader: SteamHeaderKey;
  processSteamUsagePressureLevel: SteamHeaderPressureLevel;
  processSteamUsageDataCopy: ProcessSteamUsageData;
  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService, private headerService: HeaderService,
    private ssmtService: SsmtService, private processSteamUsageService: ProcessSteamUsageService) { }

  ngOnInit() {
    this.initFormSetup();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex && !changes.exploreModIndex.isFirstChange()) {
        this.initFormSetup();
    }
  }

  initFormSetup() {
    this.initForms();
    this.initHeatLoss();
    this.initSteamUsage();
    this.setWarnings();
  }

  initForms() {
    if (this.ssmt.headerInput.highPressureHeader) {
      this.baselineHighPressureForm = this.headerService.getHighestPressureHeaderFormFromObj(this.ssmt.headerInput.highPressureHeader, this.settings, this.ssmt.boilerInput, undefined);
    } else {
      this.baselineHighPressureForm = this.headerService.initHighestPressureHeaderForm(this.settings, this.ssmt.boilerInput, undefined);
    }
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader) {
      this.modificationHighPressureForm = this.headerService.getHighestPressureHeaderFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader, this.settings, this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput, undefined);
    } else {
      this.modificationHighPressureForm = this.headerService.initHighestPressureHeaderForm(this.settings, this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput, undefined);
    }

    if (this.ssmt.headerInput.lowPressureHeader) {
      let pressureMax: number;
      if (this.ssmt.headerInput.numberOfHeaders == 3) {
        pressureMax = this.ssmt.headerInput.mediumPressureHeader.pressure;
      } else {
        pressureMax = this.ssmt.headerInput.highPressureHeader.pressure;
      }
      this.baselineLowPressureForm = this.headerService.getHeaderFormFromObj(this.ssmt.headerInput.lowPressureHeader, this.settings, undefined, pressureMax);
    } else {
      this.baselineLowPressureForm = this.headerService.initHeaderForm(this.settings, false, undefined, undefined);
    }
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressureHeader) {
      let pressureMax: number;
      if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.numberOfHeaders == 3) {
        pressureMax = this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressureHeader.pressure;
      } else {
        pressureMax = this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader.pressure;
      }
      this.modificationLowPressureForm = this.headerService.getHeaderFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressureHeader, this.settings, undefined, pressureMax);
    } else {
      this.modificationLowPressureForm = this.headerService.initHeaderForm(this.settings, true, undefined, undefined);
    }

    if (this.ssmt.headerInput.mediumPressureHeader) {
      this.baselineMediumPressureForm = this.headerService.getHeaderFormFromObj(this.ssmt.headerInput.mediumPressureHeader, this.settings, this.ssmt.headerInput.lowPressureHeader.pressure, this.ssmt.headerInput.highPressureHeader.pressure);
    } else {
      this.baselineMediumPressureForm = this.headerService.initHeaderForm(this.settings, false, undefined, undefined);
    }
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressureHeader) {
      this.modificationMediumPressureForm = this.headerService.getHeaderFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressureHeader, this.settings, this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressureHeader.pressure, this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader.pressure);
    } else {
      this.modificationMediumPressureForm = this.headerService.initHeaderForm(this.settings, true, undefined, undefined);
    }
    this.baselineHighPressureForm.disable();
    this.baselineLowPressureForm.disable();
    this.baselineMediumPressureForm.disable();
  }

  //HEAT LOSS
  initHeatLoss() {
    this.showMediumPressureHeatLoss = false;
    this.showLowPressureHeatLoss = false;
    this.initHighPressureHeatLoss();
    if (this.ssmt.headerInput.mediumPressureHeader) {
      this.initMediumPressureHeatLoss();
    }
    if (this.ssmt.headerInput.lowPressureHeader) {
      this.initLowPressureHeatLoss();
    }
    if (this.showHighPressureHeatLoss || this.showMediumPressureHeatLoss || this.showLowPressureHeatLoss) {
      this.ssmt.modifications[this.exploreModIndex].exploreOppsShowHeatLoss = { hasOpportunity: true, display: "Adjust Heat Loss Percentages" };
    } else {
      this.ssmt.modifications[this.exploreModIndex].exploreOppsShowHeatLoss = { hasOpportunity: false, display: "Adjust Heat Loss Percentages" };
    }
  }

  initHighPressureHeatLoss() {
    if (this.baselineHighPressureForm.controls.heatLoss.value !== this.modificationHighPressureForm.controls.heatLoss.value) {
      this.showHighPressureHeatLoss = true;
    } else {
      this.showHighPressureHeatLoss = false;
    }
  }
  initMediumPressureHeatLoss() {
    if (this.baselineMediumPressureForm.controls.heatLoss.value !== this.modificationMediumPressureForm.controls.heatLoss.value) {
      this.showMediumPressureHeatLoss = true;
    }
  }
  initLowPressureHeatLoss() {
    if (this.baselineLowPressureForm.controls.heatLoss.value !== this.modificationLowPressureForm.controls.heatLoss.value) {
      this.showLowPressureHeatLoss = true;
    }
  }

  toggleHeatLoss() {
    this.showHighPressureHeatLoss = false;
    this.showMediumPressureHeatLoss = false;
    this.showLowPressureHeatLoss = false;
    this.toggleHighPressureHeatLoss();
    if (this.baselineMediumPressureForm.controls) {
      this.toggleMediumPressureHeatLoss();
    }
    if (this.baselineLowPressureForm) {
      this.toggleLowPressureHeatLoss();
    }
  }

  toggleHighPressureHeatLoss() {
    if (this.showHighPressureHeatLoss === false) {
      this.modificationHighPressureForm.controls.heatLoss.patchValue(this.baselineHighPressureForm.controls.heatLoss.value);
      this.save();
    }
  }

  toggleMediumPressureHeatLoss() {
    if (this.showMediumPressureHeatLoss === false) {
      this.modificationMediumPressureForm.controls.heatLoss.patchValue(this.baselineMediumPressureForm.controls.heatLoss.value);
      this.save();
    }
  }

  toggleLowPressureHeatLoss() {
    if (this.showLowPressureHeatLoss === false) {
      this.modificationLowPressureForm.controls.heatLoss.patchValue(this.baselineLowPressureForm.controls.heatLoss.value);
      this.save();
    }
  }
  //STEAM USAGE
  initSteamUsage() {
    this.showMediumPressureSteamUsage = false;
    this.showLowPressureSteamUsage = false;
    this.initHighPressureSteamUsage();
    if (this.baselineMediumPressureForm.controls) {
      this.initMediumPressureSteamUsage();
    }
    if (this.baselineLowPressureForm) {
      this.initLowPressureSteamUsage();
    }
    if (this.showHighPressureSteamUsage || this.showMediumPressureSteamUsage || this.showLowPressureSteamUsage) {
      this.ssmt.modifications[this.exploreModIndex].exploreOppsShowSteamUsage = { hasOpportunity: true, display: "Adjust Steam Demand/Usage" };
    } else {
      this.ssmt.modifications[this.exploreModIndex].exploreOppsShowSteamUsage = { hasOpportunity: false, display: "Adjust Steam Demand/Usage" };
    }
  }

  initHighPressureSteamUsage() {
    if (this.baselineHighPressureForm.controls.processSteamUsage.value !== this.modificationHighPressureForm.controls.processSteamUsage.value
      || this.isProcessSteamUsageDataModified('highPressureHeader')) {
      this.showHighPressureSteamUsage = true;
    } else {
      this.showHighPressureHeatLoss = false;
    }
  }
  initMediumPressureSteamUsage() {
    if (this.modificationMediumPressureForm.controls.useBaselineProcessSteamUsage.value == false
      || this.isProcessSteamUsageDataModified('mediumPressureHeader')) {
      this.showMediumPressureSteamUsage = true;
    }
  }
  initLowPressureSteamUsage() {
    if (this.modificationLowPressureForm.controls.useBaselineProcessSteamUsage.value == false
      || this.isProcessSteamUsageDataModified('lowPressureHeader')) {
      this.showLowPressureSteamUsage = true;
    }
  }

  toggleSteamUsage() {
    this.showHighPressureSteamUsage = false;
    this.showMediumPressureSteamUsage = false;
    this.showLowPressureSteamUsage = false;
    this.toggleHighPressureSteamUsage();
    if (this.baselineMediumPressureForm.controls) {
      this.toggleMediumPressureSteamUsage();
    }
    if (this.baselineLowPressureForm) {
      this.toggleLowPressureSteamUsage();
    }
  }
  toggleHighPressureSteamUsage() {
    if (this.showHighPressureSteamUsage === false && this.hasProcessSteamUsageData('highPressureHeader')) {
      this.resetProcessSteamUsage('highPressureHeader');
      return;
    }
    if (this.showHighPressureSteamUsage === false) {
      this.modificationHighPressureForm.controls.processSteamUsage.patchValue(this.baselineHighPressureForm.controls.processSteamUsage.value);
      this.save();
    }
  }

  toggleMediumPressureSteamUsage() {
    if (this.showMediumPressureSteamUsage === false && this.hasProcessSteamUsageData('mediumPressureHeader')) {
      this.resetProcessSteamUsage('mediumPressureHeader');
      return;
    }
    if (this.showMediumPressureSteamUsage === false) {
      this.modificationMediumPressureForm.controls.processSteamUsage.patchValue(this.baselineMediumPressureForm.controls.processSteamUsage.value);
      this.save();
    }
    this.modificationMediumPressureForm.controls.useBaselineProcessSteamUsage.patchValue(!this.showMediumPressureSteamUsage);
  }

  toggleLowPressureSteamUsage() {
    if (this.showLowPressureSteamUsage === false && this.hasProcessSteamUsageData('lowPressureHeader')) {
      this.resetProcessSteamUsage('lowPressureHeader');
      return;
    }
    if (this.showLowPressureSteamUsage === false) {
      this.modificationLowPressureForm.controls.processSteamUsage.patchValue(this.baselineLowPressureForm.controls.processSteamUsage.value);
      this.save();
    }
    this.modificationLowPressureForm.controls.useBaselineProcessSteamUsage.patchValue(!this.showLowPressureSteamUsage);
  }

  hasProcessSteamUsageData(header: SteamHeaderKey): boolean {
    return !!this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput[header]?.processSteamUsageData;
  }

  isProcessSteamUsageDataModified(header: SteamHeaderKey): boolean {
    return this.processSteamUsageService.isDataModified(
      this.ssmt.headerInput[header]?.processSteamUsageData,
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput[header]?.processSteamUsageData
    );
  }

  showProcessSteamUsageModal(header: SteamHeaderKey) {
    const modificationForm = this.getModificationHeaderForm(header);
    const baselineForm = this.getBaselineHeaderForm(header);
    const useBaselineValues = header !== 'highPressureHeader' && modificationForm.controls.useBaselineProcessSteamUsage.value;
    const data = this.hasProcessSteamUsageData(header)
      ? this.processSteamUsageService.copyData(this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput[header].processSteamUsageData)
      : this.processSteamUsageService.getDefaultData(
        useBaselineValues ? baselineForm.controls.processSteamUsage.value : modificationForm.controls.processSteamUsage.value,
        modificationForm.controls.condensationRecoveryRate.value
      );
    this.processSteamUsageHeader = header;
    this.processSteamUsagePressureLevel = this.processSteamUsageService.getPressureLevel(header);
    this.processSteamUsageDataCopy = this.processSteamUsageService.updateCalculatedLosses(data, this.processSteamUsagePressureLevel, this.settings);
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
    const header = this.processSteamUsageHeader;
    const data = this.processSteamUsageService.updateCalculatedLosses(
      this.processSteamUsageCalculator.getData(),
      this.processSteamUsagePressureLevel,
      this.settings
    );
    const totals = this.processSteamUsageService.calculateTotals(data);
    const modificationForm = this.getModificationHeaderForm(header);
    modificationForm.patchValue({
      processSteamUsage: totals.processSteamUsage,
      condensationRecoveryRate: totals.condensateRecoveryRate
    });
    if (header !== 'highPressureHeader') {
      modificationForm.controls.useBaselineProcessSteamUsage.patchValue(false);
    }
    this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput[header].processSteamUsageData = data;
    // The calculator sets both values, so both checkboxes for this header are turned on together.
    this.setSteamUsageShown(header, true);
    this.condensateHandlingForm.setCondensateRecoveryShown(header, true);
    this.ssmt.modifications[this.exploreModIndex].exploreOppsShowSteamUsage.hasOpportunity = true;
    this.ssmt.modifications[this.exploreModIndex].exploreOppsShowCondensateHandling.hasOpportunity = true;
    this.save();
    this.hideProcessSteamUsageModal();
  }

  // Unchecking either box for a header with calculated rows puts both values and the rows back to baseline.
  resetProcessSteamUsage(header: SteamHeaderKey) {
    const modificationForm = this.getModificationHeaderForm(header);
    const baselineForm = this.getBaselineHeaderForm(header);
    modificationForm.patchValue({
      processSteamUsage: baselineForm.controls.processSteamUsage.value,
      condensationRecoveryRate: baselineForm.controls.condensationRecoveryRate.value
    });
    if (header !== 'highPressureHeader') {
      modificationForm.controls.useBaselineProcessSteamUsage.patchValue(true);
    }
    this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput[header].processSteamUsageData =
      this.processSteamUsageService.copyData(this.ssmt.headerInput[header]?.processSteamUsageData);
    this.setSteamUsageShown(header, false);
    this.condensateHandlingForm?.setCondensateRecoveryShown(header, false);
    this.save();
  }

  setSteamUsageShown(header: SteamHeaderKey, shown: boolean) {
    if (header === 'highPressureHeader') {
      this.showHighPressureSteamUsage = shown;
    } else if (header === 'mediumPressureHeader') {
      this.showMediumPressureSteamUsage = shown;
    } else {
      this.showLowPressureSteamUsage = shown;
    }
  }

  getModificationHeaderForm(header: SteamHeaderKey): UntypedFormGroup {
    if (header === 'highPressureHeader') {
      return this.modificationHighPressureForm;
    } else if (header === 'mediumPressureHeader') {
      return this.modificationMediumPressureForm;
    }
    return this.modificationLowPressureForm;
  }

  getBaselineHeaderForm(header: SteamHeaderKey): UntypedFormGroup {
    if (header === 'highPressureHeader') {
      return this.baselineHighPressureForm;
    } else if (header === 'mediumPressureHeader') {
      return this.baselineMediumPressureForm;
    }
    return this.baselineLowPressureForm;
  }

  save() {
    // add rest of baseline if we ever enable baseline
    // let tmpBaselineHighPressureHeader: HeaderWithHighestPressure = this.headerService.getHighestPressureObjFromForm(this.baselineHighPressureForm);
    // this.ssmt.headerInput.highPressureHeader = tmpBaselineHighPressureHeader;
    let tmpModificationHighPressureHeader: HeaderWithHighestPressure = this.headerService.getHighestPressureObjFromForm(this.modificationHighPressureForm);
    tmpModificationHighPressureHeader.processSteamUsageData = this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader?.processSteamUsageData;
    this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader = tmpModificationHighPressureHeader;
    let tmpModificationMediumPressureHeader: HeaderNotHighestPressure = this.headerService.initHeaderObjFromForm(this.modificationMediumPressureForm);
    tmpModificationMediumPressureHeader.processSteamUsageData = this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressureHeader?.processSteamUsageData;
    this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressureHeader = tmpModificationMediumPressureHeader;
    let tmpModificationLowPressureHeader: HeaderNotHighestPressure = this.headerService.initHeaderObjFromForm(this.modificationLowPressureForm);
    tmpModificationLowPressureHeader.processSteamUsageData = this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressureHeader?.processSteamUsageData;
    this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressureHeader = tmpModificationLowPressureHeader;
    this.updatePressureMaxMins();
    this.setWarnings();
    this.emitSave.emit(this.ssmt);
  }

  focusField(str: string) {
    this.exploreOpportunitiesService.currentTab.next('header');
    this.ssmtService.isBaselineFocused.next(false);
    this.exploreOpportunitiesService.currentField.next(str);
  }


  updatePressureMaxMins() {
    // add rest of baseline if we ever enable baseline
    let pressureMax: number;
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.numberOfHeaders == 3) {
      pressureMax = this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressureHeader.pressure;
    } else {
      pressureMax = this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader.pressure;
    }
    let ranges: HeaderRanges = this.headerService.getRanges(this.settings, undefined, undefined, pressureMax);
    this.modificationLowPressureForm.controls.pressure.setValidators([Validators.required, Validators.max(ranges.pressureMax), Validators.min(ranges.pressureMin)]);
    this.modificationLowPressureForm.controls.pressure.updateValueAndValidity();

    ranges = this.headerService.getRanges(this.settings, undefined, this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressureHeader.pressure, this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader.pressure);
    this.modificationMediumPressureForm.controls.pressure.setValidators([Validators.required, Validators.max(ranges.pressureMax), Validators.min(ranges.pressureMin)]);
    this.modificationMediumPressureForm.controls.pressure.updateValueAndValidity();
  }

  setWarnings(){
    this.baselineWarnings = this.headerService.checkHeaderWarnings(this.ssmt, 'highPressure', this.settings);
    this.modificationWarnings = this.headerService.checkHeaderWarnings(this.ssmt.modifications[this.exploreModIndex].ssmt, 'highPressure', this.settings);
  }
}
