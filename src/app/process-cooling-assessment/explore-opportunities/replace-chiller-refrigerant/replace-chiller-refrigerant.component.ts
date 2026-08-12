import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Modification } from '../../../shared/models/process-cooling-assessment';
import { EEM_LABELS } from '../../constants/process-cooling-constants';
import { ModificationService } from '../../services/modification.service';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';

@Component({
  selector: 'app-replace-chiller-refrigerant',
  standalone: false,
  templateUrl: './replace-chiller-refrigerant.component.html',
  styleUrl: './replace-chiller-refrigerant.component.css'
})
export class ReplaceChillerRefrigerantComponent implements OnInit {
  private modificationService = inject(ModificationService);
  private processCoolingUiService = inject(ProcessCoolingUiService);
  private destroyRef = inject(DestroyRef);

  EEM_LABELS = EEM_LABELS;
  useOpportunity: boolean = false;

  ngOnInit(): void {
    this.modificationService.selectedModification$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((modification: Modification) => {
      if (modification) {
        this.useOpportunity = modification.replaceChillerRefrigerant?.useOpportunity ?? false;
      }
    });
  }

  setUseOpportunity() {
    this.modificationService.updateModificationEEM('replaceChillerRefrigerant', {
      useOpportunity: this.useOpportunity
    });
  }

  focusField(str: string) {
    this.processCoolingUiService.focusedFieldSignal.set(str);
  }
}
