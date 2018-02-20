import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
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

  counter: any;
  firstChange: boolean = true;
  temperatureError: string = null;
  emissivityError: string = null;
  timeOpenError: string = null;
  numOpeningsError: string = null;
  thicknessError: string = null;
  lengthError: string = null;
  heightError: string = null;
  viewFactorError: string = null;

  constructor(private convertUnitsService: ConvertUnitsService, private windowRefService: WindowRefService,
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
  }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
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

        this.calculate.emit(true);
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

        this.calculate.emit(true);
      }
    } else {
      this.totalArea = 0.0;
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  emitSave() {
    this.saveEmit.emit(true);
  }

  checkInputError() {
    if (this.temperatureError || this.emissivityError || this.timeOpenError || this.numOpeningsError || this.thicknessError || this.lengthError ||
      this.heightError || this.viewFactorError) {
      this.inputError.emit(true);
    } else {
      this.inputError.emit(false);
    }

  }

  startSavePolling() {
    this.checkInputError();
    this.calculate.emit(true);
    this.emitSave();
  }

  initDifferenceMonitor() {
    if (this.openingLossesCompareService.baselineOpeningLosses && this.openingLossesCompareService.modifiedOpeningLosses && this.openingLossesCompareService.differentArray.length != 0) {
      if (this.openingLossesCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        //openingType
        this.openingLossesCompareService.differentArray[this.lossIndex].different.openingType.subscribe((val) => {
          let openingTypeElements = doc.getElementsByName('openingType_' + this.lossIndex);
          openingTypeElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //wallThickness
        this.openingLossesCompareService.differentArray[this.lossIndex].different.thickness.subscribe((val) => {
          let wallThicknessElements = doc.getElementsByName('wallThickness_' + this.lossIndex);
          wallThicknessElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //heightOfOpening
        this.openingLossesCompareService.differentArray[this.lossIndex].different.heightOfOpening.subscribe((val) => {
          let heightOfOpeningElements = doc.getElementsByName('heightOfOpening_' + this.lossIndex);
          heightOfOpeningElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //lengthOfOpening
        this.openingLossesCompareService.differentArray[this.lossIndex].different.lengthOfOpening.subscribe((val) => {
          let lengthOfOpeningElements = doc.getElementsByName('lengthOfOpening_' + this.lossIndex);
          lengthOfOpeningElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //viewFactor
        this.openingLossesCompareService.differentArray[this.lossIndex].different.viewFactor.subscribe((val) => {
          let viewFactorElements = doc.getElementsByName('viewFactor_' + this.lossIndex);
          viewFactorElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //insideTemp
        this.openingLossesCompareService.differentArray[this.lossIndex].different.insideTemperature.subscribe((val) => {
          let insideTempElements = doc.getElementsByName('insideTemp_' + this.lossIndex);
          insideTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //ambientTemp
        this.openingLossesCompareService.differentArray[this.lossIndex].different.ambientTemperature.subscribe((val) => {
          let ambientTempElements = doc.getElementsByName('ambientTemp_' + this.lossIndex);
          ambientTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //emissivity
        this.openingLossesCompareService.differentArray[this.lossIndex].different.emissivity.subscribe((val) => {
          let emissivityElements = doc.getElementsByName('emissivity_' + this.lossIndex);
          emissivityElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //percentTimeOpen
        this.openingLossesCompareService.differentArray[this.lossIndex].different.percentTimeOpen.subscribe((val) => {
          let percentTimeOpenElements = doc.getElementsByName('percentTimeOpen_' + this.lossIndex);
          percentTimeOpenElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //numOpening
        this.openingLossesCompareService.differentArray[this.lossIndex].different.numberOfOpenings.subscribe((val) => {
          let numberOfOpeningsElements = doc.getElementsByName('numberOfOpenings_' + this.lossIndex);
          numberOfOpeningsElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}
