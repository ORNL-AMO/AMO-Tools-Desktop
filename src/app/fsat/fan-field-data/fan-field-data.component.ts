import { Component, OnInit, Input, ViewChild, SimpleChanges, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { FanFieldDataService } from './fan-field-data.service';
import { ModalDirective } from 'ngx-bootstrap';
import { FieldData, InletPressureData, OutletPressureData, FSAT, PlaneData, FanRatedInfo, CompressibilityFactor, FsatOutput } from '../../shared/models/fans';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { FsatService, InletVelocityPressureInputs } from '../fsat.service';
import { CompareService } from '../compare.service';
import { Subscription } from 'rxjs';
import { FanFieldDataWarnings, FsatWarningService } from '../fsat-warning.service';
import { OperatingHours } from '../../shared/models/operations';

@Component({
  selector: 'app-fan-field-data',
  templateUrl: './fan-field-data.component.html',
  styleUrls: ['./fan-field-data.component.css']
})
export class FanFieldDataComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  fieldData: FieldData;
  @Input()
  modificationIndex: number;
  @Input()
  loadEstimationMethod: string;
  @Input()
  baseline: boolean;
  @Input()
  compareTwoFansAsBaseline: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<FieldData>();
  @Input()
  fsat: FSAT;
  
  inletVelocityPressureInputs: InletVelocityPressureInputs;

  @ViewChild('modalBody', { static: false }) public modalBody: ElementRef;
  @ViewChild('amcaModal', { static: false }) public amcaModal: ModalDirective;
  @ViewChild('pressureModal', { static: false }) public pressureModal: ModalDirective;
  
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
    this.getBodyHeight();
  }

  formWidth: number;
  showOperatingHoursModal: boolean = false;
  userDefinedCompressibilityFactor: boolean = false;

  bodyHeight: number;
  loadEstimateMethods: Array<{ value: number, display: string }> = [
    { value: 0, display: 'Power' },
    { value: 1, display: 'Current' }
  ];

  warnings: FanFieldDataWarnings;
  fieldDataForm: FormGroup;
  pressureCalcType: string;
  pressureModalSub: Subscription;
  modalFsatCopy: FSAT;
  inletPressureCopy: InletPressureData;
  outletPressureCopy: OutletPressureData;
  idString: string;
  disableApplyData: boolean = true;
  userDefinedVelocityPressure: boolean = true;
  constructor(private compareService: CompareService, private fsatWarningService: FsatWarningService, private fanFieldDataService: FanFieldDataService, private helpPanelService: HelpPanelService, private fsatService: FsatService) { }

  ngOnInit() {
    if (!this.baseline) {
      this.idString = 'fsat_modification_' + this.modificationIndex;
    }
    else {
      this.idString = 'fsat_baseline';
    }
    this.init();
    if (!this.selected) {
      this.disableForm();
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected) {
        this.enableForm();
      } else {
        this.disableForm();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.firstChange) {
      this.init();
    }
  }

  ngOnDestroy() {
    this.pressureModalSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100);

    this.pressureModalSub = this.pressureModal.onShown.subscribe(() => {
      this.getBodyHeight();
    });
  }

  disableForm() {
    this.fieldDataForm.controls.loadEstimatedMethod.disable();
  }

  enableForm() {
    this.fieldDataForm.controls.loadEstimatedMethod.enable();
  }

  init() {
    if (this.fieldData) {
      if (!this.fieldData.cost) {
        this.fieldData.cost = this.settings.electricityCost;
      }
      this.fieldDataForm = this.fanFieldDataService.getFormFromObj(this.fieldData);
      this.save();
    }
  }

  toggleUserDefinedCompressibilityFactor() {
    this.userDefinedCompressibilityFactor = !this.userDefinedCompressibilityFactor;
    this.save();
  }

  calculateCompressibility() {
    let tmpResults: FsatOutput = this.fsatService.getResults(this.fsat, true, this.settings);
    let inputs: CompressibilityFactor = {
      moverShaftPower: tmpResults.motorShaftPower,
      inletPressure: this.fieldDataForm.controls.inletPressure.value,
      outletPressure: this.fieldDataForm.controls.outletPressure.value,
      barometricPressure: this.fsat.baseGasDensity.barometricPressure,
      flowRate: this.fieldDataForm.controls.flowRate.value,
      specificHeatRatio: this.fsat.baseGasDensity.specificHeatRatio
    };
    let calcCompFactor: number = this.fsatService.compressibilityFactor(inputs, this.settings);

    this.fieldDataForm.patchValue({
      compressibilityFactor: Number(calcCompFactor.toFixed(3))
    });
  }

  focusField(inputName: string) {
    if (!this.baseline && inputName === 'measuredVoltage') {
      inputName = 'modMeasuredVoltage';
    }
    this.helpPanelService.currentField.next(inputName);
  }

  save(usingModalVelocityPressure?: boolean) {
    if (!this.userDefinedCompressibilityFactor) {
      this.getCompressibilityFactor();
    }
    if (!usingModalVelocityPressure) {
      this.setInletVelocityPressure();
    }
    this.updateOutletPressureValidation();
    let tmpInletPressureData: InletPressureData = this.fieldData.inletPressureData;
    let tmpOutletPressureData: OutletPressureData = this.fieldData.outletPressureData;
    let tmpPlaneData: PlaneData = this.fieldData.planeData;
    let tmpfanRatedInfo: FanRatedInfo = this.fieldData.fanRatedInfo;
    let tmpCalcType: string = this.fieldData.pressureCalcResultType;
    this.fieldData = this.fanFieldDataService.getObjFromForm(this.fieldDataForm);
    this.fieldData.inletPressureData = tmpInletPressureData;
    this.fieldData.outletPressureData = tmpOutletPressureData;
    this.fieldData.planeData = tmpPlaneData;
    this.fieldData.fanRatedInfo = tmpfanRatedInfo;
    this.fieldData.pressureCalcResultType = tmpCalcType;
    this.emitSave.emit(this.fieldData);
    this.checkForWarnings();
  }

  checkForWarnings() {
    this.warnings = this.fsatWarningService.checkFieldDataWarnings(this.fsat, this.settings, !this.baseline);
  }

  getCompressibilityFactor() {
    let fsatOutput: FsatOutput;
    let fsatCopy: FSAT = JSON.parse(JSON.stringify(this.fsat));
    fsatCopy.fieldData = this.fanFieldDataService.getObjFromForm(this.fieldDataForm);
    if(isNaN(fsatCopy.fieldData.compressibilityFactor) || fsatCopy.fieldData.compressibilityFactor == 0 || fsatCopy.fieldData.compressibilityFactor == undefined){
      fsatCopy.fieldData.compressibilityFactor = 1;
    }
    fsatOutput = this.fsatService.getResults(fsatCopy, this.baseline, this.settings);
    let inputs: CompressibilityFactor = {
      moverShaftPower: fsatOutput.fanShaftPower,
      inletPressure: this.fieldDataForm.controls.inletPressure.value,
      outletPressure: this.fieldDataForm.controls.outletPressure.value,
      barometricPressure: this.fsat.baseGasDensity.barometricPressure,
      flowRate: this.fieldDataForm.controls.flowRate.value,
      specificHeatRatio: fsatCopy.baseGasDensity.specificHeatRatio
    };

    let compressibilityFactor: number = this.calculateCompressibilityFactor(inputs, true, fsatOutput, this.compareTwoFansAsBaseline);
    this.fieldDataForm.patchValue({
      compressibilityFactor: Number(compressibilityFactor.toFixed(3))
    });
  }

  calculateCompressibilityFactor(compressibilityFactorInput: CompressibilityFactor, isBaseline: boolean, fsatOutput: FsatOutput, compareAsBaseline: boolean) {
    let compressibilityFactor: number;
    if (isBaseline || compareAsBaseline) {
      compressibilityFactor = this.fsatService.compressibilityFactor(compressibilityFactorInput, this.settings);
    } else {
      let currentMoverShaftPower;
      let diff = 1;

      while (diff > .001) {
        let fanEff = fsatOutput.fanEfficiency;
        // If not first iteration, calculate with moverShaftPower (tempShaftPower from the previous iteration)
        if (currentMoverShaftPower) {
          compressibilityFactorInput.moverShaftPower = currentMoverShaftPower
        }
        compressibilityFactor = this.fsatService.compressibilityFactor(compressibilityFactorInput, this.settings);
        let tempShaftPower = compressibilityFactorInput.flowRate * (compressibilityFactorInput.outletPressure - compressibilityFactorInput.inletPressure) * compressibilityFactor / (6362 * (fanEff / 100));

        diff = Math.abs(compressibilityFactorInput.moverShaftPower - tempShaftPower);
        currentMoverShaftPower = tempShaftPower;
      }
    }
    return compressibilityFactor;
  }

  setInletVelocityPressure() {
    if (this.fieldDataForm.controls.usingStaticPressure.value == true && !this.userDefinedVelocityPressure) {
      if (this.fieldDataForm.controls.flowRate.valid) {
        this.setInletVelocityPressureInputs();
        let calculatedInletVelocityPressure: number = this.fsatService.calculateInletVelocityPressure(this.inletVelocityPressureInputs);
        this.fieldDataForm.patchValue({inletVelocityPressure: calculatedInletVelocityPressure});
      } 
    } else if (this.fieldDataForm.controls.usingStaticPressure.value == false) {
      this.fieldDataForm.patchValue({inletVelocityPressure: 0});
    }
  }

  setInletVelocityPressureInputs() {
    this.inletVelocityPressureInputs = {
      ductArea: this.fieldDataForm.controls.ductArea.value,
      gasDensity: this.fsat.baseGasDensity.gasDensity,
      flowRate: this.fieldDataForm.controls.flowRate.value
    }
  }

  setPressureType(usingStaticPressure: boolean) {
    this.fieldDataForm.patchValue({
      usingStaticPressure: usingStaticPressure,
    });
    this.save();
  }

  toggleUserDefinedVelocityPressure() {
    this.userDefinedVelocityPressure = !this.userDefinedVelocityPressure;
    this.save();
  }

  showInletPressureModal() {
    this.setInletVelocityPressureInputs();
    if (this.fieldData.inletPressureData) {
      this.inletPressureCopy = JSON.parse(JSON.stringify(this.fieldData.inletPressureData));
    }
    this.pressureCalcType = 'inlet';
    this.fsatService.modalOpen.next(true);
    this.pressureModal.show();
  }

  showOutletPressureModal() {
    this.setInletVelocityPressureInputs();
    if (this.fieldData.outletPressureData) {
      this.outletPressureCopy = JSON.parse(JSON.stringify(this.fieldData.outletPressureData));
    }
    this.pressureCalcType = 'outlet';
    this.fsatService.modalOpen.next(true);
    this.pressureModal.show();
  }

  showAmcaModal() {
    this.modalFsatCopy = JSON.parse(JSON.stringify(this.fsat));
    if (this.fsat.modalFieldData) {
      this.modalFsatCopy.fieldData = this.fsat.modalFieldData;
    }
    this.pressureCalcType = 'flow';
    this.fsatService.modalOpen.next(true);
    this.pressureModal.show();
  }

  hidePressureModal() {
    this.pressureCalcType = undefined;
    this.fsatService.modalOpen.next(false);
    this.pressureModal.hide();
  }

  resetModalData() {
    this.fsat.modalFieldData = undefined;
    this.disableApplyData = false;
    this.hidePressureModal();
  }

  saveOutletPressure(outletPressureData: OutletPressureData) {
    this.fieldData.outletPressureData = outletPressureData;
    this.fieldDataForm.patchValue({
      outletPressure: this.fieldData.outletPressureData.calculatedOutletPressure
    });
    this.save();
  }

  saveOutletPressureCopy(outletPressureData: OutletPressureData) {
    this.outletPressureCopy = outletPressureData;
  }
  saveInletPressure(inletPressureData: InletPressureData) {
    this.fieldData.inletPressureData = inletPressureData;
    this.fieldDataForm.patchValue({
      inletPressure: this.fieldData.inletPressureData.calculatedInletPressure
    });
    this.save();
  }

  saveInletPressureCopy(inletPressureData: InletPressureData) {
    this.inletPressureCopy = inletPressureData;
  }

  saveFlowAndPressure(fieldData: FieldData) {
    let inletVelocityPressure = this.fieldDataForm.controls.inletVelocityPressure.value;
    let usingModalVelocityPressure: boolean = false;
    // If modal has plane 1 veloP result and staticP use it for FSAT
    if (fieldData.usingStaticPressure && fieldData.inletVelocityPressure) {
      inletVelocityPressure = fieldData.inletVelocityPressure;
      usingModalVelocityPressure = true;
      this.userDefinedVelocityPressure = true;
    }
    this.fieldData.inletPressure = fieldData.inletPressure;
    this.fieldData.usingStaticPressure = fieldData.usingStaticPressure;
    this.fieldData.outletPressure = fieldData.outletPressure;
    this.fieldData.flowRate = fieldData.flowRate;
    this.fieldData.fanRatedInfo = fieldData.fanRatedInfo;
    this.fieldData.planeData = fieldData.planeData;
    this.fieldDataForm.patchValue({
      inletPressure: this.fieldData.inletPressure,
      outletPressure: this.fieldData.outletPressure,
      inletVelocityPressure: inletVelocityPressure,
      usingStaticPressure: this.fieldData.usingStaticPressure,
      flowRate: this.fieldData.flowRate
    });
    this.save(usingModalVelocityPressure);
  }

  updateFsatWithModalData(modalFieldData: FieldData) {
    this.fsat.modalFieldData = JSON.parse(JSON.stringify(modalFieldData));
  }

  updateOutletPressureValidation() {
    this.fieldDataForm.controls.outletPressure.setValidators([Validators.required, Validators.min(this.fieldDataForm.controls.inletPressure.value)]);
    this.fieldDataForm.controls.outletPressure.updateValueAndValidity();
  }

  setCalcInvalid(isCalcValid: boolean) {
    this.disableApplyData = isCalcValid;
  }

  applyModalData() {
    if (this.pressureCalcType === 'flow') {
      this.saveFlowAndPressure(this.fsat.modalFieldData);
      this.fsat.modalFieldData = undefined;
    } else if (this.pressureCalcType === 'inlet') {
      this.saveInletPressure(this.inletPressureCopy);
    } else if (this.pressureCalcType === 'outlet') {
      this.saveOutletPressure(this.outletPressureCopy);
    } 
    this.hidePressureModal();
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
    this.fsatService.modalOpen.next(false);
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
    this.fsatService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.fsat.operatingHours = oppHours;
    this.fieldDataForm.controls.operatingHours.patchValue(oppHours.hoursPerYear);
    this.save();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }


  getBodyHeight() {
    if (this.modalBody) {
      this.bodyHeight = this.modalBody.nativeElement.clientHeight;
    } else {
      this.bodyHeight = 0;
    }
  }

  canCompare() {
    if (this.compareService.baselineFSAT && this.compareService.modifiedFSAT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isOperatingHoursDifferent() {
    if (this.canCompare()) {
      return this.compareService.isOperatingHoursDifferent();
    } else {
      return false;
    }
  }
  isCostDifferent() {
    if (this.canCompare()) {
      return this.compareService.isCostDifferent();
    } else {
      return false;
    }
  }
  isFlowRateDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFlowRateDifferent();
    } else {
      return false;
    }
  }
  isInletPressureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isInletPressureDifferent();
    } else {
      return false;
    }
  }
  isInletVelocityPressureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isInletVelocityPressureDifferent();
    } else {
      return false;
    }
  }
  isDuctAreaDifferent() {
    if (this.canCompare()) {
      return this.compareService.isDuctAreaDifferent();
    } else {
      return false;
    }
  }
  isOutletPressureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isOutletPressureDifferent();
    } else {
      return false;
    }
  }
    // isLoadEstimatedMethodDifferent() {
  //   if (this.canCompare()) {
  //     return this.compareService.isLoadEstimatedMethodDifferent();
  //   } else {
  //     return false;
  //   }
  // }
  // isMotorPowerDifferent() {
  //   if (this.canCompare()) {
  //     return this.compareService.isMotorPowerDifferent();
  //   } else {
  //     return false;
  //   }
  // }

  isCompressibilityFactorDifferent() {
    if (this.canCompare()) {
      return this.compareService.isCompressibilityFactorDifferent();
    } else {
      return false;
    }
  }
  isMeasuredVoltageDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMeasuredVoltageDifferent();
    } else {
      return false;
    }
  }
}