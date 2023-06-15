import { Component, Input } from '@angular/core';
import { AssessmentType, InventoryType } from '../integrations';

@Component({
  selector: 'app-integration-help',
  templateUrl: './integration-help.component.html',
  styleUrls: ['./integration-help.component.css']
})
export class IntegrationHelpComponent {
@Input()
connectionType: InventoryType | AssessmentType;
@Input()
focusedField: string;


constructor() {
}

ngOnInit() {
}
}
