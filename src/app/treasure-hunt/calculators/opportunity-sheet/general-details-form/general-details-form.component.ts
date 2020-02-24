import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { OpportunitySheet } from '../../../../shared/models/treasure-hunt';
import { processEquipmentOptions } from './processEquipmentOptions';

@Component({
  selector: 'app-general-details-form',
  templateUrl: './general-details-form.component.html',
  styleUrls: ['./general-details-form.component.css']
})
export class GeneralDetailsFormComponent implements OnInit {
  @Input()
  opportunitySheet: OpportunitySheet;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  processEquipmentOptions: Array<{ value: string, display: string }>;
  constructor() { 
    this.processEquipmentOptions = processEquipmentOptions;
  }

  ngOnInit() {
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }
}
