import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { AirLeakSurveyService } from '../air-leak-survey.service';

@Component({
  selector: 'app-air-leak-survey-results-table',
  templateUrl: './air-leak-survey-results-table.component.html',
  styleUrls: ['./air-leak-survey-results-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AirLeakSurveyResultsTableComponent {
  readonly settings = input.required<Settings>();

  protected readonly surveyService = inject(AirLeakSurveyService);

  get allSelected(): boolean {
    const leaks = this.surveyService.output().individualLeaks;
    return leaks.length > 0 && leaks.every(l => l.selected);
  }

  editLeak(index: number): void {
    this.surveyService.currentLeakIndex.set(index);
  }

  copyLeak(index: number): void {
    this.surveyService.copyLeak(index);
  }

  deleteLeak(index: number): void {
    this.surveyService.deleteLeak(index);
  }

  toggleSelected(index: number, event: Event): void {
    const selected = (event.target as HTMLInputElement).checked;
    this.surveyService.setLeakForModification(index, selected);
  }

  toggleSelectAll(): void {
    this.surveyService.setLeakForModificationSelectAll(!this.allSelected);
  }
}
