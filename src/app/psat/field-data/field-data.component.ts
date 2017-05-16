import { Component, OnInit, Output, EventEmitter, ViewChild, Input, SimpleChanges, ElementRef } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { PSAT } from '../../shared/models/psat';
import { PsatService } from '../psat.service';
import { Settings } from '../../shared/models/settings';
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

  counter: any;

  @ViewChild('formRef') formRef: ElementRef;
  elements: any;
  @ViewChild('flowRatePopover') flowRatePopover: ElementRef;

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
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.psatForm = this.psatService.getFormFromPsat(this.psat.inputs);
    this.checkForm(this.psatForm);
  }

  ngAfterViewInit() {
    if (!this.selected) {
      this.disableForm();
    }
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
    this.saved.emit(true);
  }


  @ViewChild('headToolModal') public headToolModal: ModalDirective;
  showHeadToolModal() {
    this.headToolModal.show();
  }

  hideHeadToolModal() {
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
    if (this.psat.inputs.pump_style && this.psatForm.value.flowRate != '') {
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
      this.voltageError = 'Value is too small';
      return false;
    } else if (this.psatForm.value.measuredVoltage > 13800) {
      this.voltageError = 'Value is too large.';
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
}
