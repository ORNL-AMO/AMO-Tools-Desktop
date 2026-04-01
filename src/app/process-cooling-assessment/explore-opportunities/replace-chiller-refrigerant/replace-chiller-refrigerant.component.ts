import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl } from '@angular/forms';
import { ChillerInventoryItem, Modification } from '../../../shared/models/process-cooling-assessment';
import { EEM_LABELS, Refrigerants, getRefrigerantTypes } from '../../constants/process-cooling-constants';
import { ChillerInventoryService } from '../../services/chiller-inventory.service';
import { ExploreOpportunitiesFormService, ReplaceChillerRefrigerantForm } from '../../services/explore-opportunities-form.service';
import { ModificationService } from '../../services/modification.service';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-assessment.service';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';

@Component({
  selector: 'app-replace-chiller-refrigerant',
  standalone: false,
  templateUrl: './replace-chiller-refrigerant.component.html',
  styleUrl: './replace-chiller-refrigerant.component.css'
})
export class ReplaceChillerRefrigerantComponent implements OnInit {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private modificationService = inject(ModificationService);
  private processCoolingUiService = inject(ProcessCoolingUiService);
  private chillerInventoryService = inject(ChillerInventoryService);
  private exploreOpportunitiesFormService = inject(ExploreOpportunitiesFormService);
  private destroyRef = inject(DestroyRef);

  EEM_LABELS = EEM_LABELS;
  Refrigerants = Refrigerants;
  refrigerantTypes = getRefrigerantTypes();

  useOpportunity: boolean = false;
  selectedChiller: ChillerInventoryItem;
  form: FormGroup<ReplaceChillerRefrigerantForm>;

  inventoryTableView = {
    parent: 'eem-modification',
    columns: {
      refrigerantType: true,
      proposedRefrigerantType: true
    }
  };

  ngOnInit(): void {
    this.form = this.exploreOpportunitiesFormService.getReplaceChillerRefrigerantForm(null);
    this.observeFormChanges();

    this.modificationService.selectedModification$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((modification: Modification) => {
      if (modification) {
        this.useOpportunity = modification.replaceChillerRefrigerant?.useOpportunity ?? false;
      }
    });

    this.chillerInventoryService.selectedChiller$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((chiller: ChillerInventoryItem) => {
      this.selectedChiller = chiller;
      this.form.patchValue({ proposedRefrigerantType: chiller?.proposedRefrigerantType ?? null }, { emitEvent: false });
    });
  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      if (!this.selectedChiller) return;
      const proposedRefrigerantType = this.form.getRawValue().proposedRefrigerantType;
      const updatedChiller: ChillerInventoryItem = { ...this.selectedChiller, proposedRefrigerantType };
      this.processCoolingAssessmentService.updateAssessmentChiller(updatedChiller);
      this.setUseOpportunity();
    });
  }

  get proposedRefrigerantType() {
    return this.form.get('proposedRefrigerantType') as FormControl;
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
