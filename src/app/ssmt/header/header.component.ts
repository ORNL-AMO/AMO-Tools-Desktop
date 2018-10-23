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
  @Input()
  isBaseline: boolean;

  highPressureForm: FormGroup;
  mediumPressureForm: FormGroup;
  lowPressureForm: FormGroup;
  idString: string = 'baseline_';
  constructor(private headerService: HeaderService, private ssmtService: SsmtService) { }

  ngOnInit() {
    if(!this.isBaseline){
      this.idString = 'modification_';
    }
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
    if (this.headerInput.highPressure) {
      this.highPressureForm = this.headerService.getHighestPressureHeaderFormFromObj(this.headerInput.highPressure, this.settings);
    }
    else {
      this.highPressureForm = this.headerService.initHighestPressureHeaderForm(this.settings);
    }

    if (this.headerInput.mediumPressure) {
      this.mediumPressureForm = this.headerService.getHeaderFormFromObj(this.headerInput.mediumPressure, this.settings);
    } else {
      this.mediumPressureForm = this.headerService.initHeaderForm(this.settings);
    }

    if (this.headerInput.lowPressure) {
      this.lowPressureForm = this.headerService.getHeaderFormFromObj(this.headerInput.lowPressure, this.settings);
    } else {
      this.lowPressureForm = this.headerService.initHeaderForm(this.settings);
    }
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
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
