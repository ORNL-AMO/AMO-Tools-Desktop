import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy,
  inject, effect, untracked, input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { merge, Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { LeakMetaFormControls } from './steam-leak-survey-form.service';
import { SteamLeakSurveyService } from '../steam-leak-survey-service';
import { SteamLeakSurveyFormService } from './steam-leak-survey-form.service';
import { SteamMeasurementMethod } from '../../../compressed-air/compressed-air-constants';
import { SteamLeakSurveyData } from '../../../../shared/models/standalone';
@Component({
    selector: 'app-steam-leak-survey-form',
    templateUrl: './steam-leak-survey-form.component.html',
    styleUrls: ['./steam-leak-survey-form.component.css'],
    standalone: false,
})
export class SteamLeakSurveyFormComponent implements OnDestroy {
    readonly settings = input.required<Settings>();

    protected readonly surveyService = inject(SteamLeakSurveyService);
    private readonly formService = inject(SteamLeakSurveyFormService);
    private readonly cdr = inject(ChangeDetectorRef);
    
    leakMetaForm!: FormGroup<LeakMetaFormControls>;

    private formChangeSub: Subscription | null = null;

    constructor() {

        this.surveyService.resetEvents.pipe(takeUntilDestroyed()).subscribe(() => {
        const surveyInput = this.surveyService.steamLeakInput();
        const index = this.surveyService.currentLeakIndex();
        if (surveyInput) {
            const leak = surveyInput.steamLeakSurveyInputVec[index];
            if (leak) {
            this.buildForms(leak);
            }
        }
        });
    }

    private buildForms(leak: any): void {
        this.leakMetaForm = this.formService.buildLeakMetaForm(leak);
        this.subscribeToFormChanges();
        this.cdr.markForCheck();
    }

    private subscribeToFormChanges(): void {
        this.formChangeSub?.unsubscribe();
        this.formChangeSub = merge(
        this.leakMetaForm.valueChanges,
        )
      .subscribe(() => this.saveLeak());
    }

    saveLeak(): void {
        const current = this.surveyService.steamLeakInput();
        if (!current || !this.leakMetaForm) return;

        const index = this.surveyService.currentLeakIndex();
        const existing = current.steamLeakSurveyInputVec[index];
        const method: number = this.leakMetaForm.controls.measurementMethod.value ?? SteamMeasurementMethod.Estimate;
        const hoursPerYear = current.facilitySteamLeakData.annualOperatingHours

        const updatedLeak: SteamLeakSurveyData = {
            ...existing,
            selected: this.leakMetaForm.controls.selected.value ?? false,
            name: this.leakMetaForm.controls.name.value ?? '',
            leakDescription: this.leakMetaForm.controls.leakDescription.value ?? '',
            measurementMethod: method,
            units: this.leakMetaForm.controls.units.value ?? 0,
        }

        const updatedLeaks = current.steamLeakSurveyInputVec.map((leak, i) => i === index ? updatedLeak : leak);

        this.surveyService.steamLeakInput.set({
            ...current,
            steamLeakSurveyInputVec: updatedLeaks,
        });

    }


    ngOnDestroy(): void {
        this.formChangeSub?.unsubscribe();
    }
}