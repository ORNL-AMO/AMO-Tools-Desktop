import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OperationsCompareService } from '../operations-compare.service';
import { FormGroup } from '@angular/forms';
import { OperationsService, OperationsWarnings } from '../operations.service';
import { OperatingHours } from '../../../../shared/models/operations';
@Component({
  selector: 'app-operations-form',
  templateUrl: './operations-form.component.html',
  styleUrls: ['./operations-form.component.css']
})
export class OperationsFormComponent implements OnInit {
  @Output('changeField')
  changeField = new EventEmitter<string>()
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  operationsForm: FormGroup;
  @Input()
  baselineSelected: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  isCalculated: boolean;

  warnings: OperationsWarnings;
  idString: string;
  constructor(private operationsCompareService: OperationsCompareService, private operationsService: OperationsService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification';
    }
    else {
      this.idString = '_baseline';
    }
    this.checkWarnings();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  focusOut() {
    this.changeField.emit('default');
  }

  checkWarnings() {
    let tmpHours: OperatingHours = this.operationsService.getOperatingDataFromForm(this.operationsForm).hours;
    this.warnings = this.operationsService.checkWarnings(tmpHours);
  }
  calculatHrsPerYear() {
    let tmpHoursPerYear = this.operationsForm.controls.hoursPerShift.value * this.operationsForm.controls.shiftsPerDay.value * this.operationsForm.controls.daysPerWeek.value * this.operationsForm.controls.weeksPerYear.value;
    this.operationsForm.patchValue({
      hoursPerYear: tmpHoursPerYear.toFixed(0)
    })
    this.isCalculated = true;
    this.save()
  }

  setNotCalculated() {
    this.isCalculated = false;
    this.save();
  }


  addShift() {
    let tmpVal = this.operationsForm.controls.shiftsPerDay.value + 1;
    this.operationsForm.patchValue({
      shiftsPerDay: tmpVal
    })
    //  this.phast.operatingHours.shiftsPerDay += 1;
    this.calculatHrsPerYear();
  }

  subtractShift() {
    let tmpVal = this.operationsForm.controls.shiftsPerDay.value - 1;
    this.operationsForm.patchValue({
      shiftsPerDay: tmpVal
    })
    // this.phast.operatingHours.shiftsPerDay -= 1;
    this.calculatHrsPerYear();
  }
  subtractShiftHr() {
    let tmpVal = this.operationsForm.controls.hoursPerShift.value - 1;
    this.operationsForm.patchValue({
      hoursPerShift: tmpVal
    })
    // this.phast.operatingHours.hoursPerShift -= 1;
    this.calculatHrsPerYear();
  }
  addShiftHr() {
    let tmpVal = this.operationsForm.controls.hoursPerShift.value + 1;
    this.operationsForm.patchValue({
      hoursPerShift: tmpVal
    })
    // this.phast.operatingHours.hoursPerShift += 1;
    this.calculatHrsPerYear();
  }

  subtractWeekDay() {
    let tmpVal = this.operationsForm.controls.daysPerWeek.value - 1;
    this.operationsForm.patchValue({
      daysPerWeek: tmpVal
    })
    //this.phast.operatingHours.daysPerWeek -= 1;
    this.calculatHrsPerYear();
  }
  addWeekDay() {
    let tmpVal = this.operationsForm.controls.daysPerWeek.value + 1;
    this.operationsForm.patchValue({
      daysPerWeek: tmpVal
    })
    //this.phast.operatingHours.daysPerWeek += 1;
    this.calculatHrsPerYear();
  }

  addWeek() {
    let tmpVal = this.operationsForm.controls.weeksPerYear.value + 1;
    this.operationsForm.patchValue({
      weeksPerYear: tmpVal
    })
    //this.phast.operatingHours.weeksPerYear += 1;
    this.calculatHrsPerYear();
  }

  subtractWeek() {
    let tmpVal = this.operationsForm.controls.weeksPerYear.value - 1;
    this.operationsForm.patchValue({
      weeksPerYear: tmpVal
    })
    // this.phast.operatingHours.weeksPerYear -= 1;
    this.calculatHrsPerYear();
  }

  save() {
    this.checkWarnings();
    this.saveEmit.emit(true);
  }

  canCompare() {
    if (this.operationsCompareService.baseline && this.operationsCompareService.modification) {
      return true;
    } else {
      return false;
    }
  }
  compareWeeksPerYear(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareWeeksPerYear();
    } else {
      return false;
    }
  }
  compareDaysPerWeek(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareDaysPerWeek();
    } else {
      return false;
    }
  }
  compareShiftsPerDay(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareShiftsPerDay();
    } else {
      return false;
    }
  }
  compareHoursPerShift(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareHoursPerShift();
    } else {
      return false;
    }
  }
  compareHoursPerYear(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareHoursPerYear();
    } else {
      return false;
    }
  }
  compareFuelCost(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareFuelCost();
    } else {
      return false;
    }
  }
  compareSteamCost(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareSteamCost();
    } else {
      return false;
    }
  }
  compareElectricityCost(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareElectricityCost();
    } else {
      return false;
    }
  }
}
