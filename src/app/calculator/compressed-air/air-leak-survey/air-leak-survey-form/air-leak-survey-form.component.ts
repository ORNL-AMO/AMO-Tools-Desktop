import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy,
  inject, effect, untracked, input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { merge, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AirLeakSurveyData } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';
import { AirLeakSurveyService } from '../air-leak-survey.service';
import {
  AirLeakSurveyFormService,
  LeakMetaFormControls,
  EstimateFormControls,
  BagFormControls,
  OrificeFormControls,
  DecibelFormControls,
} from './air-leak-survey-form.service';
import { LeakMeasurementMethod, measurementMethods } from '../../compressed-air-constants';

@Component({
  selector: 'app-air-leak-survey-form',
  templateUrl: './air-leak-survey-form.component.html',
  styleUrls: ['./air-leak-survey-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AirLeakSurveyFormComponent implements OnDestroy {
  readonly settings = input.required<Settings>();

  protected readonly surveyService = inject(AirLeakSurveyService);
  private readonly formService = inject(AirLeakSurveyFormService);
  private readonly cdr = inject(ChangeDetectorRef);

  leakMetaForm!: FormGroup<LeakMetaFormControls>;
  estimateForm!: FormGroup<EstimateFormControls>;
  bagForm!: FormGroup<BagFormControls>;
  orificeForm!: FormGroup<OrificeFormControls>;
  decibelForm!: FormGroup<DecibelFormControls>;

  readonly LeakMeasurementMethod = LeakMeasurementMethod;
  readonly measurementMethods = measurementMethods;

  private formChangeSub: Subscription | null = null;

  constructor() {
    effect(() => {
      const index = this.surveyService.currentLeakIndex();
      const surveyInput = untracked(() => this.surveyService.airLeakInput());
      if (surveyInput) {
        const leak = surveyInput.compressedAirLeakSurveyInputVec[index];
        if (leak) {
          this.buildForms(leak);
        }
      }
    });

    this.surveyService.resetEvents.pipe(takeUntilDestroyed()).subscribe(() => {
      const surveyInput = this.surveyService.airLeakInput();
      const index = this.surveyService.currentLeakIndex();
      if (surveyInput) {
        const leak = surveyInput.compressedAirLeakSurveyInputVec[index];
        if (leak) {
          this.buildForms(leak);
        }
      }
    });
  }

  private buildForms(leak: AirLeakSurveyData): void {
    this.leakMetaForm = this.formService.buildLeakMetaForm(leak);
    this.estimateForm = this.formService.buildEstimateForm(leak);
    this.bagForm = this.formService.buildBagForm(leak);
    this.orificeForm = this.formService.buildOrificeForm(leak);
    this.decibelForm = this.formService.buildDecibelForm(leak);
    this.subscribeToFormChanges();
    this.cdr.markForCheck();
  }

  private subscribeToFormChanges(): void {
    this.formChangeSub?.unsubscribe();
    this.formChangeSub = merge(
      this.leakMetaForm.valueChanges,
      this.estimateForm.valueChanges,
      this.bagForm.valueChanges,
      this.orificeForm.valueChanges,
      this.decibelForm.valueChanges,
    )
      .pipe(debounceTime(150))
      .subscribe(() => this.saveLeak());
  }

  private saveLeak(): void {
    const current = this.surveyService.airLeakInput();
    if (!current || !this.leakMetaForm) return;

    const index = this.surveyService.currentLeakIndex();
    const existing = current.compressedAirLeakSurveyInputVec[index];
    const method: number = this.leakMetaForm.controls.measurementMethod.value ?? LeakMeasurementMethod.Estimate;
    const hoursPerYear = current.facilityCompressorData.hoursPerYear;

    const updatedLeak: AirLeakSurveyData = {
      ...existing,
      selected: this.leakMetaForm.controls.selected.value ?? true,
      name: this.leakMetaForm.controls.name.value ?? '',
      leakDescription: this.leakMetaForm.controls.leakDescription.value ?? '',
      measurementMethod: method,
      units: this.leakMetaForm.controls.units.value ?? 1,
      estimateMethodData: this.formService.getEstimateDataFromForm(this.estimateForm),
      bagMethodData: this.formService.getBagDataFromForm(this.bagForm, hoursPerYear),
      orificeMethodData: this.formService.getOrificeDataFromForm(this.orificeForm),
      decibelsMethodData: this.formService.getDecibelDataFromForm(this.decibelForm),
    };

    const updatedLeaks = current.compressedAirLeakSurveyInputVec.map((leak, i) =>
      i === index ? updatedLeak : leak
    );
    this.surveyService.airLeakInput.set({ ...current, compressedAirLeakSurveyInputVec: updatedLeaks });
  }

  addLeak(): void {
    const current = this.surveyService.airLeakInput();
    if (!current) return;
    const newLeak = this.formService.getEmptyAirLeakData();
    const updatedLeaks = [...current.compressedAirLeakSurveyInputVec, newLeak];
    this.surveyService.airLeakInput.set({ ...current, compressedAirLeakSurveyInputVec: updatedLeaks });
    this.surveyService.currentLeakIndex.set(updatedLeaks.length - 1);
  }

  setCurrentField(field: string): void {
    this.surveyService.currentField.set(field);
  }

  ngOnDestroy(): void {
    this.formChangeSub?.unsubscribe();
  }
}
