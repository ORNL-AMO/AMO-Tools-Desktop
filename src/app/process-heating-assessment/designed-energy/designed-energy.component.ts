import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DesignedEnergy } from '../../shared/models/phast/designedEnergy';
import { Settings } from '../../shared/models/settings';
import { defaultEnergySources, EnergySource, onlySourceOn } from '../energy-validation/default-energy-sources';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { DesignedEnergyForm, DesignedEnergyFormService, DesignedZoneForm } from './designed-energy-form.service';

@Component({
  selector: 'app-process-heating-designed-energy',
  standalone: false,
  templateUrl: './designed-energy.component.html',
  styleUrl: './designed-energy.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesignedEnergyComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly formService = inject(DesignedEnergyFormService);
  private readonly destroyRef = inject(DestroyRef);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;
  readonly isMetric: Signal<boolean> = computed(() => this.settings()?.unitsOfMeasure === 'Metric');

  readonly form: DesignedEnergyForm = this.formService.getForm(
    this.assessmentService.processHeatingSignal().designedEnergy,
    defaultEnergySources(this.uiService.heatingSystemConfigurationSignal()),
  );

  readonly designedEnergy: WritableSignal<DesignedEnergy> = signal(this.formService.toDesignedEnergy(this.form));

  /** The only source turned on, whose button is disabled since one source is always required. */
  readonly lockedSource: Signal<EnergySource | undefined> = computed(() => onlySourceOn(this.designedEnergy()));

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const designedEnergy = this.formService.toDesignedEnergy(this.form);
      this.designedEnergy.set(designedEnergy);
      this.assessmentService.updateProcessHeatingProperty('designedEnergy', designedEnergy);
    });
  }

  toggleSource(source: EnergySource): void {
    this.formService.setSourceEnabled(this.form, source, !this.form.controls[source].value);
  }

  /** Keyed by the zone's form group, since zones have no ids; view state only, never saved. */
  private readonly collapsedZones = signal<ReadonlySet<DesignedZoneForm>>(new Set());

  isCollapsed(zone: DesignedZoneForm): boolean {
    return this.collapsedZones().has(zone);
  }

  toggleCollapse(zone: DesignedZoneForm): void {
    const next = new Set(this.collapsedZones());
    if (!next.delete(zone)) next.add(zone);
    this.collapsedZones.set(next);
  }

  addZone(): void {
    this.formService.addZone(this.form);
  }

  removeZone(index: number): void {
    const zone = this.form.controls.zones.at(index);
    this.formService.removeZone(this.form, index);
    if (this.collapsedZones().has(zone)) this.toggleCollapse(zone);
  }

  focusField(field: string): void {
    this.uiService.focusedFieldSignal.set(field);
  }
}
