import { Component, inject, Injector } from '@angular/core';
import { Modification } from '../../shared/models/process-cooling-assessment';
import { ModalDialogService } from '../../shared/modal-dialog.service';
import { AddModificationComponent } from './add-modification/add-modification.component';
import { ModificationService } from '../services/modification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-explore-opportunities',
  standalone: false,
  templateUrl: './explore-opportunities.component.html',
  styleUrl: './explore-opportunities.component.css'
})
export class ExploreOpportunitiesComponent {
  private modificationService = inject(ModificationService);
  private modalService = inject(ModalDialogService);
  private injector = inject(Injector);

  smallScreenTab: string = 'details';
  selectedModification$: Observable<Modification> = this.modificationService.selectedModification$
  
  addModification() {
    this.modalService.openModal<AddModificationComponent>(
      AddModificationComponent, 
      {
        width: '800px',
        data: undefined,
      },
      // * injector required for providing services inside the global (core) module
      this.injector
    );
  }
  
  saveModification(selectedModification: Modification) {
    this.modificationService.updateModification(selectedModification);
  }
  
  setSmallScreenTab(tab:string) {
    this.smallScreenTab = tab;
  }
}
