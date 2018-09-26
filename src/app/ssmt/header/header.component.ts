import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HeaderData } from '../../shared/models/ssmt';
import { Settings } from '../../shared/models/settings';
import { HeaderService } from './header.service';
import { SsmtService } from '../ssmt.service';
import { HeaderInput } from '../../shared/models/ssmt';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input()
  headerData: HeaderData;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<HeaderData>();
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;

  headerForms: Array<FormGroup>;
  constructor(private headerService: HeaderService, private ssmtService: SsmtService) { }

  ngOnInit() {
    if (!this.headerData) {
      this.headerData = this.headerService.initHeaderDataObj();
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
    this.headerData.headers.forEach(header => {
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
    if (this.headerData.numberOfHeaders < this.headerForms.length) {
      for (let i = this.headerForms.length; i > this.headerData.numberOfHeaders; i--) {
        this.headerForms.pop();
      }
    } else if (this.headerData.numberOfHeaders > this.headerForms.length) {
      for (let i = this.headerForms.length; i < this.headerData.numberOfHeaders; i++) {
        let headerData: HeaderInput = this.headerService.initHeaderInputObj(this.headerForms.length);
        let tmpForm: FormGroup = this.headerService.initHeaderFormFromObj(headerData);
        this.headerForms.push(tmpForm);
      }
    }
  }

}
