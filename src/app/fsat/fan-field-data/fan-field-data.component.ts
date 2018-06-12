import { Component, OnInit, Input, ViewChild, SimpleChanges, Output, EventEmitter, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { FanFieldDataService } from './fan-field-data.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ModalDirective } from 'ngx-bootstrap';
import { FieldData, InletPressureData, OutletPressureData, FSAT, PlaneData, FanRatedInfo } from '../../shared/models/fans';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { FsatService } from '../fsat.service';
import { CompareService } from '../compare.service';

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
  @Output('emitSave')
  emitSave = new EventEmitter<FieldData>();
  @Input()
  fsat: FSAT;

  @ViewChild('modalBody') public modalBody: ElementRef;
  @ViewChild('amcaModal') public amcaModal: ModalDirective;
  @ViewChild('pressureModal') public pressureModal: ModalDirective;

  bodyHeight: number;
  loadEstimateMethods: Array<{ value: number, display: string }> = [
    { value: 0, display: 'Power' },
    { value: 1, display: 'Current' }
  ];

  flowRateError: string = null;
  voltageError: string = null;
  costError: string = null;
  opFractionError: string = null;
  ratedPowerError: string = null;
  marginError: string = null;
  outletPressureError: string = null;
  specificHeatRatioError: string = null;
  compressibilityFactorError: string = null;
  fieldDataForm: FormGroup;
  pressureCalcType: string;
  constructor(private compareService: CompareService, private fanFieldDataService: FanFieldDataService, private convertUnitsService: ConvertUnitsService, private helpPanelService: HelpPanelService, private fsatService: FsatService) { }

  ngOnInit() {
    this.init();
    if (!this.selected) {
      this.disableForm();
    }

    this.pressureModal.onShown.subscribe(() => {
      this.getBodyHeight();
    })
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

  disableForm() {
    this.fieldDataForm.controls.loadEstimatedMethod.disable();
  }

  enableForm() {
    this.fieldDataForm.controls.loadEstimatedMethod.enable();
  }

  init() {
    if (this.fieldData) {
      this.fieldDataForm = this.fanFieldDataService.getFormFromObj(this.fieldData);
      this.checkForm(this.fieldDataForm);
      // this.helpPanelService.currentField.next('operatingFraction');
      //init warning messages;
      this.checkCost(true);
      this.checkFlowRate(true);
      this.checkOpFraction(true);
      this.checkRatedPower(true);
      //this.cd.detectChanges();
    }
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }

  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

  checkForm(form: any) {
    // this.formValid = this.psatService.isFieldDataFormValid(form);
    // if (this.formValid) {
    //   this.isValid.emit(true)
    // } else {
    //   this.isInvalid.emit(true)
    // }
  }


  showAmcaModal() {
    this.pressureCalcType = 'flow';
    this.fsatService.modalOpen.next(true);
    this.pressureModal.show();
  }

  hideAmcaModal() {
    // this.closeHeadTool.emit(true);
    // if (this.fieldDataForm.controls.head.value != this.psat.inputs.head) {
    //   this.fieldDataForm.patchValue({
    //     head: this.psat.inputs.head
    //   })
    // }
    // this.amcaModal.hide();
  }

  save() {
    this.checkForWarnings();
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
  }

  checkForWarnings() {
    //outletPressure
    if(this.fieldDataForm.controls.outletPressure.value < 0) {
        this.outletPressureError = 'Value must be greater than or equal to 0';
    } else {
	this.outletPressureError = null;
    }
    //flowRate
    if(this.fieldDataForm.controls.flowRate.value < 0) {
	this.flowRateError = 'Value must be greater than or equal to 0';
    } else {
	this.flowRateError = null;
    }
    //specificHeatRatio
    if(this.fieldDataForm.controls.specificHeatRatio.value < 0) {
	this.specificHeatRatioError = 'Value must be greater than or equal to 0';
    } else {
	this.specificHeatRatioError = null;
    }
    //compressibilityFactor
    if(this.fieldDataForm.controls.compressibilityFactor.value < 0) {
	this.compressibilityFactorError = 'Value must be greater than or equal to 0';
    } else {
	this.compressibilityFactorError = null;
    }
  }

  checkFlowRate(bool?: boolean) {
    if (!bool) {
      this.save();
    }
    // if (this.fieldDataForm.controls.flowRate.pristine == false && this.fieldDataForm.controls.flowRate.value != '') {
    //   let tmp = this.psatService.checkFlowRate(this.psat.inputs.pump_style, this.fieldDataForm.controls.flowRate.value, this.settings);
    //   if (tmp.message) {
    //     this.flowRateError = tmp.message;
    //   } else {
    //     this.flowRateError = null;
    //   }
    //   return tmp.valid;
    // }
    // else {
    //   return null;
    // }
    return null;
  }


  checkCost(bool?: boolean) {
    if (!bool) {
      this.save();
    }
    if (this.fieldDataForm.controls.cost.value < 0) {
      this.costError = 'Cannot have negative cost';
      return false;
    } else if (this.fieldDataForm.controls.cost.value > 1) {
      this.costError = "Shouldn't be greater then 1";
      return false;
    } else if (this.fieldDataForm.controls.cost.value >= 0 && this.fieldDataForm.controls.cost.value <= 1) {
      this.costError = null;
      return true;
    } else {
      this.costError = null;
      return null;
    }
  }

  checkOpFraction(bool?: boolean) {
    if (!bool) {
      this.save();
    }
    if (this.fieldDataForm.controls.operatingFraction.value > 1) {
      this.opFractionError = 'Operating fraction needs to be between 0 - 1';
      return false;
    }
    else if (this.fieldDataForm.controls.operatingFraction.value < 0) {
      this.opFractionError = "Cannot have negative operating fraction";
      return false;
    }
    else {
      this.opFractionError = null;
      return true;
    }
  }
  checkRatedPower(bool?: boolean) {
    if (!bool) {
      this.save();
    }
    // let tmpVal;
    // if (this.fieldDataForm.controls.loadEstimatedMethod.value == 'Power') {
    //   tmpVal = this.fieldDataForm.controls.motorKW.value;
    // } else {
    //   tmpVal = this.fieldDataForm.controls.motorAmps.value;
    // }

    // if (this.fieldDataForm.controls.horsePower.value && tmpVal) {
    //   let val, compare;
    //   if (this.settings.powerMeasurement == 'hp') {
    //     val = this.convertUnitsService.value(tmpVal).from(this.settings.powerMeasurement).to('kW');
    //     compare = this.convertUnitsService.value(this.fieldDataForm.controls.horsePower.value).from(this.settings.powerMeasurement).to('kW');
    //   } else {
    //     val = tmpVal;
    //     compare = this.fieldDataForm.controls.horsePower.value;
    //   }
    //   compare = compare * 1.5;
    //   if (val > compare) {
    //     this.ratedPowerError = 'The Field Data Motor Power is too high compared to the Rated Motor Power, please adjust the input values.';
    //     return false
    //   } else {
    //     this.ratedPowerError = null;
    //     return true
    //   }
    // } else {
    //   return true;
    // }
    return true;
  }

  checkOutletPressure(bool?: boolean) {
    if (!bool) {
      this.save();
    }

    if (this.fieldDataForm.controls.outletPressure.value <= 0) {
      this.outletPressureError = 'Must be greater then 0';
    } else {
      this.outletPressureError = null;
    }
  }

  optimizeCalc(bool: boolean) {
    if (!bool || !this.selected) {
      this.fieldDataForm.controls.sizeMargin.disable();
      // this.fieldDataForm.controls.fixedSpeed.disable();
    } else {
      this.fieldDataForm.controls.sizeMargin.enable();
      // this.fieldDataForm.controls.fixedSpeed.enable();
    }
    this.fieldDataForm.patchValue({
      optimizeCalculation: bool
    });
    this.save();
  }


  estimateOutletPressure() {
    //todo
  }

  estimateInletPressure() {
    //todo
  }

  calculatCompressibility() {
    //todo
  }

  showInletPressureModal() {
    this.pressureCalcType = 'inlet';
    this.fsatService.modalOpen.next(true);
    this.pressureModal.show();
  }

  showOutletPressureModal() {
    this.pressureCalcType = 'outlet';
    this.fsatService.modalOpen.next(true);
    this.pressureModal.show();
  }


  hidePressureModal() {
    this.pressureCalcType = undefined;
    this.fsatService.modalOpen.next(false);
    this.pressureModal.hide();
  }

  saveOutletPressure(outletPressureData: OutletPressureData) {
    this.fieldData.outletPressureData = outletPressureData;
    this.fieldDataForm.patchValue({
      outletPressure: this.fieldData.outletPressureData
    });
    this.save();
  }


  saveInletPressure(inletPressureData: InletPressureData) {
    this.fieldData.inletPressureData = inletPressureData;
    this.fieldDataForm.patchValue({
      inletPressure: this.fieldData.inletPressureData
    })
    this.save();
  }

  saveFlowAndPressure(fsat: FSAT) {
    this.fieldData.inletPressure = fsat.fieldData.inletPressure;
    this.fieldData.outletPressure = fsat.fieldData.outletPressure;
    this.fieldData.flowRate = fsat.fieldData.flowRate;
    this.fieldData.fanRatedInfo = fsat.fieldData.fanRatedInfo;
    this.fieldData.planeData = fsat.fieldData.planeData;
    this.fieldDataForm.patchValue({
      inletPressure: this.fieldData.inletPressure,
      outletPressure: this.fieldData.outletPressure,
      flowRate: this.fieldData.flowRate
    })
    this.save();
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

  isOperatingFractionDifferent() {
    if (this.canCompare()) {
      return this.compareService.isOperatingFractionDifferent();
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
  isSpecificHeatRatioDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSpecificHeatRatioDifferent();
    } else {
      return false;
    }
  }
  isCompressibilityFactorDifferent() {
    if (this.canCompare()) {
      return this.compareService.isCompressibilityFactorDifferent();
    } else {
      return false;
    }
  }
  // isMeasuredVoltageDifferent() {
  //   if (this.canCompare()) {
  //     return this.compareService.isMeasuredVoltageDifferent();
  //   } else {
  //     return false;
  //   }
  // }


}
