import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { HeaderService } from '../header.service';
import { SsmtService } from '../../ssmt.service';
import { HeaderNotHighestPressure, HeaderWithHighestPressure } from '../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-header-form',
  templateUrl: './header-form.component.html',
  styleUrls: ['./header-form.component.css']
})
export class HeaderFormComponent implements OnInit {
  @Input()
  headerForm: FormGroup;
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<HeaderNotHighestPressure | HeaderWithHighestPressure>();
  @Input()
  pressureLevel: string;
  @Input()
  numberOfHeaders: number;

  headerLabel: string;
  constructor(private headerService: HeaderService, private ssmtService: SsmtService) { }

  ngOnInit() {
    if (this.selected == false) {
      this.disableForm();
    } else {
      this.enableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (this.selected == false) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    }
  }

  enableForm() {
    if (this.pressureLevel == 'high') {
      this.headerForm.controls.flashCondensateReturn.enable();
    } else {
      this.headerForm.controls.flashCondensateIntoHeader.enable();
      this.headerForm.controls.desuperheatSteamIntoNextHighest.enable();
    }
  }

  disableForm() {
    if (this.pressureLevel == 'high') {
      this.headerForm.controls.flashCondensateReturn.disable();
    } else {
      this.headerForm.controls.flashCondensateIntoHeader.disable();
      this.headerForm.controls.desuperheatSteamIntoNextHighest.disable();
    }
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }

  save() {
    if(this.pressureLevel == 'high'){
      let tmpHeader: HeaderWithHighestPressure = this.headerService.getHighestPressureObjFromForm(this.headerForm);
      this.emitSave.emit(tmpHeader);
    }else{
      let tmpHeader: HeaderNotHighestPressure = this.headerService.initHeaderObjFromForm(this.headerForm);
      this.emitSave.emit(tmpHeader);
    }
  }
}
