import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DayScheduleData, WeeklyOperatingSchedule } from '../../shared/models/process-cooling-assessment';
import { getHoursOnMonToSun } from '../process-cooling-constants';

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
    const hoursOnMonToSun = getHoursOnMonToSun(formValue.days);

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

