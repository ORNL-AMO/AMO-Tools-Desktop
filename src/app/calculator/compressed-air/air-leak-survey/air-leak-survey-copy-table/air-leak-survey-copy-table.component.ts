import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, inject, input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AirLeakSurveyService } from '../air-leak-survey.service';

@Component({
  selector: 'app-air-leak-survey-copy-table',
  templateUrl: './air-leak-survey-copy-table.component.html',
  styleUrls: ['./air-leak-survey-copy-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AirLeakSurveyCopyTableComponent {
  readonly settings = input.required<Settings>();

  protected readonly surveyService = inject(AirLeakSurveyService);

  @ViewChild('leaksTable') leaksTable!: ElementRef;
  leaksTableString = '';

  updateLeaksTableString(): void {
    this.leaksTableString = this.leaksTable.nativeElement.innerText;
  }
}
