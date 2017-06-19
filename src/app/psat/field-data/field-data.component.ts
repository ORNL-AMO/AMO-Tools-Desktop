import { Component, OnInit, Output, EventEmitter, ViewChild, Input, SimpleChanges, ElementRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { PSAT } from '../../shared/models/psat';
import { PsatService } from '../psat.service';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';

@Component({
  selector: 'app-field-data',
  templateUrl: './field-data.component.html',
  styleUrls: ['./field-data.component.css']
})
export class FieldDataComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  saveClicked: boolean;
  @Output('isValid')
  isValid = new EventEmitter<boolean>();
  @Output('isInvalid')
  isInvalid = new EventEmitter<boolean>();
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Input()
  isBaseline: boolean;
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
  constructor(private psatService: PsatService, private compareService: CompareService, private windowRefService: WindowRefService) { }

  ngOnInit() {
    this.psatForm = this.psatService.getFormFromPsat(this.psat.inputs);
    this.checkForm(this.psatForm);
    if (this.selected) {
      this.formRef.nativeElement.operatingFraction.focus();
    }
  }

  ngAfterViewInit() {
    if (!this.selected) {
      this.disableForm();
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
  }

  enableForm() {
    this.elements = this.formRef.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
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
    console.log('setCompareVals');
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

  checkFlowRate() {
    if (this.psatForm.controls.flowRate.pristine == false) {
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

  checkVoltage() {
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


  checkCost() {
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

  checkOpFraction() {
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
    //load estimation method
    this.compareService.load_estimation_method_different.subscribe((val) => {
      let loadEstimationElements = doc.getElementsByName('loadEstimatedMethod');
      loadEstimationElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    });
    //motor power A
    this.compareService.motor_field_power_different.subscribe((val) => {
      let motorFieldPowerElements = doc.getElementsByName('motorKW');
      motorFieldPowerElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    });
    //motor power kw
    this.compareService.motor_field_current_different.subscribe((val) => {
      let motorFieldCurrentElements = doc.getElementsByName('motorAmps');
      motorFieldCurrentElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    });
    //measured voltage
    this.compareService.motor_field_voltage_different.subscribe((val) => {
      let motorFieldVoltageElements = doc.getElementsByName('measuredVoltage');
      motorFieldVoltageElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    });
  }
}
