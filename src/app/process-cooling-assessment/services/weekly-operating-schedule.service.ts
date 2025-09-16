import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Injectable()
export class WeeklyOperatingScheduleService {
  constructor(private fb: FormBuilder) {}


  getWeeklyScheduleForm(initial?: Array<WeeklyScheduleData>): FormGroup<WeeklyScheduleForm> {
    const dayData = initial ?? this.getDefaultDays();
    const dayGroups = dayData.map(day =>
      this.fb.group({
        off: [day.off],
        start: [day.start],
        end: [day.end],
        allDay: [day.allDay]
      })
    );
    const days = this.fb.array(dayGroups);
    return this.fb.group({ days }) as FormGroup<WeeklyScheduleForm>;
  }


  getWeeklySchedule(formValue: Array<WeeklyScheduleData>) {
    return formValue.map(day => ({
      ...day,
      start: Number(day.start),
      end: Number(day.end)
    }));
  }

  getWeeklyOperatingSchedule(formValue: Array<WeeklyScheduleData>): number[] {
    const hoursOnPerDay = formValue.map(day => {
      if (day.off) {
        return 0;
      } else if (day.allDay) {
        return 24;
      } else {
        return Math.max(0, day.end - day.start);
      }
    });

    return hoursOnPerDay;
  }

  getDefaultDays(): Array<WeeklyScheduleData> {
    return [
      { off: false, start: 8, end: 17, allDay: false },
      { off: false, start: 8, end: 17, allDay: false },
      { off: false, start: 8, end: 17, allDay: false },
      { off: false, start: 8, end: 17, allDay: false },
      { off: false, start: 8, end: 17, allDay: false },
      { off: true, start: 8, end: 17, allDay: false },
      { off: true, start: 8, end: 17, allDay: false }
    ];
  }

}

export interface WeeklyScheduleForm {
  days: FormArray<FormGroup<DayScheduleForm>>;
}

export interface DayScheduleForm {
  off: FormControl<boolean>;
  start: FormControl<number>;
  end: FormControl<number>;
  allDay: FormControl<boolean>;
}


export interface WeeklyScheduleData {
  off: boolean;
  start: number;
  end: number;
  allDay: boolean;
}
