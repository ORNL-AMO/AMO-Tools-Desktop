import { Component, computed, inject, Injector, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { ASSESSMENT_VIEW_LINKS } from '../models/views';
import { Modification } from '../../shared/models/process-cooling-assessment';
import { ROUTE_TOKENS } from '../constants/process-cooling-routes';
import { ModificationService } from '../services/modification.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { ModificationListData, openModificationListModal } from '../../shared/modification-list/modification-list.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-assessment',
  standalone: false,
  templateUrl: './assessment.component.html',
  styleUrl: './assessment.component.css',
  host: { style: 'height: 100%; display: flex; flex-direction: column; overflow: hidden;' }
})
export class AssessmentComponent {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  private readonly modificationService = inject(ModificationService);
  private injector = inject(Injector);
  private modalDialogService = inject(ModalDialogService);
  
  readonly ROUTE_TOKENS = ROUTE_TOKENS;
  smallScreenPanelTab: string = 'help';
  isModalOpen: boolean = false;
  selectedModification$: Observable<Modification> = this.modificationService.selectedModification$

  ASSESSMENT_VIEW_LINKS = ASSESSMENT_VIEW_LINKS;
  assessmentView: Signal<string> = this.processCoolingUiService.childView;

  private readonly selectedModificationId = toSignal(this.modificationService.selectedModificationId$, { initialValue: undefined });

  selectModification() {
    const data: ModificationListData = {
      themeClass: 'process-cooling-assessment',
      items: computed(() => this.modificationService.modifications().map(modification => ({
        id: modification.id,
        name: modification.name,
        badges: this.modificationService.getEEMBadges(modification),
      }))),
      selectedItemId: this.selectedModificationId,
      showBadges: true,
      onSelect: id => this.modificationService.setSelectedModificationId(id),
      onRename: (id, name) => this.modificationService.renameModification(id, name),
      onDelete: id => this.modificationService.deleteAssessmentModification(id),
      onCopy: id => this.modificationService.copyModification(id),
      onAddNew: name => this.modificationService.addNewModificationToAssessment(name),
    };
    openModificationListModal(this.modalDialogService, this.injector, data);
  }

  next() {
  this.processCoolingUiService.continue();
  }

  back() {
    this.processCoolingUiService.back();
  }

  readonly canContinue: Signal<boolean> = this.processCoolingUiService.canContinue;
  readonly canGoBack: Signal<boolean> = this.processCoolingUiService.canGoBack;
}
