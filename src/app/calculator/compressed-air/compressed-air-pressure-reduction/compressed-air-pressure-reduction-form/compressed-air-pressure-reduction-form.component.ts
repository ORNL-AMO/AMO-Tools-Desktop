import { Component, Output, EventEmitter, viewChild, ElementRef, input, inject, Signal, computed, effect, untracked, afterRenderEffect, DestroyRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirPressureReductionData, CompressedAirPressureReductionResult, CompressedAirPressureReductionResults } from '../../../../shared/models/standalone';
import { CompressedAirPressureReductionForm } from '../compressed-air-pressure-reduction.service';
import { CompressedAirPressureReductionService } from '../compressed-air-pressure-reduction.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-compressed-air-pressure-reduction-form',
  templateUrl: './compressed-air-pressure-reduction-form.component.html',
  styleUrls: ['./compressed-air-pressure-reduction-form.component.css'],
  standalone: false,
  host: { '(window:resize)': 'onResize($event)' }
})
export class CompressedAirPressureReductionFormComponent {
  isBaseline = input.required<boolean>();
  index = input.required<number>();
  settings = input.required<Settings>();

  protected compressedAirPressureReductionService: CompressedAirPressureReductionService = inject(CompressedAirPressureReductionService);

  focusedPanel: Signal<'baseline' | 'modification'> = toSignal(this.compressedAirPressureReductionService.focusedPanel);
  results: Signal<CompressedAirPressureReductionResults> = toSignal(this.compressedAirPressureReductionService.results);
  baselineData: Signal<Array<CompressedAirPressureReductionData>> = toSignal(this.compressedAirPressureReductionService.baselineData);
  modificationData: Signal<Array<CompressedAirPressureReductionData>> = toSignal(this.compressedAirPressureReductionService.modificationData);

  idString: Signal<string> = computed(() => {
    if (this.isBaseline()) {
      return 'baseline_';
    } else {
      return 'modification_';
    }
  });
  individualResults: Signal<CompressedAirPressureReductionResult> = computed(() => {
    const isBaseline = this.isBaseline();
    const results = this.results();
    if (results) {
      if (isBaseline) {
        return results.baselineResults;
      } else {
        return results.modificationResults;
      }
    }
  });
  formElement = viewChild<ElementRef>('formElement');

  formWidth: number;
  showOperatingHoursModal: boolean;

  form: CompressedAirPressureReductionForm;
  isEditingName: boolean = false;

  private destroyRef = inject(DestroyRef);
  private formReset$ = new Subject<void>();

  constructor() {
    // Rebuild form when isBaseline or index changes; read data without tracking full array reactivity
    effect(() => {
      const isBaseline = this.isBaseline();
      const index = this.index();
      const item = untracked(() => {
        const data = isBaseline ? this.baselineData() : this.modificationData();
        return data?.[index];
      });
      if (item) {
        console.log('Initializing form for ' + (isBaseline ? 'baseline' : 'modification') + ' index ' + index);
        this.formReset$.next();
        this.form = this.compressedAirPressureReductionService.getFormFromObj(item, index, isBaseline);
        this.form.valueChanges.pipe(
          debounceTime(100),
          takeUntil(this.formReset$),
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => {
          console.log('Form value changed for ' + (isBaseline ? 'baseline' : 'modification') + ' index ' + index);
          if (this.form.valid) {
            this.saveChanges();
          }
        });
      }
    });

    // Sync locked baseline fields into the modification form when baseline data changes
    effect(() => {
      if (this.isBaseline()) return;
      const index = this.index();
      const baselineItem = this.baselineData()?.[index];
      if (!baselineItem) return;
      const { compressorPower, pressure, powerType, atmosphericPressure, pressureRated } = baselineItem;
      untracked(() => {
        this.form?.patchValue(
          { compressorPower, pressure, powerType: powerType ?? '', atmosphericPressure, pressureRated },
          { emitEvent: false }
        );
      });
    });

    afterRenderEffect(() => {
      this.setOpHoursModalWidth();
    });
  }

  saveChanges() {
    console.log('Saving changes for ' + (this.isBaseline() ? 'baseline' : 'modification') + ' index ' + this.index());
    const isBaseline = this.isBaseline();
    const index = this.index();
    if (isBaseline) {
      let baselineData = this.baselineData();
      let obj = baselineData[index];
      obj = this.compressedAirPressureReductionService.updateObjectFromForm(this.form, obj);
      baselineData[index] = obj;
      console.log('Updated baseline data:', baselineData);
      this.compressedAirPressureReductionService.baselineData.next({...baselineData});
    } else {
      let modificationData = this.modificationData();
      let obj = modificationData[index];
      obj = this.compressedAirPressureReductionService.updateObjectFromForm(this.form, obj);
      modificationData[index] = obj;
      console.log('Updated modification data:', modificationData);
      this.compressedAirPressureReductionService.modificationData.next({...modificationData});
    }
  }

  // No reason to remove equipment unless we allow for multiple baseline/modification entries, 
  // but leaving this here for now in case we want to add that functionality later
  // removeBaselineEquipment() {
  //   let modificationData = this.modificationData();
  //   if (modificationData.length > 0) {
  //     modificationData.splice(this.index(), 1);
  //     this.compressedAirPressureReductionService.modificationData.next(modificationData);
  //   }
  //   let baselineData = this.baselineData();
  //   baselineData.splice(this.index(), 1);
  //   this.compressedAirPressureReductionService.baselineData.next(baselineData);
  // }

  editEquipmentName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
  }

  focusField(str: string) {
    this.compressedAirPressureReductionService.focusedField.next(str);
  }

  focusOut() {
    this.compressedAirPressureReductionService.focusedField.next(null);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.compressedAirPressureReductionService.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.closeOperatingHoursModal();
  }

  onResize(_event) {
    this.setOpHoursModalWidth();
  }

  setOpHoursModalWidth() {
    const el = this.formElement();
    if (el?.nativeElement.clientWidth) {
      this.formWidth = el.nativeElement.clientWidth;
    }
  }
}
