import { ChangeDetectionStrategy, Component, inject, Injector, Signal } from '@angular/core';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { ModificationService } from '../services/modification.service';
import { getModificationName, ProcessHeatingModification } from '../models/modification';
import { AddModificationComponent, DEFAULT_DESCRIPTION } from '../../shared/add-modification/add-modification.component';

@Component({
  selector: 'app-expert-view',
  standalone: false,
  templateUrl: './expert-view.component.html',
  styleUrl: './expert-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertViewComponent {
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly injector = inject(Injector);
  private readonly modificationService = inject(ModificationService);

  readonly selectedModification: Signal<ProcessHeatingModification | undefined> = this.modificationService.selectedModification;

  modificationName(modification: ProcessHeatingModification): string {
    return getModificationName(modification);
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
