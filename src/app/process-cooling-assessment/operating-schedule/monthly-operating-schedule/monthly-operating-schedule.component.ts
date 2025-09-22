import { Component, DestroyRef, inject, OnInit, Signal } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProcessCoolingAssessment } from '../../../shared/models/process-cooling-assessment';
import { MonthlyOperatingScheduleService } from '../../services/monthly-operating-schedule.service';


@Component({
  selector: 'app-monthly-operating-schedule',
  templateUrl: './monthly-operating-schedule.component.html',
  styleUrls: ['./monthly-operating-schedule.component.css'],
  standalone: false
})
export class MonthlyOperatingScheduleComponent implements OnInit {
  destroyRef = inject(DestroyRef);
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  private monthlyOperatingScheduleService = inject(MonthlyOperatingScheduleService);

  form: FormGroup;
  months = this.monthlyOperatingScheduleService.getMonthsMaxDays();
  processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;

  ngOnInit() {
    const monthlySchedule = this.processCooling().monthlyOperatingSchedule ? this.processCooling().monthlyOperatingSchedule : this.monthlyOperatingScheduleService.getDefaultScheduleData();
    this.form = this.monthlyOperatingScheduleService.getMonthlyScheduleForm(monthlySchedule);
    if (monthlySchedule.useMaxHours) {
      this.setAllToMaxAndDisable();
    }
    this.observeUseMaxHoursChange();
  }

  observeUseMaxHoursChange() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      if (this.form.getRawValue().useMaxHours) {
        this.setAllToMaxAndDisable();
      } else {
        this.enableAllMonths();
      }
      this.updateMonthlyOperatingSchedule();
    });
  }

  updateMonthlyOperatingSchedule() {
    const monthlySchedule = this.monthlyOperatingScheduleService.getMonthlyOperatingSchedule(this.form.getRawValue());
    this.processCoolingAssessmentService.updateMonthlyOperatingSchedule(monthlySchedule);
  }

  get useMaxHours(): FormControl {
    return this.form.get('useMaxHours') as FormControl;
  }

  setAllToMaxAndDisable() {
    this.months.forEach((month, i) => {
      const control = this.getMonthControl(i);
      control.setValue(month.days, { emitEvent: false });
      control.disable({ emitEvent: false });
    });
  }

  enableAllMonths() {
    this.months.forEach((_, i) => {
      const control = this.getMonthControl(i);
      control.enable({ emitEvent: false });
    });
  }

  disableAllMonths() {
    this.months.forEach((_, i) => {
      const control = this.getMonthControl(i);
      control.disable({ emitEvent: false });
    });
  }

  get monthsFormArray(): FormArray {
    return this.form.get('months') as FormArray;
  }

  getMonthControl(index: number) {
    return this.monthsFormArray.at(index).get('days') as FormControl;
  }

  getMonthError(index: number): string | null {
    const control = this.getMonthControl(index);
    if (control?.hasError('required')) {
      return 'Value required';
    }
    if (control?.hasError('min')) {
      return 'Value cannot be negative';
    }
    if (control?.hasError('max')) {
      return `Value cannot exceed ${this.months[index].days}`;
    }
    return null;
  }
}
