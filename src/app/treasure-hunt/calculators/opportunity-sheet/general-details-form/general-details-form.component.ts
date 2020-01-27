import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { OpportunitySheet } from '../../../../shared/models/treasure-hunt';

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

  processEquipmentOptions: Array<{ value: string, display: string }> = [
    {
      value: 'motor',
      display: 'Motor'
    },
    {
      value: 'pump',
      display: 'Pump'
    },
    {
      value: 'fan',
      display: 'Fan'
    },
    {
      value: 'compressedAir',
      display: 'Compressed Air'
    },
    {
      value: 'lights',
      display: 'Lights'
    },
    {
      value: 'processHeating',
      display: 'Process Heating'
    },
    {
      value: 'processCooling',
      display: 'Process Cooling'
    },
    {
      value: 'steam',
      display: 'Steam'
    },
    {
      value: 'other',
      display: 'Other'
    },
  ]
  constructor() { }

  ngOnInit() {
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }
}
