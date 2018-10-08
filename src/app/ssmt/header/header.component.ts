import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HeaderInput, HeaderWithHighestPressure, HeaderNotHighestPressure } from '../../shared/models/steam/ssmt';
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

  highPressureForm: FormGroup;
  mediumPressureForm: FormGroup;
  lowPressureForm: FormGroup;
  constructor(private headerService: HeaderService, private ssmtService: SsmtService) { }

  ngOnInit() {
    if (!this.headerInput) {
      this.headerInput = this.headerService.initHeaderDataObj();
    }
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
    this.highPressureForm = this.headerService.initHighestPressureHeaderFormFromObj(this.headerInput.highPressure);
    this.mediumPressureForm = this.headerService.initHeaderFormFromObj(this.headerInput.mediumPressure);
    this.lowPressureForm = this.headerService.initHeaderFormFromObj(this.headerInput.lowPressure);
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }

  setNumberOfHeaders() {
    // if (this.headerInput.numberOfHeaders < this.headerForms.length) {
    //   for (let i = this.headerForms.length; i > this.headerInput.numberOfHeaders; i--) {
    //     this.headerForms.pop();
    //   }
    // } else if (this.headerInput.numberOfHeaders > this.headerForms.length) {
    //   for (let i = this.headerForms.length; i < this.headerInput.numberOfHeaders; i++) {
    //     let headerInput: Header = this.headerService.initHeaderInputObj(this.headerForms.length);
    //     let tmpForm: FormGroup = this.headerService.initHeaderFormFromObj(headerInput);
    //     this.headerForms.push(tmpForm);
    //   }
    // }
    this.save();
  }

  save() {
    this.emitSave.emit(this.headerInput);
  }

  saveHighPressure(header: HeaderWithHighestPressure) {
    this.headerInput.highPressure = header;
    this.save();
  }

  saveMediumPressure(header: HeaderNotHighestPressure) {
    this.headerInput.mediumPressure = header;
    this.save();
  }

  saveLowPressure(header: HeaderNotHighestPressure) {
    this.headerInput.lowPressure = header;
    this.save();
  }

}
