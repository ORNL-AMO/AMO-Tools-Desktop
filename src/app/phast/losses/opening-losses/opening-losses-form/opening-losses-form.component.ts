import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { OpeningLossesCompareService } from '../opening-losses-compare.service';
import { OpeningLossesService, OpeningLossWarnings } from '../opening-losses.service';
import { PhastService } from '../../../phast.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { OpeningLoss } from '../../../../shared/models/phast/losses/openingLoss';

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
  @Input()
  inSetup: boolean;

  totalArea: number = 0.0;
  warnings: OpeningLossWarnings;
  constructor(private convertUnitsService: ConvertUnitsService,
    private openingLossesCompareService: OpeningLossesCompareService,
    private openingLossesService: OpeningLossesService, private phastService: PhastService) { }

  ngOnInit() {
    this.checkWarnings();
    this.getArea(true)
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.baselineSelected) {
      if (!changes.baselineSelected.firstChange) {
        if (!this.baselineSelected) {
          this.disableForm();
        } else {
          this.enableForm();
        }
      }
    }
  }

  focusOut() {
    this.changeField.emit('default');
  }
  disableForm() {
    this.openingLossesForm.controls.openingType.disable();
  }
  enableForm() {
    this.openingLossesForm.controls.openingType.enable();
  }

  checkWarnings() {
    let tmpLoss: OpeningLoss = this.openingLossesService.getLossFromForm(this.openingLossesForm);
    this.warnings = this.openingLossesService.checkWarnings(tmpLoss);
    let hasWarning: boolean = this.openingLossesService.checkWarningsExist(this.warnings);
    this.inputError.emit(hasWarning);
  }

  calculateViewFactor() {
    this.save();
    if (this.warnings.numOpeningsWarning !== null || this.warnings.lengthWarning !== null || this.warnings.heightWarning !== null) {
      this.totalArea = 0;
      return;
    }
    let vfInputs = this.openingLossesService.getViewFactorInput(this.openingLossesForm);
    let viewFactor = this.phastService.viewFactorCalculation(vfInputs, this.settings);
    this.openingLossesForm.patchValue({
      viewFactor: this.roundVal(viewFactor, 3)
    });
  }

  roundVal(val: number, digits: number): number {
    return Number(val.toFixed(digits));
  }

  getArea(dontSave?: boolean) {
    if (!dontSave) {
      this.save();
    }

    let smallUnit = 'in';
    let largeUnit = 'ft';
    if (this.settings.unitsOfMeasure == 'Metric') {
      smallUnit = 'mm';
      largeUnit = 'm';
    }

    if (this.warnings.numOpeningsWarning !== null || this.warnings.lengthWarning !== null || this.warnings.heightWarning !== null) {
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
      }
    } else if (this.openingLossesForm.controls.openingType.value == 'Rectangular (or Square)') {
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
      }
    } else {
      this.totalArea = 0.0;
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  save() {
    this.checkWarnings();
    this.calculate.emit(true);
    this.saveEmit.emit(true);
  }
  canCompare() {
    if (this.openingLossesCompareService.baselineOpeningLosses && this.openingLossesCompareService.modifiedOpeningLosses && !this.inSetup) {
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
