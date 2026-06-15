import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { OperatingHours } from '../models/operations';
import { OperatingHoursModalService } from '../operating-hours-modal/operating-hours-modal.service';

export interface OperatingHoursDialogData {
  operatingHours: OperatingHours;
  showMinutesSeconds: boolean;
}

@Component({
  selector: 'app-operating-hours',
  standalone: false,
  templateUrl: './operating-hours.component.html',
  styleUrl: './operating-hours.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperatingHoursComponent implements OnInit {
  private readonly data: OperatingHoursDialogData = inject(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<OperatingHours>>(DialogRef<OperatingHours>);
  private readonly operatingHoursModalService = inject(OperatingHoursModalService);

  readonly showMinutesSeconds: boolean = this.data.showMinutesSeconds;
  operatingHours: OperatingHours;
  operatingHoursForm: UntypedFormGroup;

  ngOnInit(): void {
    const src = this.data.operatingHours ?? {};
    this.operatingHours = {
      weeksPerYear:    src.weeksPerYear    ?? 52.14,
      daysPerWeek:     src.daysPerWeek     ?? 7,
      hoursPerDay:     src.hoursPerDay     ?? 24,
      minutesPerHour:  src.minutesPerHour  ?? 60,
      secondsPerMinute: src.secondsPerMinute ?? 60,
      hoursPerYear:    src.hoursPerYear    ?? 8760,
    };

    this.operatingHoursForm = this.operatingHoursModalService.getFormFromObj(this.operatingHours);
    this.calculateHrsPerYear();
  }

  calculateHrsPerYear(): void {
    this.operatingHours = this.operatingHoursModalService.getObjectFromForm(this.operatingHoursForm);
  }

  addOne(control: AbstractControl): void {
    control.patchValue(control.value + 1);
    this.calculateHrsPerYear();
  }

  subtractOne(control: AbstractControl): void {
    control.patchValue(control.value - 1);
    this.calculateHrsPerYear();
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close(this.operatingHours);
  }
}
