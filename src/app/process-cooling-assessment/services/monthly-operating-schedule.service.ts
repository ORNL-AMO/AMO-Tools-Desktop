import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getMonthsMaxDays, MONTHS } from '../process-cooling-constants';
import { MonthlyOperatingSchedule } from '../../shared/models/process-cooling-assessment';

@Injectable()
export class MonthlyOperatingScheduleService {
  constructor(private fb: FormBuilder) {}
  monthNames: string[] = MONTHS;

  getMonthlyScheduleForm(monthlySchedule: MonthlyOperatingSchedule): FormGroup {
    const monthsMax = getMonthsMaxDays();
    const form: FormGroup = this.fb.group({
      months: this.fb.array(
        monthlySchedule.months.map((month, index) =>
          this.fb.group({
            days: [month.days, [Validators.required, Validators.min(0), Validators.max(monthsMax[index].days)]]
          })
        )),
      useMaxHours: [monthlySchedule.useMaxHours]
    });

    return form;
  }

  getMonthlyOperatingSchedule(formValue: MonthlyOperatingSchedule): MonthlyOperatingSchedule {
    return {
      months: formValue.months.map((month, index) => ({
        name: this.monthNames[index],
        days: month.days
      })),
      useMaxHours: formValue.useMaxHours,
      hoursOnPerMonth: formValue.months.map(month => month.days * 24)
    };
  }

}
