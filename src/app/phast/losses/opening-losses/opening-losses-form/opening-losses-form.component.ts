import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { OpeningLossesCompareService } from '../opening-losses-compare.service';
import { OpeningLossesService } from '../opening-losses.service';
import { PhastService } from '../../../phast.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-opening-losses-form',
  templateUrl: './opening-losses-form.component.html',
  styleUrls: ['./opening-losses-form.component.css']
})
export class OpeningLossesFormComponent implements OnInit {
  @Input()
  openingLossesForm: any;
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

  @ViewChild('lossForm') lossForm: ElementRef;
  totalArea: number = 0.0;

  form: any;
  elements: any;
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
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = true;
    }
  }

  enableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
  }

  calculateViewFactor() {
    const roundVal = (val: number, digits: number) => {
      return Number(val.toFixed(digits));
    };

    this.openingLossesForm.patchValue({
      viewFactor: roundVal(this.phastService.viewFactorCalculation(this.openingLossesService.getViewFactorInput(this.openingLossesForm), this.settings), 3)
    });
  }

  checkOpeningDimensions(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.openingLossesForm.value.openingType === 'Round') {
      this.lengthError = (this.openingLossesForm.value.lengthOfOpening <= 0) ? "Opening Diameter must be greater than 0" : null;
    } else {
      this.lengthError = (this.openingLossesForm.value.lengthOfOpening <= 0) ? "Opening Length must be greater than 0" : null;
      this.heightError = (this.openingLossesForm.value.heightOfOpening <= 0) ? "Opening Height must be greater than 0" : null;
    }
  }

  checkThickness(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    this.thicknessError = (this.openingLossesForm.value.wallThickness < 0) ? "Furnace Wall Thickness must be greater than or equal to 0" : null;
  }

  checkNumOpenings(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    this.numOpeningsError = (this.openingLossesForm.value.numberOfOpenings < 0) ? "Number of Openings must be greater than 0" : null;
  }

  checkViewFactor(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    this.viewFactorError = (this.openingLossesForm.value.viewFactor < 0) ? "View Factor must be greater than 0" : null;
  }

  checkTemperature(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    this.temperatureError = (this.openingLossesForm.value.ambientTemp > this.openingLossesForm.value.insideTemp) ?
      'Ambient Temperature cannot be greater than Average Zone Temperature' : null;
  }

  checkSurfaceEmissivity(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    this.emissivityError = (this.openingLossesForm.value.emissivity > 1 || this.openingLossesForm.value.emissivity < 0) ? 'Surface emissivity must be between 0 and 1' : null;
  }

  checkTimeOpen(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    this.timeOpenError = (this.openingLossesForm.value.percentTimeOpen < 0 || this.openingLossesForm.value.percentTimeOpen > 100) ?
      'Percent Time Open must be between 0% and 100%' : null;
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

    if (this.openingLossesForm.value.openingType == 'Round') {
      if (this.openingLossesForm.controls.lengthOfOpening.status == "VALID") {
        this.openingLossesForm.controls.heightOfOpening.setValue(0);
        let radiusInches = this.openingLossesForm.value.lengthOfOpening;
        //let radiusFeet = (radiusInches * .08333333) / 2;

        let radiusFeet = this.convertUnitsService.value(radiusInches).from(smallUnit).to(largeUnit) / 2;
        this.totalArea = Math.PI * Math.pow(radiusFeet, 2) * this.openingLossesForm.value.numberOfOpenings;

        this.calculate.emit(true);
      }
    } else if (this.openingLossesForm.value.openingType == 'Rectangular (Square)') {
      if (this.openingLossesForm.controls.lengthOfOpening.status == "VALID" && this.openingLossesForm.controls.heightOfOpening.status == "VALID") {
        let lengthInches = this.openingLossesForm.value.lengthOfOpening;
        let heightInches = this.openingLossesForm.value.heightOfOpening;
        let lengthFeet = 0;
        let heightFeet = 0;
        if (lengthInches) {
          lengthFeet = this.convertUnitsService.value(lengthInches).from(smallUnit).to(largeUnit);
        }
        if (heightInches) {
          heightFeet = this.convertUnitsService.value(heightInches).from(smallUnit).to(largeUnit);
        }
        this.totalArea = lengthFeet * heightFeet * this.openingLossesForm.value.numberOfOpenings;

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

  startSavePolling() {
    this.calculate.emit(true);
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.emitSave();
    }, 3000)
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
