import { Component, OnInit, Input, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { FanFieldDataService } from './fan-field-data.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ModalDirective } from 'ngx-bootstrap';
import { FieldData } from '../../shared/models/fans';
import { HelpPanelService } from '../help-panel/help-panel.service';

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


  @ViewChild('amcaModal') public amcaModal: ModalDirective;

  loadEstimateMethods: Array<string> = [
    'Power',
    'Current'
  ];

  flowError: string = null;
  voltageError: string = null;
  costError: string = null;
  opFractionError: string = null;
  ratedPowerError: string = null;
  marginError: string = null;
  outletPressureError: string = null;
  fieldDataForm: FormGroup;
  constructor(private fanFieldDataService: FanFieldDataService, private convertUnitsService: ConvertUnitsService, private helpPanelService: HelpPanelService) { }

  ngOnInit() {
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
    if (this.selected) {
      // this.openHeadTool.emit(true);
      this.amcaModal.show();
    }
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
    this.fieldData = this.fanFieldDataService.getObjFromForm(this.fieldDataForm);
    this.emitSave.emit(this.fieldData);
  }

  checkFlowRate(bool?: boolean) {
    if (!bool) {
      this.save();
    }
    // if (this.fieldDataForm.controls.flowRate.pristine == false && this.fieldDataForm.controls.flowRate.value != '') {
    //   let tmp = this.psatService.checkFlowRate(this.psat.inputs.pump_style, this.fieldDataForm.controls.flowRate.value, this.settings);
    //   if (tmp.message) {
    //     this.flowError = tmp.message;
    //   } else {
    //     this.flowError = null;
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
}
