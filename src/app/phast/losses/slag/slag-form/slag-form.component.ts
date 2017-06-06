import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-slag-form',
  templateUrl: './slag-form.component.html',
  styleUrls: ['./slag-form.component.css']
})
export class SlagFormComponent implements OnInit {
  @Input()
  slagLossForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  lossState: any;
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();

  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  elements: any;

  firstChange: boolean = true;
  constructor() { }

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
    this.lossState.saved = false;
    if (this.slagLossForm.status == "VALID") {
      this.calculate.emit(true);
      console.log('calculate')
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

}
