import { Component, inject, Injector, Signal } from '@angular/core';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { ASSESSMENT_VIEW_LINKS } from '../models/views';
import { Modification } from '../../shared/models/process-cooling-assessment';
import { ROUTE_TOKENS } from '../constants/process-cooling-routes';
import { ModificationService } from '../services/modification.service';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { ModificationListComponent } from '../explore-opportunities/modification-list/modification-list.component';
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

  selectModification() {
    this.modalDialogService.openModal<ModificationListComponent, undefined>(
      ModificationListComponent, 
      {
        width: '1200px', 
        data: undefined,
      },
      this.injector
    );
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
