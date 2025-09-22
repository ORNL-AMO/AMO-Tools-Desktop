import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MONTHS } from '../process-cooling-constants';
import { MonthlyOperatingSchedule } from '../../shared/models/process-cooling-assessment';

@Injectable()
export class MonthlyOperatingScheduleService {
  constructor(private fb: FormBuilder) {}
  monthNames: string[] = MONTHS;

  getMonthsMaxDays() {
    return [
      { name: 'January', days: 31 },
      // * Leap year max
      { name: 'February', days: 29 }, 
      { name: 'March', days: 31 },
      { name: 'April', days: 30 },
      { name: 'May', days: 31 },
      { name: 'June', days: 30 },
      { name: 'July', days: 31 },
      { name: 'August', days: 31 },
      { name: 'September', days: 30 },
      { name: 'October', days: 31 },
      { name: 'November', days: 30 },
      { name: 'December', days: 31 }
    ];
  }

  getMonthlyScheduleForm(monthlySchedule: MonthlyOperatingSchedule): FormGroup {
    const monthsMax = this.getMonthsMaxDays();
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

  getDefaultScheduleData(): MonthlyOperatingSchedule {
    return {
      months: this.getMonthsMaxDays(),
      useMaxHours: false
    };
  }
}
