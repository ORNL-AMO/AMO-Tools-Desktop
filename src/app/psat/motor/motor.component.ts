import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { PsatService } from '../psat.service';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-motor',
  templateUrl: './motor.component.html',
  styleUrls: ['./motor.component.css']
})
export class MotorComponent implements OnInit {
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
  @Input()
  baseline: boolean;

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
  ratedPowerError: string = null;
  disableFLAOptimized: boolean = false;
  constructor(private psatService: PsatService, private compareService: CompareService, private windowRefService: WindowRefService, private helpPanelService: HelpPanelService, private convertUnitsService: ConvertUnitsService) { }

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
    this.helpPanelService.currentField.next('lineFrequency');
    //init alert meessages
    this.checkEfficiency(true);
    this.checkFLA(true);
    this.checkMotorRpm(true);
    this.checkMotorVoltage(true);
    this.checkRatedPower(true);
  }

  ngAfterViewInit() {
    if (this.psat.inputs.optimize_calculation) {
      this.disableOptimized();
    }

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
      this.checkFLA();
    }
  }

  disableFLA() {
    if (!this.disableFLAOptimized) {
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
    } else {
      return true;
    }
  }

  disableOptimized() {
    this.formRef.nativeElement.horsePower.disabled = true;
    this.formRef.nativeElement.efficiencyClass.disabled = true;
    if (this.formRef.nativeElement.efficiency) {
      this.formRef.nativeElement.efficiency.disabled = true;
    }
    this.formRef.nativeElement.fullLoadAmps.disabled = true;
    this.disableFLAOptimized = true;
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
    if (this.psat.inputs.optimize_calculation) {
      this.disableOptimized();
    }

  }

  // addNum(str: string) {
  //   if (str == 'motorRPM') {
  //     this.psatForm.value.motorRPM++;
  //   } else if (str == 'sizeMargin') {
  //     this.psatForm.value.sizeMargin++;
  //   }
  //   this.checkForm(this.psatForm);
  // }
  //
  // subtractNum(str: string) {
  //   if (str == 'motorRPM') {
  //     if (this.psatForm.value.motorRPM != 0) {
  //       this.psatForm.value.motorRPM--;
  //     }
  //   } else if (str == 'sizeMargin') {
  //     if (this.psatForm.value.sizeMargin != 0) {
  //       this.psatForm.value.sizeMargin--;
  //     }
  //   }
  //   this.checkForm(this.psatForm);
  // }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
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

  checkMotorRpm(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.psatForm.value.frequency && this.psatForm.value.motorRPM != '') {
      let frequencyEnum = this.psatService.getLineFreqEnum(this.psatForm.value.frequency);
      let tmp = this.psatService.checkMotorRpm(frequencyEnum, this.psatForm.value.motorRPM);
      if (tmp.message) {
        this.rpmError = tmp.message;
      } else {
        this.rpmError = null;
      }
      return tmp.valid;
    } else if (this.psatForm.value.motorRPM == '') {
      this.rpmError = 'Required';
      return false;
    }
    else {
      return null;
    }
  }

  checkMotorVoltage(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
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


  checkEfficiency(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
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

  checkRatedPower(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    this.checkFLA();
    let motorFieldPower;
    if (this.psatForm.value.loadEstimatedMethod == 'Power') {
      motorFieldPower = this.psatForm.value.motorKW;
    } else if (this.psatForm.value.loadEstimatedMethod == 'Current') {
      motorFieldPower = this.psatForm.value.motorAmps;
    }
    if (motorFieldPower && this.psatForm.value.horsePower) {
      let val, compare;
      if (this.settings.powerMeasurement == 'hp') {
        val = this.convertUnitsService.value(this.psatForm.value.horsePower).from(this.settings.powerMeasurement).to('kW');
        compare = this.convertUnitsService.value(motorFieldPower).from(this.settings.powerMeasurement).to('kW');
      } else {
        val = this.psatForm.value.horsePower;
        compare = motorFieldPower;
      }
      val = val * 1.5;
      if (compare > val) {
        this.ratedPowerError = 'The Field Data Motor Power is to high compared to the Rated Motor Power, please adjust the input values.';
        return false
      } else {
        this.ratedPowerError = null;
        return true
      }
    } else {
      return true;
    }
  }

  checkFLA(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
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

    if (this.psatForm.value.fullLoadAmps) {
      if ((this.psatForm.value.fullLoadAmps < this.psatService.flaRange.flaMin) || (this.psatForm.value.fullLoadAmps > this.psatService.flaRange.flaMax)) {
        this.flaError = 'Value is outside expected range';
        return false;
      } else {
        this.flaError = null;
        return true;
      }
    } else {
      this.flaError = null;
      return true;
    }
  }

  savePsat(form: any) {
    this.psat.inputs = this.psatService.getPsatInputsFromForm(form);
    this.setCompareVals();
    this.saved.emit(this.selected);
  }

  setCompareVals() {
    if (this.baseline) {
      this.compareService.baselinePSAT = this.psat;
    } else {
      this.compareService.modifiedPSAT = this.psat;
    }
    this.compareService.checkMotorDifferent();
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

  initDifferenceMonitor() {
    let doc = this.windowRefService.getDoc();
    //line frequency
    this.compareService.line_frequency_different.subscribe((val) => {
      let lineFreqElements = doc.getElementsByName('frequency');
      lineFreqElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    })
    //motor power
    this.compareService.motor_rated_power_different.subscribe((val) => {
      let horsePowerElements = doc.getElementsByName('horsePower');
      horsePowerElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    })
    //motor rpm
    this.compareService.motor_rated_speed_different.subscribe((val) => {
      let motorRpmElements = doc.getElementsByName('motorRPM');
      motorRpmElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    })
    //efficiency class
    this.compareService.efficiency_class_different.subscribe((val) => {
      let efficiencyClassElements = doc.getElementsByName('efficiencyClass');
      efficiencyClassElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    })
    //efficiency
    this.compareService.efficiency_different.subscribe((val) => {
      let efficiencyElements = doc.getElementsByName('efficiency');
      efficiencyElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    })
    //rated voltage
    this.compareService.motor_rated_voltage_different.subscribe((val) => {
      let motorVoltageElements = doc.getElementsByName('motorVoltage');
      motorVoltageElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    })
    //full load amps
    this.compareService.motor_rated_fla_different.subscribe((val) => {
      let motorFlaElements = doc.getElementsByName('fullLoadAmps');
      motorFlaElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    })
    //size margin
    this.compareService.margin_different.subscribe((val) => {
      let marginElements = doc.getElementsByName('sizeMargin');
      marginElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    })
  }
}
