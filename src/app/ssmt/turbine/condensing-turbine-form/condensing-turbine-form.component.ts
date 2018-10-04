import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { Quantity } from '../../../shared/models/steam/steam-inputs';
import { CondensingTurbineOperationTypes } from '../../../shared/models/steam/ssmt';
import { SsmtService } from '../../ssmt.service';

@Component({
  selector: 'app-condensing-turbine-form',
  templateUrl: './condensing-turbine-form.component.html',
  styleUrls: ['./condensing-turbine-form.component.css']
})
export class CondensingTurbineFormComponent implements OnInit {
  @Input()
  turbineForm: FormGroup;
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  turbineOptionTypes: Array<Quantity>;
  constructor(private ssmtService: SsmtService) {
  }

  ngOnInit() {
    this.turbineOptionTypes = CondensingTurbineOperationTypes;
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

  enableForm(){
    this.turbineForm.controls.operationType.enable();
  }

  disableForm(){
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
