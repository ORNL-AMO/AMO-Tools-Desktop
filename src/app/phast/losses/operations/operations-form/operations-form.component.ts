import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { OperationsCompareService } from '../operations-compare.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
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
  operationsForm: any;
  @Input()
  baselineSelected: boolean;
  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  @Input()
  isBaseline: boolean;
  @Input()
  isCalculated: boolean;

  elements: any;
  counter: any;
  firstChange: boolean = true;
  constructor(private operationsCompareService: OperationsCompareService, private windowRefService: WindowRefService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    } else {
      this.enableForm();
    }
    this.initDifferenceMonitor();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      //on changes to baseline selected enable/disable form
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    } else {
      this.firstChange = false;
    }
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

  focusField(str: string) {
    this.changeField.emit(str);
  }


  calculatHrsPerYear() {
    this.startSavePolling();
    // this.phast.operatingHours.isCalculated = true;
    // this.phast.operatingHours.hoursPerYear = this.phast.operatingHours.hoursPerShift * this.phast.operatingHours.shiftsPerDay * this.phast.operatingHours.daysPerWeek * this.phast.operatingHours.weeksPerYear;
    let tmpHoursPerYear = this.operationsForm.value.hoursPerShift * this.operationsForm.value.shiftsPerDay * this.operationsForm.value.daysPerWeek * this.operationsForm.value.weeksPerYear;
    this.operationsForm.patchValue({
      hoursPerYear: tmpHoursPerYear
    })
    this.isCalculated = true;
  }

  setNotCalculated() {
    this.startSavePolling();
    this.isCalculated = false;
  }

  addShift() {
    let tmpVal = this.operationsForm.value.shiftsPerDay + 1;
    this.operationsForm.patchValue({
      shiftsPerDay: tmpVal
    })
    //  this.phast.operatingHours.shiftsPerDay += 1;
    this.calculatHrsPerYear();
  }

  subtractShift() {
    let tmpVal = this.operationsForm.value.shiftsPerDay - 1;
    this.operationsForm.patchValue({
      shiftsPerDay: tmpVal
    })
    // this.phast.operatingHours.shiftsPerDay -= 1;
    this.calculatHrsPerYear();
  }
  subtractShiftHr() {
    let tmpVal = this.operationsForm.value.hoursPerShift - 1;
    this.operationsForm.patchValue({
      hoursPerShift: tmpVal
    })
    // this.phast.operatingHours.hoursPerShift -= 1;
    this.calculatHrsPerYear();
  }
  addShiftHr() {
    let tmpVal = this.operationsForm.value.hoursPerShift + 1;
    this.operationsForm.patchValue({
      hoursPerShift: tmpVal
    })
    // this.phast.operatingHours.hoursPerShift += 1;
    this.calculatHrsPerYear();
  }

  subtractWeekDay() {
    let tmpVal = this.operationsForm.value.daysPerWeek - 1;
    this.operationsForm.patchValue({
      daysPerWeek: tmpVal
    })
    //this.phast.operatingHours.daysPerWeek -= 1;
    this.calculatHrsPerYear();
  }
  addWeekDay() {
    let tmpVal = this.operationsForm.value.daysPerWeek + 1;
    this.operationsForm.patchValue({
      daysPerWeek: tmpVal
    })
    //this.phast.operatingHours.daysPerWeek += 1;
    this.calculatHrsPerYear();
  }

  addWeek() {
    let tmpVal = this.operationsForm.value.weeksPerYear + 1;
    this.operationsForm.patchValue({
      weeksPerYear: tmpVal
    })
    //this.phast.operatingHours.weeksPerYear += 1;
    this.calculatHrsPerYear();
  }

  subtractWeek() {
    let tmpVal = this.operationsForm.value.weeksPerYear - 1;
    this.operationsForm.patchValue({
      weeksPerYear: tmpVal
    })
    // this.phast.operatingHours.weeksPerYear -= 1;
    this.calculatHrsPerYear();
  }

  startSavePolling() {
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.saveEmit.emit(true);
    }, 3000)
  }

  initDifferenceMonitor() {
    if (this.operationsCompareService.baseline && this.operationsCompareService.modification) {
      if (this.operationsCompareService.differentObject) {
        let doc = this.windowRefService.getDoc();
        this.operationsCompareService.differentObject.daysPerWeek.subscribe(val => {
          let daysPerWeekElements = doc.getElementsByName('daysPerWeek');
          daysPerWeekElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        this.operationsCompareService.differentObject.weeksPerYear.subscribe(val => {
          let weeksPerYearElements = doc.getElementsByName('weeksPerYear');
          weeksPerYearElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        this.operationsCompareService.differentObject.shiftsPerDay.subscribe(val => {
          let shiftsPerDayElements = doc.getElementsByName('shiftsPerDay');
          shiftsPerDayElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        this.operationsCompareService.differentObject.hoursPerShift.subscribe(val => {
          let hoursPerShiftElements = doc.getElementsByName('hoursPerShift');
          hoursPerShiftElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        this.operationsCompareService.differentObject.hoursPerYear.subscribe(val => {
          let hoursPerYearElements = doc.getElementsByName('hoursPerYear');
          hoursPerYearElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        this.operationsCompareService.differentObject.fuelCost.subscribe(val => {
          let fuelCostElements = doc.getElementsByName('fuelCost');
          fuelCostElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        this.operationsCompareService.differentObject.steamCost.subscribe(val => {
          let steamCostElements = doc.getElementsByName('steamCost');
          steamCostElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        this.operationsCompareService.differentObject.electricityCost.subscribe(val => {
          let electricityCostElements = doc.getElementsByName('electricityCost');
          electricityCostElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}
