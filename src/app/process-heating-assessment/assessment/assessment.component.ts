import { ChangeDetectionStrategy, Component, computed, inject, Injector, Signal } from '@angular/core';
import { ASSESSMENT_VIEW_LINKS, ViewLink } from '../models/views';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { ModificationService } from '../services/modification.service';
import { ProcessHeatingUiService } from '../services/process-heating-ui.service';
import { AssessmentScenario } from '../services/process-heating-assessment.service';
import { getModificationName, ProcessHeatingModification } from '../models/modification';
import { ModificationListData, openModificationListModal } from '../../shared/modification-list/modification-list.component';

@Component({
  selector: 'app-assessment',
  standalone: false,
  templateUrl: './assessment.component.html',
  styleUrl: './assessment.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'height: 100%; display: flex; flex-direction: column; overflow: hidden;' },
})
export class AssessmentComponent {
  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly injector = inject(Injector);
  private readonly modificationService = inject(ModificationService);

  readonly ASSESSMENT_VIEW_LINKS: ViewLink[] = ASSESSMENT_VIEW_LINKS;

  readonly selectedModification: Signal<ProcessHeatingModification | undefined> = this.modificationService.selectedModification;
  readonly resultsScenario: Signal<AssessmentScenario> = computed(() => this.selectedModification()?.id ?? 'baseline');

  readonly canContinue: Signal<boolean> = this.uiService.canContinue;
  readonly canGoBack: Signal<boolean> = this.uiService.canGoBack;

  next(): void {
    this.uiService.continue();
  }

  back(): void {
    this.uiService.back();
  }

  modificationName(modification: ProcessHeatingModification): string {
    return getModificationName(modification);
  }

  selectScenario(): void {
    const data: ModificationListData = {
      themeClass: 'process-heating-assessment',
      items: computed(() => this.modificationService.modifications().map(modification => ({
        id: modification.id,
        name: getModificationName(modification),
      }))),
      selectedItemId: this.modificationService.selectedModificationId,
      onSelect: id => this.modificationService.selectModification(id),
      onRename: (id, name) => this.modificationService.renameModification(id, name),
      onDelete: id => this.modificationService.deleteModification(id),
      onCopy: id => this.modificationService.copyModification(id),
      onAddNew: name => this.modificationService.addModification(name),
    };
    openModificationListModal(this.modalDialogService, this.injector, data);
  }
}
