import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { Quantity } from '../../../shared/models/steam/steam-inputs';
import { PressureTurbineOperationTypes } from '../../../shared/models/steam/ssmt';
import { SsmtService } from '../../ssmt.service';

@Component({
  selector: 'app-pressure-turbine-form',
  templateUrl: './pressure-turbine-form.component.html',
  styleUrls: ['./pressure-turbine-form.component.css']
})
export class PressureTurbineFormComponent implements OnInit {
  @Input()
  turbineForm: FormGroup;
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Input()
  turbineTitle: string;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();

  turbineTypeOptions: Array<Quantity>;
  constructor(private ssmtService: SsmtService) {
  }

  ngOnInit() {
    this.turbineTypeOptions = PressureTurbineOperationTypes;
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
    this.turbineForm.controls.operationType.enable();
  }

  disableForm() {
    this.turbineForm.controls.operationType.disable();
  }


  save() {
    this.emitSave.emit(true);
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }

}
