import {
  Component, viewChild, ElementRef, input, inject, Signal, computed,
  effect, untracked, afterRenderEffect, DestroyRef
} from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { CompressedAirReductionData, CompressedAirReductionResult, CompressedAirReductionResults } from '../../../../shared/models/standalone';
import { CompressedAirReductionService, CompressedAirReductionForm } from '../compressed-air-reduction.service';
import { ConvertCompressedAirReductionService } from '../convert-compressed-air-reduction.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-compressed-air-reduction-form',
  templateUrl: './compressed-air-reduction-form.component.html',
  styleUrls: ['./compressed-air-reduction-form.component.css'],
  standalone: false,
  host: { '(window:resize)': 'onResize($event)' }
})
export class CompressedAirReductionFormComponent {
  // Required signal inputs — the parent passes these and the form reads service state directly
  isBaseline = input.required<boolean>();
  index = input.required<number>();
  settings = input.required<Settings>();

  protected compressedAirReductionService: CompressedAirReductionService = inject(CompressedAirReductionService);
  private convertCompressedAirReductionService: ConvertCompressedAirReductionService = inject(ConvertCompressedAirReductionService);
  private destroyRef = inject(DestroyRef);
  private formReset$ = new Subject<void>();

  // Reactive service state as signals for use in the template and effects
  focusedPanel: Signal<'baseline' | 'modification'> = toSignal(this.compressedAirReductionService.focusedPanel);
  results: Signal<CompressedAirReductionResults> = toSignal(this.compressedAirReductionService.results);
  baselineData: Signal<Array<CompressedAirReductionData>> = toSignal(this.compressedAirReductionService.baselineData);
  modificationData: Signal<Array<CompressedAirReductionData>> = toSignal(this.compressedAirReductionService.modificationData);

  // Unique id prefix for form field labels to avoid duplicate ids when multiple forms are rendered
  idString: Signal<string> = computed(() => this.isBaseline() ? 'baseline_' + this.index() : 'modification_' + this.index());

  // Per-equipment result extracted from the aggregate results array for inline display in the form
  individualResults: Signal<CompressedAirReductionResult> = computed(() => {
    const results = this.results();
    const index = this.index();
    if (!results) return undefined;
    return this.isBaseline()
      ? results.baselineResults?.[index]
      : results.modificationResults?.[index];
  });

  formElement = viewChild<ElementRef>('formElement');
  formWidth: number;
  showOperatingHoursModal: boolean = false;

  form: CompressedAirReductionForm;
  isEditingName: boolean = false;

  // Local state for compressor control UI — determines whether custom input fields are shown
  compressorCustomControl: boolean = false;
  compressorCustomSpecificPower: boolean = false;

  // Lookup tables used by the template for select options
  readonly measurementOptions = [
    { value: 0, name: 'Flow Meter' },
    { value: 1, name: 'Bag Method' },
    { value: 2, name: 'Orifice / Pressure Method' },
    { value: 3, name: 'Offsheet / Other Method' }
  ];
  readonly utilityTypes = [
    { value: 0, name: 'Compressed Air' },
    { value: 1, name: 'Electricity' }
  ];
  readonly nozzleTypes = [
    { value: 0, name: '1.0 mm nozzle' },
    { value: 1, name: '1.5 mm nozzle' },
    { value: 2, name: '1/4" pipe, open' },
    { value: 3, name: '1/4" tubing' },
    { value: 4, name: '1/8" pipe, open' },
    { value: 5, name: '1/8" tubing' },
    { value: 6, name: '2.0 mm nozzle' },
    { value: 7, name: '2.5 mm nozzle' },
    { value: 8, name: '3/8" pipe, open' },
    { value: 9, name: '3/8" tubing' },
    { value: 10, name: '5/16" tubing' },
    { value: 11, name: 'Air Knife' }
  ];
  // Compressor control options with associated fractional adjustment values (NREL protocol)
  readonly compressorControls = [
    { value: 100, name: 'Screw Compressor - Inlet Modulation', adjustment: 30 },
    { value: 101, name: 'Screw Compressor - Variable Displacement', adjustment: 60 },
    { value: 102, name: 'Screw Compressor – Variable Speed Drives', adjustment: 97 },
    { value: 103, name: 'Oil Injected Screw - Load/Unload (short cycle)', adjustment: 48 },
    { value: 104, name: 'Oil Injected Screw - Load/Unload (2+ minutes cycle)', adjustment: 68 },
    { value: 105, name: 'Oil Free Screw - Load/Unload', adjustment: 73 },
    { value: 106, name: 'Reciprocating Compressor - Load/Unload', adjustment: 74 },
    { value: 107, name: 'Reciprocating Compressor - On/Off', adjustment: 100 },
    { value: 108, name: 'Centrifugal Compressor – In blowoff (Venting)', adjustment: 0 },
    { value: 109, name: 'Centrifugal – Modulating (IBV) in throttle range (Non-Venting)', adjustment: 67 },
    { value: 110, name: 'Centrifugal– Modulating (IGV) in throttle range (Non-Venting)', adjustment: 86 },
    { value: 8, name: 'Custom', adjustment: 0 }
  ];
  readonly compressorSpecificPowerControls = [
    { value: 0, name: 'Reciprocating', specificPower: 0.16 },
    { value: 1, name: 'Rotary Screw (Lubricant-Injected)', specificPower: 0.20 },
    { value: 2, name: 'Rotary Screw (Lubricant-Free)', specificPower: 0.23 },
    { value: 3, name: 'Centrifugal', specificPower: 0.21 },
    { value: 4, name: 'Custom', specificPower: 0.0 }
  ];

  constructor() {
    // Rebuild the reactive form whenever the item being displayed changes (isBaseline or index).
    // Reading the data array with untracked() avoids re-running this effect on every save.
    effect(() => {
      const isBaseline = this.isBaseline();
      const index = this.index();
      const item = untracked(() => {
        const data = isBaseline ? this.baselineData() : this.modificationData();
        return data?.[index];
      });
      if (item) {
        // Migrate legacy nozzle type 12 (removed in older versions) to the Air Knife entry
        if (item.pressureMethodData.nozzleType === 12) {
          item.pressureMethodData.nozzleType = 11;
        }
        this.compressorCustomControl = item.compressorElectricityData.compressorControl === 8;
        this.compressorCustomSpecificPower = item.compressorElectricityData.compressorSpecificPowerControl === 4;

        this.formReset$.next(); // unsubscribe the previous valueChanges pipe
        this.form = this.compressedAirReductionService.getFormFromObj(item, index, isBaseline);

        // Auto-save on valid changes with a small debounce to batch rapid keystrokes
        this.form.valueChanges.pipe(
          debounceTime(100),
          takeUntil(this.formReset$),
          takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => {
          if (this.form.valid) {
            this.saveChanges();
          }
        });
      }
    });

    // Sync locked baseline compressor fields into the modification form.
    // Modification forms show the baseline compressor values as read-only so the user
    // understands which compressor is being used, but the actual calculation reads from baseline.
    effect(() => {
      if (this.isBaseline()) return;
      const index = this.index();
      const baselineItem = this.baselineData()?.[index];
      if (!baselineItem) return;
      const { compressorControl, compressorControlAdjustment, compressorSpecificPowerControl, compressorSpecificPower } = baselineItem.compressorElectricityData;
      // untracked() prevents this patch from triggering the valueChanges pipeline reactively
      untracked(() => {
        this.form?.patchValue(
          { compressorControl, compressorControlAdjustment, compressorSpecificPowerControl, compressorSpecificPower },
          { emitEvent: false }
        );
        this.compressorCustomControl = compressorControl === 8;
        this.compressorCustomSpecificPower = compressorSpecificPowerControl === 4;
      });
    });

    afterRenderEffect(() => {
      this.setOpHoursModalWidth();
    });
  }

  // Persist form values back into the service BehaviorSubject.
  // Spreading [...data] creates a new array reference so Angular change detection fires.
  saveChanges() {
    const isBaseline = this.isBaseline();
    const index = this.index();
    if (isBaseline) {
      const baselineData = this.baselineData();
      baselineData[index] = this.compressedAirReductionService.updateObjectFromForm(this.form, baselineData[index]);
      this.compressedAirReductionService.baselineData.next([...baselineData]);
    } else {
      const modificationData = this.modificationData();
      modificationData[index] = this.compressedAirReductionService.updateObjectFromForm(this.form, modificationData[index]);
      this.compressedAirReductionService.modificationData.next([...modificationData]);
    }
  }

  removeEquipment() {
    // Delegates removal to the host component which manages both arrays in sync
    if (this.isBaseline()) {
      this.compressedAirReductionService.baselineData.next(
        this.baselineData().filter((_, i) => i !== this.index())
      );
      // Also remove the paired modification item if one exists
      const modData = this.modificationData();
      if (modData.length > 1 && modData[this.index()]) {
        this.compressedAirReductionService.modificationData.next(
          modData.filter((_, i) => i !== this.index())
        );
      }
    } else {
      this.compressedAirReductionService.modificationData.next(
        this.modificationData().filter((_, i) => i !== this.index())
      );
    }
  }

  // --- Measurement method / utility type change handlers ---
  // These must update validators (which depend on the active method/type) then trigger save.

  changeMeasurementMethod() {
    this.compressedAirReductionService.setValidators(this.form);
    if (this.form.valid) { this.saveChanges(); }
  }

  changeUtilityType() {
    this.compressedAirReductionService.setValidators(this.form);
    if (this.form.valid) { this.saveChanges(); }
  }

  // --- Compressor control helpers ---

  changeCompressorControl() {
    const controlValue = this.form.controls.compressorControl.value;
    if (controlValue !== 8) {
      // Preset control — look up the adjustment percentage and apply it
      this.compressorCustomControl = false;
      const control = this.compressorControls.find(c => c.value === controlValue);
      this.form.patchValue({ compressorControlAdjustment: control?.adjustment ?? 0 });
    } else {
      // Custom control — show the editable adjustment input
      this.compressorCustomControl = true;
    }
    this.compressedAirReductionService.setValidators(this.form);
    if (this.form.valid) { this.saveChanges(); }
  }

  changeCompressorType() {
    const typeValue = this.form.controls.compressorSpecificPowerControl.value;
    if (typeValue !== 4) {
      // Preset type — look up the specific power and apply it (with unit conversion if metric)
      this.compressorCustomSpecificPower = false;
      const specificPower = this.getSpecificPower();
      this.form.patchValue({ compressorSpecificPower: specificPower });
    } else {
      // Custom type — show the editable specific power input
      this.compressorCustomSpecificPower = true;
    }
    this.compressedAirReductionService.setValidators(this.form);
    if (this.form.valid) { this.saveChanges(); }
  }

  private getSpecificPower(): number {
    const typeControl = this.compressorSpecificPowerControls[this.form.controls.compressorSpecificPowerControl.value];
    let specificPower = typeControl?.specificPower ?? 0;
    if (this.settings().unitsOfMeasure !== 'Imperial') {
      specificPower = this.convertCompressedAirReductionService.convertSpecificPowerToMetric(specificPower);
      specificPower = this.convertCompressedAirReductionService.roundVal(specificPower);
    } else {
      specificPower = specificPower * 100;
    }
    return specificPower;
  }

  // --- UI helpers ---

  editEquipmentName() { this.isEditingName = true; }
  doneEditingName() { this.isEditingName = false; }

  focusField(str: string) {
    this.compressedAirReductionService.focusedField.next(str);
  }

  focusOut() {
    this.compressedAirReductionService.focusedField.next(null);
  }

  openOperatingHoursModal() { this.showOperatingHoursModal = true; }
  closeOperatingHoursModal() { this.showOperatingHoursModal = false; }

  updateOperatingHours(oppHours: OperatingHours) {
    this.compressedAirReductionService.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.closeOperatingHoursModal();
  }

  onResize(_event: unknown) { this.setOpHoursModalWidth(); }

  setOpHoursModalWidth() {
    const el = this.formElement();
    if (el?.nativeElement.clientWidth) {
      this.formWidth = el.nativeElement.clientWidth;
    }
  }
}
