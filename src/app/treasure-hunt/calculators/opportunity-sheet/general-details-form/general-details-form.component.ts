import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { OpportunitySheet } from '../../../../shared/models/treasure-hunt';
import { processEquipmentOptions } from './processEquipmentOptions';

@Component({
    selector: 'app-general-details-form',
    templateUrl: './general-details-form.component.html',
    styleUrls: ['./general-details-form.component.css'],
    standalone: false
})
export class GeneralDetailsFormComponent implements OnInit {
  @Input()
  opportunitySheet: OpportunitySheet;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  isAssessmentOpportunity: boolean;

  processEquipmentOptions: Array<{ value: string, display: string }>;
  constructor() { 
  }
  
  ngOnInit(): void {
    this.processEquipmentOptions = processEquipmentOptions;
    if (!this.opportunitySheet.description) {
      this.opportunitySheet.description = 'This is important information you want in the presentation or report.';
    }
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }
}
