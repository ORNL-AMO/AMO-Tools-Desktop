import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DayScheduleData, WeeklyOperatingSchedule } from '../../shared/models/process-cooling-assessment';

@Injectable()
export class WeeklyOperatingScheduleService {
  constructor(private fb: FormBuilder) {}

  getWeeklyScheduleForm(scheduleData: WeeklyOperatingSchedule): FormGroup<WeeklyOperatingScheduleForm> {
    const dayData = scheduleData.days;
    const dayGroups = dayData.map(day =>
      this.fb.group({
        off: [day.off],
        start: [day.start],
        end: [day.end],
        allDay: [day.allDay]
      })
    );
    const days = this.fb.array(dayGroups);
    const formGroup: FormGroup<WeeklyOperatingScheduleForm> = this.fb.group({
      days,
      useSameSchedule: [scheduleData.useSameSchedule ?? false]
    });
    return formGroup;
  }

  getWeeklyOperatingSchedule(formValue: WeeklyOperatingSchedule): WeeklyOperatingSchedule {
    const hoursOnMonToSun = formValue.days.map(day => {
      if (day.off) {
        return 0;
      } else if (day.allDay) {
        return 24;
      } else {
        return Math.max(0, day.end - day.start);
      }
    });

    return {
      useSameSchedule: formValue.useSameSchedule,
      hoursOnMonToSun: hoursOnMonToSun,
      days: formValue.days.map(day => ({
        ...day,
        start: Number(day.start),
        end: Number(day.end),
      }) as DayScheduleData)
    };  
  }

  getDefaultScheduleData(): WeeklyOperatingSchedule {
    return {
      useSameSchedule: false,
      days: [
        { off: false, start: 8, end: 17, allDay: false },
        { off: false, start: 8, end: 17, allDay: false },
        { off: false, start: 8, end: 17, allDay: false },
        { off: false, start: 8, end: 17, allDay: false },
        { off: false, start: 8, end: 17, allDay: false },
        { off: true, start: 8, end: 17, allDay: false },
        { off: true, start: 8, end: 17, allDay: false }
      ],
    }
  }

  }

export interface WeeklyOperatingScheduleForm {
  useSameSchedule: FormControl<boolean>;
  days: FormArray<FormGroup<DayScheduleForm>>;
}

export interface DayScheduleForm {
  off: FormControl<boolean>;
  start: FormControl<number>;
  end: FormControl<number>;
  allDay: FormControl<boolean>;
}

