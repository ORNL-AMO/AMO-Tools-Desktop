import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HeaderInput, Header } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { HeaderService } from './header.service';
import { SsmtService } from '../ssmt.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input()
  headerInput: HeaderInput;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<HeaderInput>();
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  modificationExists: boolean;
  
  headerForms: Array<FormGroup>;
  constructor(private headerService: HeaderService, private ssmtService: SsmtService) { }

  ngOnInit() {
    if (!this.headerInput) {
      this.headerInput = this.headerService.initHeaderDataObj();
    }
    this.headerForms = new Array<FormGroup>();
    this.initForms();

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (this.selected == true) {
        //  this.enableForm();
      } else if (this.selected == false) {
        //  this.disableForm();
      }
    }
  }

  initForms() {
    this.headerInput.headers.forEach(header => {
      if (header.pressureIndex == 0) {
        let tmpForm: FormGroup = this.headerService.initHighestPressureHeaderFormFromObj(header);
        this.headerForms.push(tmpForm);
      } else {
        let tmpForm: FormGroup = this.headerService.initHeaderFormFromObj(header);
        this.headerForms.push(tmpForm);
      }
    })
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }

  setNumberOfHeaders() {
    if (this.headerInput.numberOfHeaders < this.headerForms.length) {
      for (let i = this.headerForms.length; i > this.headerInput.numberOfHeaders; i--) {
        this.headerForms.pop();
      }
    } else if (this.headerInput.numberOfHeaders > this.headerForms.length) {
      for (let i = this.headerForms.length; i < this.headerInput.numberOfHeaders; i++) {
        let headerInput: Header = this.headerService.initHeaderInputObj(this.headerForms.length);
        let tmpForm: FormGroup = this.headerService.initHeaderFormFromObj(headerInput);
        this.headerForms.push(tmpForm);
      }
    }
  }

  save(){
    let tmpHeadersArr: Array<Header> = new Array<Header>();
    this.headerForms.forEach(form => {
      let tmpHeader: Header;
      if(form.controls.pressureIndex.value == 0){
        tmpHeader = this.headerService.getHighestPressureObjFromForm(form);
      }else{
        tmpHeader = this.headerService.initHeaderObjFromForm(form);
      }
      tmpHeadersArr.push(tmpHeader);
    })
    this.headerInput.headers = tmpHeadersArr;
    this.emitSave.emit(this.headerInput);
  }

}
