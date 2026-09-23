import { ChangeDetectionStrategy, Component, inject, Injector, Signal } from '@angular/core';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { ModificationService } from '../services/modification.service';
import { getModificationName, ProcessHeatingModification } from '../models/modification';
import { LossView, ProcessHeatingView, ViewLink } from '../models/views';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
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
  private readonly uiService = inject(ProcessHeatingUiService);

  readonly LossView = LossView;
  readonly selectedModification: Signal<ProcessHeatingModification | undefined> = this.modificationService.selectedModification;
  readonly tabs: Signal<ViewLink[]> = this.uiService.visibleExpertViewTabs;
  readonly selectedTab: Signal<ProcessHeatingView | undefined> = this.uiService.selectedExpertViewTab;

  selectTab(view: ProcessHeatingView): void {
    this.uiService.selectExpertViewTab(view);
  }

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
