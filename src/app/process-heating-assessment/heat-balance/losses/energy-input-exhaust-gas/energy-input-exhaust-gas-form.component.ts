import { DialogRef } from '@angular/cdk/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Injector, input } from '@angular/core';
import { FlueGasCalculatorDialogComponent, FlueGasCalculatorDialogData } from '../flue-gas/flue-gas-calculator-dialog.component';
import { ModalDialogService } from '../../../../shared/modal-dialog.service';
import { generateFormControlIds, roundVal } from '../../../../shared/helperFunctions';
import { Settings } from '../../../../shared/models/settings';
import { EnergyInputExhaustGasForm } from './energy-input-exhaust-gas-form.service';
import { EnergyInputExhaustGasItem } from './energy-input-exhaust-gas.service';

@Component({
  selector: 'app-energy-input-exhaust-gas-form',
  standalone: false,
  templateUrl: './energy-input-exhaust-gas-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnergyInputExhaustGasFormComponent {
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly item = input.required<EnergyInputExhaustGasItem>();
  readonly settings = input.required<Settings>();

  readonly form = computed(() => this.item().form as EnergyInputExhaustGasForm);
  readonly controlIds = computed(() => generateFormControlIds(this.form().controls));

  openFlueGasModal(): void {
    const data: FlueGasCalculatorDialogData = { settings: this.settings() };
    const dialogRef: DialogRef<number, FlueGasCalculatorDialogComponent> = this.modalDialogService.openModal<number, FlueGasCalculatorDialogData, FlueGasCalculatorDialogComponent>(
      FlueGasCalculatorDialogComponent, { data, width: '80vw' }, this.injector,
    );
    dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((availableHeat) => {
      if (availableHeat !== undefined) {
        this.form().patchValue({ availableHeat: roundVal(availableHeat, 1) });
      }
    });
  }
}
