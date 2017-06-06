import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

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
  lossState: any;
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();

  @ViewChild('lossForm') lossForm: ElementRef;
  totalArea: number = 0.0;

  init: boolean;
  form: any;
  elements: any;
  counter: any;
  firstChange: boolean = true;
  constructor(private convertUnitsService: ConvertUnitsService) { }

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
    this.init = true;
    this.getArea();
    if (!this.baselineSelected) {
      this.disableForm();
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

  checkForm() {
    if (!this.init) {
      this.lossState.saved = false;
    }
    if (this.openingLossesForm.status == 'VALID') {
      this.calculate.emit(true);
    }
    this.init = false;
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
        //let lengthFeet = lengthInches * .08333333;
        //let heightFeet = heightInches * .08333333;
        let lengthFeet = this.convertUnitsService.value(lengthInches).from('in').to('ft');
        let heightFeet = this.convertUnitsService.value(heightInches).from('in').to('ft');
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
}
