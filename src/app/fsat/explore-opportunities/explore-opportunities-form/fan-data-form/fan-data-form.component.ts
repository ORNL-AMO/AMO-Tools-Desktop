import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT } from '../../../../shared/models/fans';
@Component({
  selector: 'app-fan-data-form',
  templateUrl: './fan-data-form.component.html',
  styleUrls: ['./fan-data-form.component.css']
})
export class FanDataFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Input()
  fsat: FSAT;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();

  fanTypes: Array<string> = [
    'Airfoil (SISW)',
    'Backward Curved (SISW)',
    'Radial (SISW)',
    'Radial Tip (SISW)',
    'Backward Inclined (SISW)',
    'Airfoil (DIDW)',
    'Backward Inclined (DIDW)',
    'ICF Air handling',
    'ICF Material handling',
    'ICF Long shavings'
  ]

  drives: Array<string> = [
    'Direct Drive',
    'V-Belt Drive',
    'Notched V-Belt Drive',
    'Synchronous Belt Drive'
  ];
  showPumpData: boolean = false;
  showFanType: boolean = false;
  showMotorDrive: boolean = false;
  showFanSpecified: boolean = false;
  specifiedError1: string = null;
  specifiedError2: string = null;
  constructor() { }

  ngOnInit() {
    this.init();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.init()
      }
    }
  }

  init() {
    // this.tmpModificationPumpType = this.fsatService.getPumpStyleFromEnum(this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.pump_style);
    // this.tmpBaselinePumpType = this.fsatService.getPumpStyleFromEnum(this.fsat.fanSetup.pump_style);
    // this.tmpModificationMotorDrive = this.fsatService.getDriveFromEnum(this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.drive);
    // this.tmpBaselineMotorDrive = this.fsatService.getDriveFromEnum(this.fsat.fanSetup.drive);
    this.initFanSpecified();
    this.initMotorDrive();
    this.initPumpType();
    this.initFanData();
  }
  initPumpType() {
    if (this.fsat.fanSetup.fanType != this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanType) {
      this.showFanType = true;
    }else{
      this.showFanType = false;
    }
  }

  initMotorDrive() {
    if (this.fsat.fanSetup.drive != this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.drive) {
      this.showMotorDrive = true;
    }else{
      this.showMotorDrive = false;
    }
  }

  initFanSpecified() {
    if (this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanSpecified != this.fsat.fanSetup.fanSpecified) {
      this.showFanSpecified = true;
    }else{
      this.showFanSpecified = false;
    }

  }

  initFanData() {
    if (this.showMotorDrive || this.showFanSpecified || this.showFanType) {
      this.showPumpData = true;
    }else{
      this.showPumpData = false;
    }
  }

  toggleFanData() {
    if (this.showPumpData == false) {
      this.showFanSpecified = false;
      this.showFanType = false;
      this.showMotorDrive = false;
      this.toggleFanSpecified();
      this.toggleFanType();
      this.toggleMotorDrive();
    }
  }
  toggleFanSpecified() {
    if (this.showFanSpecified == false) {
      this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanSpecified = this.fsat.fanSetup.fanSpecified;
      this.calculate();
    }
  }

  toggleFanType() {
    if (this.showFanType == false) {
      this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanType = this.fsat.fanSetup.fanType;
      // this.tmpModificationPumpType = this.fsatService.getPumpStyleFromEnum(this.fsat.fanSetup.pump_style);
      this.calculate();
    }
  }
  toggleMotorDrive() {
    if (this.showMotorDrive === false) {
      this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.drive = this.fsat.fanSetup.drive;
      // this.tmpModificationMotorDrive = this.fsatService.getDriveFromEnum(this.fsat.fanSetup.drive);
      this.calculate();
    }
  }

  setFanTypes() {
    this.checkFanTypes();
    // this.fsat.fanSetup.pump_style = this.fsatService.getPumpStyleEnum(this.tmpBaselinePumpType);
    // this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.pump_style = this.fsatService.getPumpStyleEnum(this.tmpModificationPumpType);
    if (!this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanSpecified) {
      this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanSpecified = 90;
    }
    if (!this.fsat.fanSetup.fanSpecified) {
      this.fsat.fanSetup.fanSpecified = 90;
    }
    this.calculate();
  }

  setMotorDrive() {
    // this.fsat.fanSetup.drive = this.fsatService.getDriveEnum(this.tmpBaselineMotorDrive);
    // this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.drive = this.fsatService.getDriveEnum(this.tmpModificationMotorDrive);
    this.calculate();
  }

  checkEfficiency(val: number, num: number) {
    this.calculate();
    if (val > 100) {
      this.setErrorMessage(num, "Unrealistic efficiency, shouldn't be greater then 100%");
      return false;
    }
    else if (val == 0) {
      this.setErrorMessage(num, "Cannot have 0% efficiency");
      return false;
    }
    else if (val < 0) {
      this.setErrorMessage(num, "Cannot have negative efficiency");
      return false;
    }
    else {
      this.setErrorMessage(num, null);
      return true;
    }
  }
  setErrorMessage(num: number, str: string) {
    if (num == 1) {
      this.specifiedError1 = str;
    } else if (num == 2) {
      this.specifiedError2 = str;
    }
  }

  checkFanTypes() {
    if (this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanType == 'Specified Optimal Efficiency') {
      this.showFanSpecified = true;
    } else {
      this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanSpecified = null;
    }
    if (this.fsat.fanSetup.fanType == 'Specified Optimal Efficiency') {
      this.showFanSpecified = true;
    } else {
      this.fsat.fanSetup.fanSpecified = null;
    }
    if (this.fsat.fanSetup.fanType != 'Specified Optimal Efficiency' && this.fsat.modifications[this.exploreModIndex].fsat.fanSetup.fanType != 'Specified Optimal Efficiency') {
      this.showFanSpecified = false;
    }
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
}
