import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy,
  inject, effect, untracked, input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { merge, Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import {
  LeakMetaFormControls,
  EstimateFormControls,
  OrificeFormControls,
  PlumeFormControls,
} from './steam-leak-survey-form.service';
import { SteamLeakSurveyService } from '../steam-leak-survey-service';
import { SteamLeakSurveyFormService } from './steam-leak-survey-form.service';
import { SteamLeakMeasurementMethod } from '../steam-leak-constants';
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
  estimateForm!: FormGroup<EstimateFormControls>;
  orificeForm!: FormGroup<OrificeFormControls>;
  plumeForm!: FormGroup<PlumeFormControls>;

  readonly SteamLeakMeasurementMethod = SteamLeakMeasurementMethod;

  readonly pressureReductionMethods: Array<{ display: string; value: number }> = [
    { display: 'Other Fuel', value: 0 },
    { display: 'Pressure Reducing Valve (PRV)', value: 1 },
    { display: 'Steam Turbine', value: 2 },
    { display: 'Natural Gas', value: 3 },
  ];

  readonly steamMeasurementMethods: Array<{ display: string; value: number }> = [
    { display: 'Estimate', value: SteamLeakMeasurementMethod.Estimate },
    { display: 'Orifice', value: SteamLeakMeasurementMethod.Orifice },
    { display: 'Plume', value: SteamLeakMeasurementMethod.Plume },
  ];

  private formChangeSub: Subscription | null = null;

  constructor() {
    effect(() => {
      const index = this.surveyService.currentLeakIndex();
      const surveyInput = untracked(() => this.surveyService.steamLeakInput());
      if (surveyInput) {
        const leak = surveyInput.steamLeakSurveyInputVec[index];
        if (leak) {
          this.buildForms(leak);
        }
      }
    });

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

  setCurrentField(field: string): void {
    this.surveyService.currentField.set(field);
  }

  addLeak(): void {
    const current = this.surveyService.steamLeakInput();
    if (!current) return;
    const emptyLeak = this.formService.getEmptySteamLeakData(this.settings());
    const updatedLeaks = [...current.steamLeakSurveyInputVec, emptyLeak];
    this.surveyService.steamLeakInput.set({ ...current, steamLeakSurveyInputVec: updatedLeaks });
    this.surveyService.currentLeakIndex.set(updatedLeaks.length - 1);
  }

  private buildForms(leak: SteamLeakSurveyData): void {
    this.leakMetaForm = this.formService.buildLeakMetaForm(leak);
    this.estimateForm = this.formService.buildEstimateForm(leak);
    this.orificeForm = this.formService.buildOrificeForm(leak);
    this.plumeForm = this.formService.buildPlumeForm(leak);
    this.subscribeToFormChanges();
    this.cdr.markForCheck();
  }

  private subscribeToFormChanges(): void {
    this.formChangeSub?.unsubscribe();
    this.formChangeSub = merge(
      this.leakMetaForm.valueChanges,
      this.estimateForm.valueChanges,
      this.orificeForm.valueChanges,
      this.plumeForm.valueChanges,
    ).subscribe(() => this.saveLeak());
  }

  saveLeak(): void {
    const current = this.surveyService.steamLeakInput();
    if (!current || !this.leakMetaForm) return;

    const index = this.surveyService.currentLeakIndex();
    const existing = current.steamLeakSurveyInputVec[index];
    const method: number = this.leakMetaForm.controls.measurementMethod.value ?? SteamLeakMeasurementMethod.Estimate;

    const activeMethodFormValid =
      (method === SteamLeakMeasurementMethod.Estimate && this.estimateForm.valid) ||
      (method === SteamLeakMeasurementMethod.Orifice && this.orificeForm.valid) ||
      (method === SteamLeakMeasurementMethod.Plume && this.plumeForm.valid);
    if (!activeMethodFormValid) return;

    const updatedLeak: SteamLeakSurveyData = {
      ...existing,
      selected: this.leakMetaForm.controls.selected.value ?? false,
      name: this.leakMetaForm.controls.name.value ?? '',
      leakDescription: this.leakMetaForm.controls.leakDescription.value ?? '',
      measurementMethod: method,
      units: this.leakMetaForm.controls.units.value ?? 0,
      estimateMethodData: this.formService.getEstimateDataFromForm(this.estimateForm),
      orificeMethodData: this.formService.getOrificeDataFromForm(this.orificeForm),
      plumeMethodData: this.formService.getPlumeDataFromForm(this.plumeForm),
    };

    const updatedLeaks = current.steamLeakSurveyInputVec.map((leak, i) => i === index ? updatedLeak : leak);
    this.surveyService.steamLeakInput.set({ ...current, steamLeakSurveyInputVec: updatedLeaks });
  }

  ngOnDestroy(): void {
    this.formChangeSub?.unsubscribe();
  }
}