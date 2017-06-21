import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { PsatService } from '../psat.service';
import { PSAT, PsatInputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-pump-fluid',
  templateUrl: './pump-fluid.component.html',
  styleUrls: ['./pump-fluid.component.css']
})
export class PumpFluidComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  saveClicked: boolean;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Output('isValid')
  isValid = new EventEmitter<boolean>();
  @Output('isInvalid')
  isInvalid = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;

  @ViewChild('formRef') formRef: ElementRef;
  elements: any;

  counter: any;

  formValid: boolean;
  pumpTypes: Array<string> = [
    'End Suction Slurry',
    'End Suction Sewage',
    'End Suction Stock',
    'End Suction Submersible Sewage',
    'API Double Suction',
    'Multistage Boiler Feed',
    'End Suction ANSI/API',
    'Axial Flow',
    'Double Suction',
    'Vertical Turbine',
    'Large End Suction',
    // When user selects below they need a way to provide the optimal efficiency
    'Specified Optimal Efficiency'
  ];

  drives: Array<string> = [
    'Direct Drive',
    'Belt Drive'
  ];
  psatForm: any;
  isFirstChange: boolean = true;
  rpmError: string = null;
  constructor(private psatService: PsatService) { }

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

  ngOnInit() {
    this.psatForm = this.psatService.getFormFromPsat(this.psat.inputs);
    this.checkForm(this.psatForm);
    if (this.selected) {
      this.formRef.nativeElement.pumpType.focus();
    }
  }

  ngAfterViewInit() {
    if (!this.selected) {
      this.disableForm();
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

  addNum(str: string) {
    if (str == 'viscosity') {
      this.psatForm.value.viscosity++;
    } else if (str == 'stages') {
      this.psatForm.value.stages++;
    }
    this.checkForm(this.psatForm);
  }

  subtractNum(str: string) {
    if (str == 'viscosity') {
      if (this.psatForm.value.viscosity != 0) {
        this.psatForm.value.viscosity--;
      }
    } else if (str == 'stages') {
      if (this.psatForm.value.stages != 0) {
        this.psatForm.value.stages--;
      }
    }
    this.checkForm(this.psatForm);
  }

  focusField(str: string) {
    if (str == 'fixedSpecificSpeed') {
      this.startSavePolling();
    }
    this.changeField.emit(str);
    this.checkForm(this.psatForm);
  }

  checkForm(form: any) {
    this.formValid = this.psatService.isPumpFluidFormValid(form);
    if (this.formValid) {
      this.isValid.emit(true)
    } else {
      this.isInvalid.emit(true)
    }
  }

  savePsat(form: any) {
    this.psat.inputs = this.psatService.getPsatInputsFromForm(form);
    this.saved.emit(this.selected);
  }

  checkPumpRpm() {
    let min = 0;
    let max = 0;
    if (this.psatForm.value.drive == 'Direct Drive') {
      min = 540;
      max = 3960;
    } else if (this.psatForm.value.drive == 'Belt Drive') {
      //TODO UPDATE WITH BELT DRIVE VALS
      min = 540;
      max = 3960;
    }
    if (this.psatForm.value.pumpRPM < min) {
      this.rpmError = 'Value is too small';
      return false;
    } else if (this.psatForm.value.pumpRPM > max) {
      this.rpmError = 'Value is too large';
      return false;
    } else if (this.psatForm.value.pumpRPM >= min && this.psatForm.value.pumpRPM <= max) {
      this.rpmError = null;
      return true;
    } else {
      this.rpmError = null;
      return null;
    }
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

}


