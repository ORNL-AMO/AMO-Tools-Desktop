import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Injector, linkedSignal, Signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogRef } from '@angular/cdk/dialog';
import { OperatingCosts, OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { ModalDialogService } from '../../../shared/modal-dialog.service';
import { OperatingHoursComponent, OperatingHoursDialogData } from '../../../shared/operating-hours/operating-hours.component';
import { ExploreOpportunityCategory, PHAST } from '../../models/phast';
import { ModificationService } from '../../services/modification.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';

export const OPERATIONS_DISPLAY_NAME = 'Adjust Operational Data';

export type OperationsOpportunitySection = 'operatingHours' | 'fuelCost' | 'steamCost' | 'electricityCost';
type OperatingCostSection = Exclude<OperationsOpportunitySection, 'operatingHours'>;

interface OperationsSectionDefinition {
  section: OperationsOpportunitySection;
  checkboxLabel: string;
  fieldLabel: string;
  imperialUnit: string;
  metricUnit: string;
}

const SECTION_DEFINITIONS: readonly OperationsSectionDefinition[] = [
  { section: 'operatingHours', checkboxLabel: 'Modify Operating Hours', fieldLabel: 'Operating Hours', imperialUnit: 'hrs/yr', metricUnit: 'hrs/yr' },
  { section: 'fuelCost', checkboxLabel: 'Modify Fuel Costs', fieldLabel: 'Fuel Costs', imperialUnit: '$/MMBtu', metricUnit: '$/GJ' },
  { section: 'steamCost', checkboxLabel: 'Modify Steam Costs', fieldLabel: 'Steam Costs', imperialUnit: '$/MMBtu', metricUnit: '$/GJ' },
  { section: 'electricityCost', checkboxLabel: 'Modify Electricity Costs', fieldLabel: 'Electricity Costs', imperialUnit: '$/kWh', metricUnit: '$/kWh' },
];

const ALL_SECTIONS: readonly OperationsOpportunitySection[] = SECTION_DEFINITIONS.map(({ section }) => section);

function readSectionValue(phast: PHAST | undefined, section: OperationsOpportunitySection): number | undefined {
  return section === 'operatingHours' ? phast?.operatingHours?.hoursPerYear : phast?.operatingCosts?.[section];
}

@Component({
  selector: 'app-operations-opportunity',
  standalone: false,
  templateUrl: './operations-opportunity.component.html',
  styleUrl: './operations-opportunity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsOpportunityComponent {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly modificationService = inject(ModificationService);
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly displayName = OPERATIONS_DISPLAY_NAME;
  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  readonly useOpportunity: Signal<boolean> = computed(() =>
    this.modificationService.selectedModification()?.exploreOpportunityFlags?.[ExploreOpportunityCategory.Operations]?.hasOpportunity ?? false
  );

  private readonly baseline: Signal<PHAST | undefined> = computed(() => this.assessmentService.scenarioPhastSignal('baseline'));

  private readonly modification: Signal<PHAST | undefined> = computed(() => {
    const modificationId = this.modificationService.selectedModificationId();
    return modificationId ? this.assessmentService.scenarioPhastSignal(modificationId) : undefined;
  });

  /** Seeded per modification from which sections already differ from baseline, then user-driven. */
  private readonly expandedSections = linkedSignal<string | undefined, ReadonlySet<OperationsOpportunitySection>>({
    source: this.modificationService.selectedModificationId,
    computation: () => untracked(() => new Set(ALL_SECTIONS.filter(section => this.differsFromBaseline(section)))),
  });

  readonly sections = computed(() => {
    const imperial = this.settings().unitsOfMeasure === 'Imperial';
    const expanded = this.expandedSections();
    return SECTION_DEFINITIONS.map(definition => ({
      ...definition,
      unit: imperial ? definition.imperialUnit : definition.metricUnit,
      expanded: expanded.has(definition.section),
      baselineValue: readSectionValue(this.baseline(), definition.section),
      modificationValue: readSectionValue(this.modification(), definition.section),
    }));
  });

  toggleOpportunity(hasOpportunity: boolean): void {
    const modificationId = this.modificationService.selectedModificationId();
    if (!modificationId) {
      return;
    }
    this.modificationService.setExploreOpportunityFlag(modificationId, ExploreOpportunityCategory.Operations, {
      hasOpportunity,
      display: OPERATIONS_DISPLAY_NAME,
    });
    if (!hasOpportunity) {
      this.expandedSections.set(new Set());
      this.resetToBaseline(ALL_SECTIONS);
    }
  }

  toggleSection(section: OperationsOpportunitySection, show: boolean): void {
    this.expandedSections.update(sections => {
      const updated = new Set(sections);
      if (show) {
        updated.add(section);
      } else {
        updated.delete(section);
      }
      return updated;
    });
    if (!show) {
      this.resetToBaseline([section]);
    }
  }

  setModificationValue(section: OperationsOpportunitySection, value: number): void {
    const modification = this.modification();
    const modificationId = this.modificationService.selectedModificationId();
    if (Number.isNaN(value) || !modification || !modificationId) {
      return;
    }
    if (section === 'operatingHours') {
      this.assessmentService.updateModificationProperty(modificationId, 'operatingHours', { ...modification.operatingHours, hoursPerYear: value });
    } else {
      this.assessmentService.updateModificationProperty(modificationId, 'operatingCosts', { ...modification.operatingCosts, [section]: value });
    }
  }

  openOperatingHoursModal(): void {
    const data: OperatingHoursDialogData = {
      operatingHours: this.modification()?.operatingHours,
      showMinutesSeconds: false,
    };
    const dialogRef: DialogRef<OperatingHours, OperatingHoursComponent> = this.modalDialogService.openModal<OperatingHours, OperatingHoursDialogData, OperatingHoursComponent>(
      OperatingHoursComponent, { data }, this.injector,
    );
    dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(operatingHours => {
      if (operatingHours) {
        this.saveOperatingHours(operatingHours);
      }
    });
  }

  private saveOperatingHours(operatingHours: OperatingHours): void {
    const modificationId = this.modificationService.selectedModificationId();
    if (modificationId) {
      this.assessmentService.updateModificationProperty(modificationId, 'operatingHours', { ...this.modification()?.operatingHours, ...operatingHours });
    }
  }

  private differsFromBaseline(section: OperationsOpportunitySection): boolean {
    return readSectionValue(this.baseline(), section) !== readSectionValue(this.modification(), section);
  }

  private resetToBaseline(sections: readonly OperationsOpportunitySection[]): void {
    const modificationId = this.modificationService.selectedModificationId();
    const modification = this.modification();
    const baseline = this.baseline();
    if (!modificationId || !modification) {
      return;
    }
    if (sections.includes('operatingHours')) {
      this.assessmentService.updateModificationProperty(modificationId, 'operatingHours', {
        ...modification.operatingHours,
        hoursPerYear: baseline?.operatingHours?.hoursPerYear,
      });
    }
    const costSections = sections.filter((section): section is OperatingCostSection => section !== 'operatingHours');
    if (costSections.length) {
      const baselineCosts: Partial<OperatingCosts> = Object.fromEntries(costSections.map(section => [section, baseline?.operatingCosts?.[section]]));
      this.assessmentService.updateModificationProperty(modificationId, 'operatingCosts', { ...modification.operatingCosts, ...baselineCosts });
    }
  }
}
