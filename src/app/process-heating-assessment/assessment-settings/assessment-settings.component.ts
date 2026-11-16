import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, Signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UntypedFormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, concatMap, debounceTime, EMPTY, firstValueFrom, from } from 'rxjs';
import { getEnergySourceLabel } from '../models/energy-source';
import { getModificationName } from '../models/modification';
import { LOSS_KEYS, PHAST } from '../models/phast';
import { Settings } from '../../shared/models/settings';
import { SettingsService } from '../../settings/settings.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { SnackbarService } from '../../shared/snackbar-notification/snackbar.service';
import { UnitsChangeAction, UnitsChangeDialogComponent, UnitsChangeDialogData } from '../../shared/units-change-dialog/units-change-dialog.component';
import { deriveHeatingEquipmentConfiguration, ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { buildEnergySourceChangeDialogData, EnergySourceChangeDialogComponent, EnergySourceChangeDialogData } from './energy-source-change-dialog/energy-source-change-dialog.component';

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
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly assessment$ = this.assessmentService.assessment$;
  readonly processHeating: Signal<PHAST> = this.assessmentService.processHeatingSignal;
  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  settingsForm!: UntypedFormGroup;
  metaForm!: FormGroup<AssessmentSettingsMetaForm>;

  // Reference to the exact Settings object this component's own save last wrote back into
  // settings(); used to skip rebuilding settingsForm on its own write instead of diffing
  // content (several SettingsService fields fall back `value || default`, which would
  // silently overwrite a legitimately entered 0).
  private lastWrittenSettings: Settings | null = null;

  constructor() {
    const settings = this.settings();
    this.settingsForm = this.settingsService.getFormFromSettings(settings);
    this.metaForm = this.fb.group({
      facilityName: [settings?.facilityInfo?.facilityName ?? ''],
      contactName: [settings?.facilityInfo?.facilityContact?.contactName ?? ''],
      equipmentNotes: [this.processHeating()?.equipmentNotes ?? ''],
      operatingConditions: [this.processHeating()?.operatingHours?.operatingConditions ?? ''],
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

    effect(() => {
      const settings = this.settings();
      if (settings === this.lastWrittenSettings) {
        return;
      }
      this.settingsForm = this.settingsService.getFormFromSettings(settings);
    });
  }

  async saveSettings(): Promise<void> {
    const current = this.settings();
    const newSettings: Settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    newSettings.id = current.id;
    newSettings.createdDate = current.createdDate;
    newSettings.assessmentId = current.assessmentId;

    if (!await this.confirmEnergySourceChange(current, newSettings)) {
      this.restoreSettingsForm(current);
      return;
    }

    let convertData = true;
    if (newSettings.unitsOfMeasure !== current.unitsOfMeasure) {
      const action = await this.confirmUnitsChange(current.unitsOfMeasure, newSettings.unitsOfMeasure);
      if (!action) {
        this.restoreSettingsForm(current);
        return;
      }
      convertData = action === 'convert';
    }
    // Read after the modal closes so a metadata save that landed while it was open is kept.
    newSettings.facilityInfo = this.settings().facilityInfo;

    this.lastWrittenSettings = newSettings;
    const valuesConverted = await this.assessmentService.saveSettings(newSettings, convertData);
    if (valuesConverted) {
      this.notifyConversion(current, newSettings);
    }
  }

  private notifyConversion(current: Settings, newSettings: Settings): void {
    let message: string | undefined;
    if (newSettings.unitsOfMeasure !== current.unitsOfMeasure) {
      message = `Values converted from ${current.unitsOfMeasure} to ${newSettings.unitsOfMeasure}.`;
    } else if (newSettings.energyResultUnit !== current.energyResultUnit) {
      message = `Values converted from ${current.energyResultUnit} to ${newSettings.energyResultUnit}.`;
    }
    if (message) {
      this.snackbarService.setSnackbarMessage(message, 'info', 'short');
    }
  }

  /** Restores the whole form, since switching units or energy source also rewrites dependent fields (energy, furnace, and rollup units). */
  private restoreSettingsForm(current: Settings): void {
    this.settingsForm.patchValue(this.settingsService.getFormFromSettings(current).getRawValue());
  }

  /**
   * Asks for confirmation when the heating equipment configuration changes and there is data the change affects.
   * @returns Whether to continue saving.
   */
  private async confirmEnergySourceChange(current: Settings, newSettings: Settings): Promise<boolean> {
    const from = deriveHeatingEquipmentConfiguration(current);
    const to = deriveHeatingEquipmentConfiguration(newSettings);
    const phast = this.processHeating();
    const modifications = this.assessmentService.getModifications(phast);
    const hasModifications = modifications.length > 0;
    const hasLossData = LOSS_KEYS.some(key => phast?.losses?.[key]?.length);
    if (from === to || !(hasModifications || hasLossData)) {
      return true;
    }
    const dialogRef = this.modalDialogService.openModal<boolean, EnergySourceChangeDialogData, EnergySourceChangeDialogComponent>(
      EnergySourceChangeDialogComponent, {
        data: buildEnergySourceChangeDialogData({
          scenarioName: 'Baseline',
          current,
          next: newSettings,
          hasInheritingModifications: modifications.some(modification => !modification.energySource),
          keptEnergySources: modifications.filter(modification => modification.energySource).map(modification => ({
            modificationName: getModificationName(modification),
            energySource: getEnergySourceLabel(this.assessmentService.scenarioSettings(modification.id)),
          })),
        }),
      },
    );
    return (await firstValueFrom(dialogRef.closed)) === true;
  }

  /**
   * @returns The chosen action, or `undefined` when the user cancels.
   */
  private confirmUnitsChange(fromUnits: string, toUnits: string): Promise<UnitsChangeAction | undefined> {
    const dialogRef = this.modalDialogService.openModal<UnitsChangeAction, UnitsChangeDialogData, UnitsChangeDialogComponent>(
      UnitsChangeDialogComponent, { data: { fromUnits, toUnits } },
    );
    return firstValueFrom(dialogRef.closed);
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
    this.lastWrittenSettings = newSettings;
    await this.assessmentService.saveSettings(newSettings);

    const phast = this.processHeating();
    this.assessmentService.setProcessHeating({
      ...phast,
      equipmentNotes,
      operatingHours: { ...phast.operatingHours, operatingConditions },
    });
  }
}
