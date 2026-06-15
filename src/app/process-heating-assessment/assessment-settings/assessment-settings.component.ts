import { ChangeDetectionStrategy, Component, DestroyRef, inject, Signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UntypedFormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, concatMap, debounceTime, EMPTY, firstValueFrom, from } from 'rxjs';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { SettingsService } from '../../settings/settings.service';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';

// TODO Step N: When settings change units of measure (Imperial ↔ Metric), existing loss values stored
// on the assessment need to be converted to the new unit system before being persisted — the same
// conversion logic the old PHAST ran on every settings save. Wire that conversion here once the
// loss forms exist (Step 6+), keying off the old vs. new unitsOfMeasure value.

// TODO StepN.2: Db save should be changed

interface AssessmentSettingsMetaForm {
  facilityName: FormControl<string>;
  contactName: FormControl<string>;
  equipmentNotes: FormControl<string>;
  operatingConditions: FormControl<string>;
}

@Component({
  selector: 'app-assessment-settings',
  standalone: false,
  templateUrl: './assessment-settings.component.html',
  styleUrl: './assessment-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentSettingsComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly settingsService = inject(SettingsService);
  private readonly settingsDbService = inject(SettingsDbService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly assessment$ = this.assessmentService.assessment$;
  readonly processHeating: Signal<PHAST> = this.assessmentService.processHeatingSignal;
  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  settingsForm!: UntypedFormGroup;
  metaForm!: FormGroup<AssessmentSettingsMetaForm>;

  ngOnInit(): void {
    const phast = this.processHeating();
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings());

    this.metaForm = this.fb.group({
      facilityName: [this.settings()?.facilityInfo?.facilityName ?? ''],
      contactName: [this.settings()?.facilityInfo?.facilityContact?.contactName ?? ''],
      equipmentNotes: [phast?.equipmentNotes ?? ''],
      operatingConditions: [phast?.operatingHours?.operatingConditions ?? ''],
    }) as FormGroup<AssessmentSettingsMetaForm>;

    this.metaForm.valueChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef),
      concatMap(() => from(this.saveMetaData()).pipe(
        catchError(err => {
          console.error('Failed to save assessment metadata:', err);
          return EMPTY;
        }),
      )),
    ).subscribe();
  }

  async saveSettings(): Promise<void> {
    const current = this.settings();
    const newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    newSettings.id = current.id;
    newSettings.createdDate = current.createdDate;
    newSettings.assessmentId = current.assessmentId;
    newSettings.facilityInfo = current.facilityInfo;
    await firstValueFrom(this.settingsDbService.updateWithObservable(newSettings));
    const allSettings = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(allSettings);
    this.assessmentService.setSettings(newSettings);
  }


  private async saveMetaData(): Promise<void> {
    const { facilityName, contactName, equipmentNotes, operatingConditions } = this.metaForm.getRawValue();

    const current = this.settings();
    const newSettings: Settings = {
      ...current,
      facilityInfo: {
        ...current.facilityInfo,
        facilityName,
        facilityContact: {
          ...current.facilityInfo?.facilityContact,
          contactName,
        },
      },
    };
    await firstValueFrom(this.settingsDbService.updateWithObservable(newSettings));
    const allSettings = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(allSettings);
    this.assessmentService.setSettings(newSettings);

    const phast = this.processHeating();
    this.assessmentService.setProcessHeating({
      ...phast,
      equipmentNotes,
      operatingHours: { ...phast.operatingHours, operatingConditions },
    });
  }
}
