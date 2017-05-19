import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { PsatService } from '../psat.service';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-motor',
  templateUrl: './motor.component.html',
  styleUrls: ['./motor.component.css']
})
export class MotorComponent implements OnInit {
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
  selected: boolean;
  @Input()
  settings: Settings;

  @ViewChild('formRef') formRef: ElementRef;
  elements: any;

  efficiencyClasses: Array<string> = [
    'Standard Efficiency',
    'Energy Efficient',
    // When the user chooses specified, they need a place to put the efficiency value
    'Specified'
  ];

  horsePowers: Array<string> = ['5', '7.5', '10', '15', '20', '25', '30', '40', '50', '60', '75', '100', '125', '150', '200', '250', '300', '350', '400', '450', '500', '600', '700', '800', '900', '1000', '1250', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000', '45000', '50000'];
  kWatts: Array<string> = ['3', '3.7', '4', '4.5', '5.5', '6', '7.5', '9.2', '11', '13', '15', '18.5', '22', '26', '30', '37', '45', '55', '75', '90', '110', '132', '150', '160', '185', '200', '225', '250', '280', '300', '315', '335', '355', '400', '450', '500', '560', '630', '710', '800', '900', '1000', '1250', '1500', '1750', '2000', '2250', '2500', '3000', '3500', '4000', '4500', '5000', '5500', '6000', '7000', '8000', '9000', '10000', '11000', '12000', '13000', '14000', '15000', '16000', '17000', '18000', '19000', '20000', '22500', '25000', '27500', '30000', '35000', '40000'];

  frequencies: Array<string> = [
    '50 Hz',
    '60 Hz'
  ];

  options: Array<any>;
  counter: any;
  psatForm: any;
  isFirstChange: boolean = true;
  formValid: boolean;
  rpmError: string = null;
  voltageError: string = null;
  flaError: string = null;

  efficiencyError: string = null;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.psatForm = this.psatService.getFormFromPsat(this.psat.inputs);
    this.checkForm(this.psatForm);
    if (this.settings.powerMeasurement == 'hp') {
      this.options = this.horsePowers;
    } else {
      this.options = this.kWatts;
    }
    if (this.selected) {
      this.formRef.nativeElement.frequency.focus();
    }
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

  getFullLoadAmps() {
    if (!this.disableFLA()) {
      let tmpEfficiency = this.psatService.getEfficiencyFromForm(this.psatForm);
      let estEfficiency = this.psatService.estFLA(
        this.psatForm.value.horsePower,
        this.psatForm.value.motorRPM,
        this.psatForm.value.frequency,
        this.psatForm.value.efficiencyClass,
        tmpEfficiency,
        this.psatForm.value.motorVoltage,
        this.settings
      );
      this.psatForm.patchValue({
        fullLoadAmps: estEfficiency
      });
    }
  }

  disableFLA() {
    if (
      this.psatForm.controls.frequency.status == 'VALID' &&
      this.psatForm.controls.horsePower.status == 'VALID' &&
      this.psatForm.controls.motorRPM.status == 'VALID' &&
      this.psatForm.controls.efficiencyClass.status == 'VALID' &&
      this.psatForm.controls.motorVoltage.status == 'VALID'
    ) {
      if (this.psatForm.value.efficiencyClass != 'Specified') {
        return false;
      } else {
        if (this.psatForm.value.efficiency) {
          return false;
        } else {
          return true;
        }
      }
    }
    else {
      return true;
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
    if (str == 'motorRPM') {
      this.psatForm.value.motorRPM++;
    } else if (str == 'sizeMargin') {
      this.psatForm.value.sizeMargin++;
    }
    this.checkForm(this.psatForm);
  }

  subtractNum(str: string) {
    if (str == 'motorRPM') {
      if (this.psatForm.value.motorRPM != 0) {
        this.psatForm.value.motorRPM--;
      }
    } else if (str == 'sizeMargin') {
      if (this.psatForm.value.sizeMargin != 0) {
        this.psatForm.value.sizeMargin--;
      }
    }
    this.checkForm(this.psatForm);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  checkForm(form: any) {
    this.formValid = this.psatService.isMotorFormValid(form);
    if (this.formValid) {
      this.isValid.emit(true)
    } else {
      this.isInvalid.emit(true)
    }
  }

  defaultRpm() {
    if (this.psatForm.value.frequency == '60 Hz') {
      if (this.psatForm.value.motorRPM == 1485) {
        this.psatForm.patchValue({
          motorRPM: 1780
        })
      }
    } else if (this.psatForm.value.frequency == '50 Hz') {
      if (this.psatForm.value.motorRPM == 1780) {
        this.psatForm.patchValue({
          motorRPM: 1485
        })
      }
    }
  }

  checkMotorRpm() {
    if (this.psatForm.value.frequency && this.psatForm.value.motorRPM != '') {
      let frequencyEnum = this.psatService.getLineFreqEnum(this.psatForm.value.frequency);
      let tmp = this.psatService.checkMotorRpm(frequencyEnum, this.psatForm.value.motorRPM);
      if (tmp.message) {
        this.rpmError = tmp.message;
      } else {
        this.rpmError = null;
      }
      return tmp.valid;
    }
    else {
      return null;
    }
  }

  checkMotorVoltage() {
    if (this.psatForm.value.motorVoltage != '') {
      let tmp = this.psatService.checkMotorVoltage(this.psatForm.value.motorVoltage);
      if (tmp.message) {
        this.voltageError = tmp.message;
      } else {
        this.voltageError = null;
      }
      return tmp.valid;
    }
    else {
      return null;
    }
  }


  checkEfficiency() {
    if (this.psatForm.value.efficiency > 100) {
      this.efficiencyError = "Unrealistic efficiency, shouldn't be greater then 100%";
      return false;
    }
    else if (this.psatForm.value.efficiency == 0) {
      this.efficiencyError = "Cannot have 0% efficiency";
      return false;
    }
    else if (this.psatForm.value.efficiency < 0) {
      this.efficiencyError = "Cannot have negative efficiency";
      return false;
    }
    else {
      this.efficiencyError = null;
      return true;
    }
  }

  checkFLA() {
    let tmpEfficiency = this.psatService.getEfficiencyFromForm(this.psatForm);
    let estEfficiency = this.psatService.estFLA(
      this.psatForm.value.horsePower,
      this.psatForm.value.motorRPM,
      this.psatForm.value.frequency,
      this.psatForm.value.efficiencyClass,
      tmpEfficiency,
      this.psatForm.value.motorVoltage,
      this.settings
    );

    this.psatService.flaRange.flaMax = estEfficiency * 1.05;
    this.psatService.flaRange.flaMin = estEfficiency * .95;
    //let test = 1 - (this.psatForm.value.fullLoadAmps / estEfficiency);
    if (this.psatForm.value.fullLoadAmps < this.psatService.flaRange.flaMin || this.psatForm.value.fullLoadAmps > this.psatService.flaRange.flaMax) {
      this.flaError = 'Value is outside expected range';
      return false;
    } else {
      this.flaError = null;
      return true;
    }
  }

  savePsat(form: any) {
    this.psat.inputs = this.psatService.getPsatInputsFromForm(form);
    this.saved.emit(this.selected);
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