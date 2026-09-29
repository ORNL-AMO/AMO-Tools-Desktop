import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, inject, input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SteamLeakSurveyService } from '../steam-leak-survey-service';
@Component({
  selector: 'app-steam-leak-survey-results',
  templateUrl: './steam-leak-survey-results.component.html',
  styleUrls: ['./steam-leak-survey-results.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SteamLeakSurveyResultsComponent {
  readonly settings = input.required<Settings>();

  protected readonly surveyService = inject(SteamLeakSurveyService);

  @ViewChild('savingsTable') savingsTable!: ElementRef;
  tableString = '';

  updateTableString(): void {
    this.tableString = this.savingsTable.nativeElement.innerText;
  }
}
