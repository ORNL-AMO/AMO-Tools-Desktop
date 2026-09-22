import { ChangeDetectionStrategy, Component, computed, inject, Injector, Signal } from '@angular/core';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { ModificationService } from '../services/modification.service';
import { ProcessHeatingAssessmentService } from '../services/process-heating-assessment.service';
import { getModificationName, ProcessHeatingModification } from '../models/modification';
import { AddModificationComponent, DEFAULT_DESCRIPTION } from '../../shared/add-modification/add-modification.component';

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

  readonly selectedModification: Signal<ProcessHeatingModification | undefined> = this.modificationService.selectedModification;

  readonly hasAtmosphereLosses = computed(() => (this.assessmentService.lossSignal('baseline', 'atmosphereLosses')?.length ?? 0) > 0);

  modificationName(modification: ProcessHeatingModification): string {
    return getModificationName(modification);
  }

  renameModification(modification: ProcessHeatingModification, name: string): void {
    if (!name.trim()) return;
    this.modificationService.renameModification(modification.id, name);
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
