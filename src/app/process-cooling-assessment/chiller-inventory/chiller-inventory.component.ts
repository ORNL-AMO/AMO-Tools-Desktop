import { Component, OnInit, inject, DestroyRef, Signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { debounceTime, Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChillerInventoryItem, ProcessCoolingAssessment } from '../../shared/models/process-cooling-assessment';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-asessment.service';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { ChillerInventoryService } from '../services/chiller-inventory.service';

@Component({
  selector: 'app-chiller-inventory',
  standalone: false,
  templateUrl: './chiller-inventory.component.html',
  styleUrl: './chiller-inventory.component.css'
})
export class ChillerInventoryComponent implements OnInit {
  private processCoolingUiService = inject(ProcessCoolingUiService);
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private inventoryService = inject(ChillerInventoryService);
  private destroyRef = inject(DestroyRef);

  processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;
  form: UntypedFormGroup;
  showChillerModal = false;
  selectedChiller$: Observable<ChillerInventoryItem>;

  ngOnInit(): void {
    this.selectedChiller$ = this.inventoryService.selectedChiller$.pipe(
      tap((chiller) => {
        if (chiller) {
          this.form = this.inventoryService.getChillerForm(chiller);
          this.observeFormChanges();
        } else {
          this.inventoryService.setDefaultSelectedChiller(this.processCooling().inventory);
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  observeFormChanges() {
    if (!this.form) return;
    this.form.valueChanges.pipe(
      debounceTime(100),
      tap(() => {
        const updatedChiller: ChillerInventoryItem = this.inventoryService.getChiller(this.form.getRawValue(), this.inventoryService.selectedChillerValue);
        this.processCoolingAssessmentService.updateAssessmentChiller(updatedChiller);
        this.inventoryService.setSelectedChiller(updatedChiller);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  addInventoryItem() {
    let newChiller = this.processCoolingAssessmentService.addNewChillerToAssessment();
    this.inventoryService.setSelectedChiller(newChiller);
  }

  openChillerModal() {
    this.showChillerModal = true;
  }

  closeChillerModal() {
    this.showChillerModal = false;
  }

  focusField(str: string) {
    this.processCoolingUiService.focusedFieldSignal.set(str);
  }
}
