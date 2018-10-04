import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { HeaderService } from '../header.service';
import { SsmtService } from '../../ssmt.service';

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
  @Input()
  numberOfHeaders: number;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  headerLabel: string;
  constructor(private headerService: HeaderService, private ssmtService: SsmtService) { }

  ngOnInit() {
    this.headerLabel = this.headerService.getHeaderLabel(this.headerForm.controls.pressureIndex.value, this.numberOfHeaders);
    if (this.selected == false) {
      this.disableForm();
    } else {
      this.enableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.numberOfHeaders && !changes.numberOfHeaders.isFirstChange()) {
      this.headerLabel = this.headerService.getHeaderLabel(this.headerForm.controls.pressureIndex.value, this.numberOfHeaders);
    }

    if (changes.selected && !changes.selected.isFirstChange()) {
      if (this.selected == false) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    }
  }

  enableForm() {
    if (this.headerForm.controls.pressureIndex.value == 0) {
      this.headerForm.controls.flashCondensateReturn.enable();
    } else {
      this.headerForm.controls.flashCondensateIntoHeader.enable();
      this.headerForm.controls.desuperheatSteamIntoNextHighest.enable();
    }
  }

  disableForm() {
    if (this.headerForm.controls.pressureIndex.value == 0) {
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
    this.emitSave.emit(true);
  }
}
