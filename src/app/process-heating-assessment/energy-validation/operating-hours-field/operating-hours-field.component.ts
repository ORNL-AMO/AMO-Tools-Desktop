import { ChangeDetectionStrategy, Component, DestroyRef, inject, Injector, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DialogRef } from '@angular/cdk/dialog';
import { FormControl } from '@angular/forms';
import { ModalDialogService } from '../../../shared/modal-dialog.service';
import { OperatingHours } from '../../../shared/models/operations';
import { Settings } from '../../../shared/models/settings';
import { OperatingHoursComponent, OperatingHoursDialogData } from '../../../shared/operating-hours/operating-hours.component';
import { ProcessHeatingUiService } from '../../services/process-heating-ui.service';

/** Annual operating hours input with the operating hours calculator, shared by each Metered and Designed Energy source. */
@Component({
  selector: 'app-energy-operating-hours-field',
  standalone: false,
  templateUrl: './operating-hours-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperatingHoursFieldComponent {
  readonly operatingHours = input.required<FormControl<number | null>>();
  readonly operatingHoursCalc = input.required<FormControl<OperatingHours | undefined>>();
  readonly inputId = input.required<string>();
  readonly settings = input.required<Settings>();

  private readonly uiService = inject(ProcessHeatingUiService);
  private readonly modalDialogService = inject(ModalDialogService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  openOperatingHoursModal(): void {
    const data: OperatingHoursDialogData = { operatingHours: this.operatingHoursCalc().value, showMinutesSeconds: false };
    const dialogRef: DialogRef<OperatingHours, OperatingHoursComponent> = this.modalDialogService.openModal<OperatingHours, OperatingHoursDialogData, OperatingHoursComponent>(
      OperatingHoursComponent, { data }, this.injector,
    );
    dialogRef.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(calculated => {
      if (calculated) {
        this.operatingHoursCalc().setValue(calculated, { emitEvent: false });
        this.operatingHours().setValue(calculated.hoursPerYear);
      }
    });
  }

  focusField(): void {
    this.uiService.focusedFieldSignal.set('operatingHours');
  }
}
