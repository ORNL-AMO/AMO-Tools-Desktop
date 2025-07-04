import { Component, Input } from '@angular/core';
import { InventoryType } from '../integrations';
import { AssessmentType } from '../../models/assessment';

@Component({
    selector: 'app-integration-help',
    templateUrl: './integration-help.component.html',
    styleUrls: ['./integration-help.component.css'],
    standalone: false
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
