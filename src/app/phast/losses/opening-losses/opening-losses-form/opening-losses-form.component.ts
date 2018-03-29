import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { OpeningLossesCompareService } from '../opening-losses-compare.service';
import { OpeningLossesService } from '../opening-losses.service';
import { PhastService } from '../../../phast.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-opening-losses-form',
  templateUrl: './opening-losses-form.component.html',
  styleUrls: ['./opening-losses-form.component.css']
})
export class OpeningLossesFormComponent implements OnInit {
  @Input()
  openingLossesForm: FormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;
  @Input()
  settings: Settings;
  @Output('inputError')
  inputError = new EventEmitter<boolean>();

  totalArea: number = 0.0;

  firstChange: boolean = true;
  temperatureError: string = null;
  emissivityError: string = null;
  timeOpenError: string = null;
  numOpeningsError: string = null;
  thicknessError: string = null;
  lengthError: string = null;
  heightError: string = null;
  viewFactorError: string = null;

  constructor(private convertUnitsService: ConvertUnitsService,
    private openingLossesCompareService: OpeningLossesCompareService,
    private openingLossesService: OpeningLossesService, private phastService: PhastService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    } else {
      this.firstChange = false;
    }
  }


  ngOnInit() {
    this.getArea();
    this.checkSurfaceEmissivity(true);
    this.checkTemperature(true);
    this.checkTimeOpen(true);
    this.checkThickness(true);
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }
  focusOut() {
    this.changeField.emit('default');
  }
  disableForm() {
    this.openingLossesForm.disable();
  }
  enableForm() {
    this.openingLossesForm.enable();
  }
  calculateViewFactor() {
    let vfInputs = this.openingLossesService.getViewFactorInput(this.openingLossesForm);
    let viewFactor = this.phastService.viewFactorCalculation(vfInputs, this.settings);
    this.openingLossesForm.patchValue({
      viewFactor: this.roundVal(viewFactor, 3)
    });
    this.startSavePolling();
  }
  roundVal(val: number, digits: number): number {
    return Number(val.toFixed(digits));
  }
  checkOpeningDimensions(bool?: boolean) {
    if (this.openingLossesForm.controls.openingType.value === 'Round') {
      this.lengthError = (this.openingLossesForm.controls.lengthOfOpening.value <= 0) ? "Opening Diameter must be greater than 0" : null;
    } else {
      this.lengthError = (this.openingLossesForm.controls.lengthOfOpening.value <= 0) ? "Opening Length must be greater than 0" : null;
      this.heightError = (this.openingLossesForm.controls.heightOfOpening.value <= 0) ? "Opening Height must be greater than 0" : null;
    }
    if (!bool) {
      this.startSavePolling();
    }
  }
  checkThickness(bool?: boolean) {
    this.thicknessError = (this.openingLossesForm.controls.wallThickness.value < 0) ? "Furnace Wall Thickness must be greater than or equal to 0" : null;
    if (!bool) {
      this.startSavePolling();
    }
  }
  checkNumOpenings(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    this.numOpeningsError = (this.openingLossesForm.controls.numberOfOpenings.value < 0) ? "Number of Openings must be greater than 0" : null;
  }
  checkViewFactor(bool?: boolean) {
    this.viewFactorError = (this.openingLossesForm.controls.viewFactor.value < 0) ? "View Factor must be greater than 0" : null;
    if (!bool) {
      this.startSavePolling();
    }
  }
  checkTemperature(bool?: boolean) {
    this.temperatureError = (this.openingLossesForm.controls.ambientTemp.value > this.openingLossesForm.controls.insideTemp.value) ?
      'Ambient Temperature cannot be greater than Average Zone Temperature' : null;
    if (!bool) {
      this.startSavePolling();
    }
  }
  checkSurfaceEmissivity(bool?: boolean) {
    this.emissivityError = (this.openingLossesForm.controls.emissivity.value > 1 || this.openingLossesForm.controls.emissivity.value < 0) ? 'Surface emissivity must be between 0 and 1' : null;
    if (!bool) {
      this.startSavePolling();
    }
  }
  checkTimeOpen(bool?: boolean) {
    this.timeOpenError = (this.openingLossesForm.controls.percentTimeOpen.value < 0 || this.openingLossesForm.controls.percentTimeOpen.value > 100) ?
      'Percent Time Open must be between 0% and 100%' : null;
    if (!bool) {
      this.startSavePolling();
    }
  }
  getArea() {
    let smallUnit = 'in';
    let largeUnit = 'ft';
    if (this.settings.unitsOfMeasure == 'Metric') {
      smallUnit = 'mm';
      largeUnit = 'm';
    }
    this.checkNumOpenings();
    this.checkOpeningDimensions();
    if (this.numOpeningsError !== null || this.lengthError !== null || this.heightError !== null) {
      this.totalArea = 0;
      return;
    }
    if (this.openingLossesForm.controls.openingType.value == 'Round') {
      if (this.openingLossesForm.controls.lengthOfOpening.status == "VALID") {
        this.openingLossesForm.controls.heightOfOpening.setValue(0);
        let radiusInches = this.openingLossesForm.controls.lengthOfOpening.value;
        //let radiusFeet = (radiusInches * .08333333) / 2;

        let radiusFeet = this.convertUnitsService.value(radiusInches).from(smallUnit).to(largeUnit) / 2;
        this.totalArea = Math.PI * Math.pow(radiusFeet, 2) * this.openingLossesForm.controls.numberOfOpenings.value;
        this.startSavePolling();
      }
    } else if (this.openingLossesForm.controls.openingType.value == 'Rectangular (Square)') {
      if (this.openingLossesForm.controls.lengthOfOpening.status == "VALID" && this.openingLossesForm.controls.heightOfOpening.status == "VALID") {
        let lengthInches = this.openingLossesForm.controls.lengthOfOpening.value;
        let heightInches = this.openingLossesForm.controls.heightOfOpening.value;
        let lengthFeet = 0;
        let heightFeet = 0;
        if (lengthInches) {
          lengthFeet = this.convertUnitsService.value(lengthInches).from(smallUnit).to(largeUnit);
        }
        if (heightInches) {
          heightFeet = this.convertUnitsService.value(heightInches).from(smallUnit).to(largeUnit);
        }
        this.totalArea = lengthFeet * heightFeet * this.openingLossesForm.controls.numberOfOpenings.value;
        this.startSavePolling();
      }
    } else {
      this.totalArea = 0.0;
    }
  }
  focusField(str: string) {
    this.changeField.emit(str);
  }
  checkInputError() {
    if (this.temperatureError || this.emissivityError || this.timeOpenError || this.numOpeningsError || this.thicknessError || this.lengthError ||
      this.heightError || this.viewFactorError) {
      this.inputError.emit(true);
      this.openingLossesCompareService.inputError.next(true);
    } else {
      this.inputError.emit(false);
      this.openingLossesCompareService.inputError.next(false);
    }
  }
  startSavePolling() {
    this.checkInputError();
    this.calculate.emit(true);
    this.saveEmit.emit(true);
  }
  canCompare() {
    if (this.openingLossesCompareService.baselineOpeningLosses && this.openingLossesCompareService.modifiedOpeningLosses) {
      return true;
    } else {
      return false;
    }
  }
  compareNumberOfOpenings(): boolean {
    if (this.canCompare()) {
      return this.openingLossesCompareService.compareNumberOfOpenings(this.lossIndex);
    } else {
      return false;
    }
  }
  compareEmissivity(): boolean {
    if (this.canCompare()) {
      return this.openingLossesCompareService.compareEmissivity(this.lossIndex);
    } else {
      return false;
    }
  }
  compareThickness(): boolean {
    if (this.canCompare()) {
      return this.openingLossesCompareService.compareThickness(this.lossIndex);
    } else {
      return false;
    }
  }
  compareAmbientTemperature(): boolean {
    if (this.canCompare()) {
      return this.openingLossesCompareService.compareAmbientTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareInsideTemperature(): boolean {
    if (this.canCompare()) {
      return this.openingLossesCompareService.compareInsideTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  comparePercentTimeOpen(): boolean {
    if (this.canCompare()) {
      return this.openingLossesCompareService.comparePercentTimeOpen(this.lossIndex);
    } else {
      return false;
    }
  }
  compareViewFactor(): boolean {
    if (this.canCompare()) {
      return this.openingLossesCompareService.compareViewFactor(this.lossIndex);
    } else {
      return false;
    }
  }
  compareOpeningType(): boolean {
    if (this.canCompare()) {
      return this.openingLossesCompareService.compareOpeningType(this.lossIndex);
    } else {
      return false;
    }
  }
  compareLengthOfOpening(): boolean {
    if (this.canCompare()) {
      return this.openingLossesCompareService.compareLengthOfOpening(this.lossIndex);
    } else {
      return false;
    }
  }
  compareHeightOfOpening(): boolean {
    if (this.canCompare()) {
      return this.openingLossesCompareService.compareHeightOfOpening(this.lossIndex);
    } else {
      return false;
    }
  }



}
