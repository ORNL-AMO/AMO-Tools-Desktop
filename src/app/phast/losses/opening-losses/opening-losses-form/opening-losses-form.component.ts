import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { OpeningLossesCompareService } from '../opening-losses-compare.service';

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

  @ViewChild('lossForm') lossForm: ElementRef;
  totalArea: number = 0.0;

  form: any;
  elements: any;
  counter: any;
  firstChange: boolean = true;
  constructor(private convertUnitsService: ConvertUnitsService, private windowRefService: WindowRefService, private openingLossesCompareService: OpeningLossesCompareService) { }

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
  }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
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

  checkForm() {
    if (this.openingLossesForm.status == 'VALID') {
      this.calculate.emit(true);
    }
  }

  getArea() {
    if (this.openingLossesForm.value.openingType == 'Round') {
      if (this.openingLossesForm.controls.lengthOfOpening.status == "VALID") {
        this.openingLossesForm.controls.heightOfOpening.setValue(0);
        let radiusInches = this.openingLossesForm.value.lengthOfOpening;
        //let radiusFeet = (radiusInches * .08333333) / 2;
        let radiusFeet = this.convertUnitsService.value(radiusInches).from('in').to('ft') / 2;
        this.totalArea = Math.PI * Math.pow(radiusFeet, 2) * this.openingLossesForm.value.numberOfOpenings;
        this.checkForm();
      }
    } else if (this.openingLossesForm.value.openingType == 'Rectangular (Square)') {
      if (this.openingLossesForm.controls.lengthOfOpening.status == "VALID" && this.openingLossesForm.controls.heightOfOpening.status == "VALID") {
        let lengthInches = this.openingLossesForm.value.lengthOfOpening;
        let heightInches = this.openingLossesForm.value.heightOfOpening;
        let lengthFeet = 0;
        let heightFeet = 0;
        if (lengthInches) {
          lengthFeet = this.convertUnitsService.value(lengthInches).from('in').to('ft');
        }
        if (heightInches) {
          heightFeet = this.convertUnitsService.value(heightInches).from('in').to('ft');
        }
        this.totalArea = lengthFeet * heightFeet * this.openingLossesForm.value.numberOfOpenings;
        this.checkForm();
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
    this.checkForm();
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
