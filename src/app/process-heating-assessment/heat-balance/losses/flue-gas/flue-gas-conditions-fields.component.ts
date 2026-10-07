import { DialogRef } from '@angular/cdk/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, Injector, input } from '@angular/core';
import { roundVal } from '../../../../shared/helperFunctions';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { FlueGasMoistureDialogComponent, FlueGasMoistureDialogData } from '../../../../shared/flue-gas-moisture-modal/flue-gas-moisture-dialog/flue-gas-moisture-dialog.component';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasForm, OXYGEN_CALCULATION_METHODS, OxygenCalculationMethod } from './flue-gas-form.service';

/** Operating-condition fields shared by the By Volume and By Mass flue gas forms. */
@Component({
  selector: 'app-flue-gas-conditions-fields',
  standalone: false,
  templateUrl: './flue-gas-conditions-fields.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlueGasConditionsFieldsComponent {
  readonly form = input.required<FlueGasForm>();
  readonly settings = input.required<Settings>();
  readonly instanceId = input.required<string>();

  private readonly modalDialogService = inject(ModalDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly OxygenCalculationMethod = OxygenCalculationMethod;
  readonly calculationMethods = OXYGEN_CALCULATION_METHODS;

  /** Zeroes both O2 and excess air so only the newly selected method's input is entered. */
  changeOxygenCalculationMethod(): void {
    this.form().patchValue({ o2InFlueGas: 0, excessAirPercentage: 0 });
  }

  openMoistureModal(): void {
    const data: FlueGasMoistureDialogData = { settings: this.settings() };
    const dialogRef: DialogRef<number, FlueGasMoistureDialogComponent> = this.modalDialogService.openModal<number, FlueGasMoistureDialogData, FlueGasMoistureDialogComponent>(
      FlueGasMoistureDialogComponent, { data, width: '80vw' }, this.injector,
    );
    dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((moisture) => {
      if (moisture !== undefined) {
        this.form().patchValue({ moistureInAirCombustion: roundVal(moisture, 2) });
      }
    });
  }
}
