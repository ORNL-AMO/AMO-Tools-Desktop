import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-assessment-opportunity-help',
  templateUrl: './assessment-opportunity-help.component.html',
  styleUrls: ['./assessment-opportunity-help.component.css']
})
export class AssessmentOpportunityHelpComponent {
  @Input()
  currentField: string;
  

}
