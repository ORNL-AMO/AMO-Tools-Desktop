import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-integration-help',
  templateUrl: './integration-help.component.html',
  styleUrls: ['./integration-help.component.css']
})
export class IntegrationHelpComponent {
@Input()
isMotorInventory: boolean;
@Input()
focusedField: string;


constructor() {
}

ngOnInit() {
}
}
