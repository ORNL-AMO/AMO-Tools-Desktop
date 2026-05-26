import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, inject, input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AirLeakSurveyService } from '../air-leak-survey.service';

@Component({
  selector: 'app-air-leak-survey-results',
  templateUrl: './air-leak-survey-results.component.html',
  styleUrls: ['./air-leak-survey-results.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AirLeakSurveyResultsComponent {
  readonly settings = input.required<Settings>();

  protected readonly surveyService = inject(AirLeakSurveyService);

  @ViewChild('savingsTable') savingsTable!: ElementRef;
  tableString = '';

  updateTableString(): void {
    this.tableString = this.savingsTable.nativeElement.innerText;
  }
}
