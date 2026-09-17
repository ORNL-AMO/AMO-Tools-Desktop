import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, inject, input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SteamLeakSurveyService } from '../steam-leak-survey-service';

@Component({
    selector: 'app-steam-leak-copy-table',
    templateUrl: './steam-leak-copy-table.component.html',
    styleUrls: ['./steam-leak-copy-table.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class SteamLeakCopyTableComponent {
    readonly settings = input.required<Settings>();

    protected readonly surveyService = inject(SteamLeakSurveyService);

    @ViewChild('leaksTable') leaksTable!: ElementRef;
    leaksTableString = '';

    updateLeaksTableString(): void {
        this.leaksTableString = this.leaksTable.nativeElement.innerText;
    }
}