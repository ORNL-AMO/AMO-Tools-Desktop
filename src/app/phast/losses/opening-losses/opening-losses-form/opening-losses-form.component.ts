import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { OpeningLossesCompareService } from '../opening-losses-compare.service';
import { PhastService } from '../../../phast.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { OpeningService } from '../../../../calculator/furnaces/opening/opening.service';
import { OpeningFormService } from '../../../../calculator/furnaces/opening/opening-form.service';

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
  @Input()
  isBaseline: boolean;

  totalArea: number = 0.0;
  idString: string;
  constructor(private convertUnitsService: ConvertUnitsService,
    private openingLossesCompareService: OpeningLossesCompareService,
    private openingFormService: OpeningFormService,
    private openingLossesService: OpeningService, private phastService: PhastService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
    this.getArea(true);
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

  roundVal(val: number, digits: number): number {
    return Number(val.toFixed(digits));
  }

  getArea(dontSave?: boolean) {
    if (!dontSave) {
      this.save();
    }

    let smallUnit = 'in';
    let largeUnit = 'ft';
    if (this.settings.unitsOfMeasure === 'Metric') {
      smallUnit = 'mm';
      largeUnit = 'm';
    }

    if (this.openingLossesForm.controls.numberOfOpenings.invalid || this.openingLossesForm.controls.lengthOfOpening.invalid || this.openingLossesForm.controls.heightOfOpening.invalid) {
      this.totalArea = 0;
      return;
    }
    if (this.openingLossesForm.controls.openingType.value === 'Round') {
      if (this.openingLossesForm.controls.lengthOfOpening.status === "VALID") {
        this.openingLossesForm.controls.heightOfOpening.setValue(0);
        let radiusInches = this.openingLossesForm.controls.lengthOfOpening.value;
        //let radiusFeet = (radiusInches * .08333333) / 2;

        let radiusFeet = this.convertUnitsService.value(radiusInches).from(smallUnit).to(largeUnit) / 2;
        this.totalArea = Math.PI * Math.pow(radiusFeet, 2) * this.openingLossesForm.controls.numberOfOpenings.value;
      }
    } else if (this.openingLossesForm.controls.openingType.value === 'Rectangular (or Square)') {
      if (this.openingLossesForm.controls.lengthOfOpening.status === "VALID" && this.openingLossesForm.controls.heightOfOpening.status === "VALID") {
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
    this.openingFormService.setAmbientTempValidators(this.openingLossesForm);
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
