import { ChangeDetectionStrategy, Component, computed, inject, Injector, Signal, Type } from '@angular/core';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { ModificationService } from '../services/modification.service';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { Losses, Notes } from '../models/phast';
import { getModificationName, ProcessHeatingModification } from '../models/modification';
import { OPPORTUNITY_REGISTRY } from './opportunity-registry';
import { AddModificationComponent, DEFAULT_DESCRIPTION } from '../../shared/add-modification/add-modification.component';

export interface OpportunityGroup {
  notesKey: keyof Notes;
  components: Type<unknown>[];
}

@Component({
  selector: 'app-explore-opportunities',
  standalone: false,
  templateUrl: './explore-opportunities.component.html',
  styleUrl: './explore-opportunities.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExploreOpportunitiesComponent {
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly injector = inject(Injector);
  private readonly modificationService = inject(ModificationService);
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly uiService = inject(ProcessHeatingUiService);

  readonly selectedModification: Signal<ProcessHeatingModification | undefined> = this.modificationService.selectedModification;

  readonly visibleOpportunityGroups: Signal<OpportunityGroup[]> = computed(() => OPPORTUNITY_REGISTRY
    .filter(entry => !entry.lossKey || this.hasBaselineLosses(entry.lossKey))
    .map(({ notesKey, opportunityComponents }): OpportunityGroup => ({
      notesKey,
      components: opportunityComponents
        .filter(({ heatingEquipmentConfigurations }) => !heatingEquipmentConfigurations || heatingEquipmentConfigurations.includes(this.heatingEquipmentConfiguration()))
        .map(({ component }) => component),
    }))
    .filter(({ components }) => components.length > 0));

  readonly visibleOpportunityComponents: Signal<Type<unknown>[]> = computed(() => this.visibleOpportunityGroups().flatMap(({ components }) => components));

  private readonly heatingEquipmentConfiguration = this.assessmentService.heatingEquipmentConfiguration;

  private hasBaselineLosses(lossKey: keyof Losses): boolean {
    return (this.assessmentService.lossSignal('baseline', lossKey)?.length ?? 0) > 0;
  }

  setNotesKey(key: keyof Notes): void {
    this.uiService.setExploreNotesKey(key);
  }

  modificationName(modification: ProcessHeatingModification): string {
    return getModificationName(modification);
  }

  renameModification(modification: ProcessHeatingModification, name: string): void {
    if (!name.trim()) return;
    this.modificationService.renameModification(modification.id, name);
  }

  setImplementationCost(modification: ProcessHeatingModification, cost: number): void {
    this.assessmentService.updateModificationProperty(modification.id, 'implementationCost', Number.isNaN(cost) ? undefined : cost);
  }

  setFocusedField(field: string): void {
    this.uiService.focusedFieldSignal.set(field);
  }

  addModification(): void {
    const hasExistingModifications = this.modificationService.modifications().length > 0;
    this.modalDialogService.openModal(AddModificationComponent, {
      width: '800px',
      data: {
        themeClass: 'process-heating-assessment',
        description: hasExistingModifications ? '' : DEFAULT_DESCRIPTION,
        defaultName: this.modificationService.defaultModificationName(),
        onCreate: (name: string) => this.modificationService.addModification(name),
      },
    }, this.injector);
  }
}
