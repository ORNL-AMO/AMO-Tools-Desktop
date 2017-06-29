import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ExhaustGasCompareService } from '../exhaust-gas-compare.service';
import { FormControl, Validators } from '@angular/forms'
import * as _ from 'lodash';
@Component({
  selector: 'app-exhaust-gas-form',
  templateUrl: './exhaust-gas-form.component.html',
  styleUrls: ['./exhaust-gas-form.component.css']
})
export class ExhaustGasFormComponent implements OnInit {
  @Input()
  exhaustGasForm: any;
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
  form: any;
  elements: any;

  firstChange: boolean = true;
  counter: any;

  otherLossArray: Array<number>;
  constructor(private windowRefService: WindowRefService, private exhaustGasCompareService: ExhaustGasCompareService) { }

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
    this.otherLossArray = new Array<number>();
    let i = 1;
    Object.keys(this.exhaustGasForm.controls).forEach(key => {
      if (_.includes(key, "otherLoss")) {
        this.addOther(i);
        i++;
      }
    })
  }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    //this.initDifferenceMonitor();
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
    if (this.exhaustGasForm.status == "VALID") {
      this.calculate.emit(true);
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

  addOther(index?: number) {
    if (index) {
      let otherControl = new FormControl('', Validators.required);
      this.exhaustGasForm.addControl(
        'otherLoss' + index, otherControl
      );
      this.otherLossArray.push(index);
    } else {
      let lastNum = this.otherLossArray[this.otherLossArray.length - 1] + 1;
      let otherControl = new FormControl('', Validators.required);
      this.exhaustGasForm.addControl(
        'otherLoss' + lastNum, otherControl
      );
      this.otherLossArray.push(lastNum);
    }
    console.log(this.exhaustGasForm);
  }

  removeOther(index: number, lossNumber: number) {
    this.otherLossArray.splice(index, 1);
    this.exhaustGasForm.removeControl('otherLoss' + lossNumber);
  }
}
