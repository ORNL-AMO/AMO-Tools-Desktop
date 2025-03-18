import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-assessment-opportunity-help',
    templateUrl: './assessment-opportunity-help.component.html',
    styleUrls: ['./assessment-opportunity-help.component.css'],
    standalone: false
})
export class AssessmentOpportunityHelpComponent {
  @Input()
  currentField: string;
  

}
