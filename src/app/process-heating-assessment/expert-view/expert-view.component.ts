import { ChangeDetectionStrategy, Component, inject, Injector, Signal } from '@angular/core';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { ModificationService } from '../services/modification.service';
import { getModificationName, ProcessHeatingModification } from '../models/modification';
import { AUXILIARY_EQUIPMENT_VIEW, LossView, ProcessHeatingView, ViewLink } from '../models/views';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { ProcessHeatingValidityService } from '../services/process-heating-validity.service';
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
  private readonly validityService = inject(ProcessHeatingValidityService);

  readonly LossView = LossView;
  readonly AUXILIARY_EQUIPMENT_VIEW = AUXILIARY_EQUIPMENT_VIEW;
  readonly selectedModification: Signal<ProcessHeatingModification | undefined> = this.modificationService.selectedModification;
  readonly tabs: Signal<ViewLink[]> = this.uiService.visibleExpertViewTabs;
  readonly selectedTab: Signal<ProcessHeatingView | undefined> = this.uiService.selectedExpertViewTab;

  selectTab(view: ProcessHeatingView): void {
    this.uiService.selectExpertViewTab(view);
  }

  /** Marks a tab whose step is invalid in the baseline or in the modification, since both are edited here. */
  isTabInvalid(link: ViewLink, modification: ProcessHeatingModification): boolean {
    return !this.validityService.isStepValid('baseline', link.view) || !this.validityService.isStepValid(modification.id, link.view);
  }

  /** @returns the accessible name and tooltip for a marked tab, or null while its inputs are valid */
  invalidTabLabel(link: ViewLink, modification: ProcessHeatingModification): string | null {
    return this.isTabInvalid(link, modification) ? `${link.label}, has invalid inputs` : null;
  }

  lossCount(link: ViewLink, modification: ProcessHeatingModification): number | undefined {
    return this.uiService.lossCount(link.view, modification.id);
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
