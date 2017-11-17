import { Component, OnInit, Output, EventEmitter, ViewChild, Input, SimpleChanges, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { PSAT } from '../../shared/models/psat';
import { PsatService } from '../psat.service';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-field-data',
  templateUrl: './field-data.component.html',
  styleUrls: ['./field-data.component.css']
})
export class FieldDataComponent implements OnInit {
  @Input()
  psat: PSAT;
  // @Output('changeField')
  // changeField = new EventEmitter<string>();
  @Input()
  saveClicked: boolean;
  @Output('isValid')
  isValid = new EventEmitter<boolean>();
  @Output('isInvalid')
  isInvalid = new EventEmitter<boolean>();
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Output('openHeadTool')
  openHeadTool = new EventEmitter<boolean>();
  @Output('closeHeadTool')
  closeHeadTool = new EventEmitter<boolean>();
  @Input()
  baseline: boolean;

  counter: any;

  @ViewChild('formRef') formRef: ElementRef;

  @ViewChild('formRef2') formRef2: ElementRef;
  elements: any;

  formValid: boolean;
  headToolResults: any = {
    differentialElevationHead: 0.0,
    differentialPressureHead: 0.0,
    differentialVelocityHead: 0.0,
    estimatedSuctionFrictionHead: 0.0,
    estimatedDischargeFrictionHead: 0.0,
    pumpHead: 0.0
  };

  //Create your array of options
  //first item in array will be default selected, can modify that functionality later if desired
  loadEstimateMethods: Array<string> = [
    'Power',
    'Current'
  ];
  psatForm: any;
  isFirstChange: boolean = true;
  flowError: string = null;
  voltageError: string = null;
  costError: string = null;
  opFractionError: string = null;
  ratedPowerError: string = null;
  marginError: string = null;
  headError: string = null;
  constructor(private psatService: PsatService, private compareService: CompareService, private windowRefService: WindowRefService, private helpPanelService: HelpPanelService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.psatForm = this.psatService.getFormFromPsat(this.psat.inputs);
    this.checkForm(this.psatForm);
    this.helpPanelService.currentField.next('operatingFraction');
    //init warning messages;
    this.checkCost(true);
    this.checkFlowRate(true);
    this.checkOpFraction(true);
    this.checkRatedPower(true);
    this.checkVoltage(true);
    if (this.psatForm.value.optimizeCalculation == true) {
      this.checkMargin(true);
    }
    this.checkHead(true);
  }

  ngAfterViewInit() {
    if (!this.selected) {
      this.disableForm();
    }
    if (this.selected) {
      this.formRef.nativeElement.operatingFraction.focus();
    }
    this.setCompareVals();
    this.initDifferenceMonitor();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange) {
      if (changes.saveClicked) {
        this.savePsat(this.psatForm);
      }
      if (!this.selected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
      this.setCompareVals();
    }
    else {
      this.isFirstChange = false;
    }
  }

  disableForm() {
    this.elements = this.formRef.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = true;
    }
    this.elements = this.formRef2.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = true;
    }

  }

  enableForm() {
    this.elements = this.formRef.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
    this.elements = this.formRef2.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }

  checkForm(form: any) {
    this.formValid = this.psatService.isFieldDataFormValid(form);
    if (this.formValid) {
      this.isValid.emit(true)
    } else {
      this.isInvalid.emit(true)
    }
  }

  savePsat(form: any) {
    this.psat.inputs = this.psatService.getPsatInputsFromForm(form);
    this.setCompareVals();
    this.saved.emit(true);
  }


  setCompareVals() {
    if (this.baseline) {
      this.compareService.baselinePSAT = this.psat;
    } else {
      this.compareService.modifiedPSAT = this.psat;
    }
    this.compareService.checkFieldDataDifferent();
  }

  @ViewChild('headToolModal') public headToolModal: ModalDirective;
  showHeadToolModal() {
    if (this.selected) {
      this.openHeadTool.emit(true);
      this.headToolModal.show();
    }
  }

  hideHeadToolModal() {
    this.closeHeadTool.emit(true);
    if (this.psatForm.value.head != this.psat.inputs.head) {
      this.psatForm.patchValue({
        head: this.psat.inputs.head
      })
    }
    this.headToolModal.hide();
  }

  startSavePolling() {
    this.checkForm(this.psatForm);
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.savePsat(this.psatForm)
    }, 3000)
  }

  checkFlowRate(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.psatForm.controls.flowRate.pristine == false && this.psatForm.value.flowRate != '') {
      let tmp = this.psatService.checkFlowRate(this.psat.inputs.pump_style, this.psatForm.value.flowRate, this.settings);
      if (tmp.message) {
        this.flowError = tmp.message;
      } else {
        this.flowError = null;
      }
      return tmp.valid;
    }
    else {
      return null;
    }
  }

  checkVoltage(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.psatForm.value.measuredVoltage < 1 || this.psatForm.value.measuredVoltage == 0) {
      this.voltageError = 'Outside estimated voltage range';
      return false;
    } else if (this.psatForm.value.measuredVoltage > 13800) {
      this.voltageError = 'Outside estimated voltage range';
      return false;
    }
    else if (this.psatForm.value.measuredVoltage <= 13800 && this.psatForm.value.measuredVoltage >= 1) {
      this.voltageError = null;
      return true;
    }
    else {
      this.voltageError = null;
      return null;
    }
  }


  checkCost(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.psatForm.value.costKwHr < 0) {
      this.costError = 'Cannot have negative cost';
      return false;
    } else if (this.psatForm.value.costKwHr > 1) {
      this.costError = "Shouldn't be greater then 1";
      return false;
    } else if (this.psatForm.value.costKwHr >= 0 && this.psatForm.value.costKwHr <= 1) {
      this.costError = null;
      return true;
    } else {
      this.costError = null;
      return null;
    }
  }

  checkOpFraction(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.psatForm.value.operatingFraction > 1) {
      this.opFractionError = 'Operating fraction needs to be between 0 - 1';
      return false;
    }
    else if (this.psatForm.value.operatingFraction < 0) {
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
      this.startSavePolling();
    }
    let tmpVal;
    if (this.psatForm.value.loadEstimatedMethod == 'Power') {
      tmpVal = this.psatForm.value.motorKW;
    } else {
      tmpVal = this.psatForm.value.motorAmps;
    }

    if (this.psatForm.value.horsePower && tmpVal) {
      let val, compare;
      if (this.settings.powerMeasurement == 'hp') {
        val = this.convertUnitsService.value(tmpVal).from(this.settings.powerMeasurement).to('kW');
        compare = this.convertUnitsService.value(this.psatForm.value.horsePower).from(this.settings.powerMeasurement).to('kW');
      } else {
        val = tmpVal;
        compare = this.psatForm.value.horsePower;
      }
      compare = compare * 1.5;
      if (val > compare) {
        this.ratedPowerError = 'The Field Data Motor Power is too high compared to the Rated Motor Power, please adjust the input values.';
        return false
      } else {
        this.ratedPowerError = null;
        return true
      }
    } else {
      return true;
    }
  }

  checkMargin(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.psatForm.value.sizeMargin > 100) {
      this.marginError = "Unrealistic size margin, shouldn't be greater then 100%";
      return false;
    }
    else if (this.psatForm.value.sizeMargin < 0) {
      this.marginError = "Shouldn't have negative size margin";
      return false;
    }
    else {
      this.marginError = null;
      return true;
    }
  }

  checkHead(bool?: boolean){
    if(!bool){
      this.startSavePolling();
    }
    if(this.psatForm.value.head < 0){
      this.headError = 'Head cannot be negative';
    }else{
      this.headError = null;
    }
  }


  // subtractViscosity() {
  //   this.psatForm.value.viscosity = this.psatForm.value.viscosity - 1
  //   this.startSavePolling();
  //
  // }
  //
  // addViscosity() {
  //   this.psatForm.value.viscosity = this.psatForm.value.viscosity + 1
  //   this.startSavePolling();
  // }

  //used to add classes to inputs with different baseline vs modification values
  initDifferenceMonitor() {
    let doc = this.windowRefService.getDoc();

    //operating fraction
    this.compareService.operating_fraction_different.subscribe((val) => {
      let opFractionElements = doc.getElementsByName('operatingFraction');
      opFractionElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    });
    //cost kw hr
    this.compareService.cost_kw_hour_different.subscribe((val) => {
      let costElements = doc.getElementsByName('costKwHr');
      costElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    });
    //flow rate
    this.compareService.flow_rate_different.subscribe((val) => {
      let flowRateElements = doc.getElementsByName('flowRate');
      flowRateElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    });
    //head
    this.compareService.head_different.subscribe((val) => {
      let headElements = doc.getElementsByName('head');
      headElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    });
    // //load estimation method
    // this.compareService.load_estimation_method_different.subscribe((val) => {
    //   if (val && !this.baseline) {
    //     this.psat.inputs.load_estimation_method = this.compareService.baselinePSAT.inputs.load_estimation_method;
    //   }
    // });
    // //motor power A
    // this.compareService.motor_field_power_different.subscribe((val) => {
    //   if (val && !this.baseline) {
    //     this.psat.inputs.motor_field_power = this.compareService.baselinePSAT.inputs.motor_field_power;
    //   }
    // });
    // //motor power kw
    // this.compareService.motor_field_current_different.subscribe((val) => {
    //   if (val && !this.baseline) {
    //     this.psat.inputs.motor_field_current = this.compareService.baselinePSAT.inputs.motor_field_current;
    //   }
    // });
    // //measured voltage
    // this.compareService.motor_field_voltage_different.subscribe((val) => {
    //   if (val && !this.baseline) {
    //     this.psat.inputs.motor_field_voltage = this.compareService.baselinePSAT.inputs.motor_field_voltage;
    //   }
    // });
  }
}
