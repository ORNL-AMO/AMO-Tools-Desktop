import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { OperatingHours } from '../models/operations';

@Injectable()
export class OperatingHoursModalService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromObj(obj: OperatingHours): UntypedFormGroup {
    return this.formBuilder.group(
      {
        'weeksPerYear': [obj.weeksPerYear, [Validators.min(0), Validators.max(53), Validators.required]],
        'daysPerWeek': [obj.daysPerWeek, [Validators.min(0), Validators.max(7), Validators.required]],
        'hoursPerDay': [obj.hoursPerDay, [Validators.min(0), Validators.max(24), Validators.required]],
        'minutesPerHour': [obj.minutesPerHour, [Validators.min(0), Validators.max(60), Validators.required]],
        'secondsPerMinute': [obj.secondsPerMinute, [Validators.min(0), Validators.max(60), Validators.required]]
      }
    )
  }

  getObjectFromForm(form: UntypedFormGroup): OperatingHours {
    let opHours: OperatingHours = {
      weeksPerYear: form.controls.weeksPerYear.value,
      daysPerWeek: form.controls.daysPerWeek.value,
      hoursPerDay: form.controls.hoursPerDay.value,
      minutesPerHour: form.controls.minutesPerHour.value,
      secondsPerMinute: form.controls.secondsPerMinute.value,
    }
    opHours.hoursPerYear = this.calculateHoursPerYear(opHours);
    return opHours;
  }

  calculateHoursPerYear(opHours: OperatingHours): number {
    let hoursPerYear: number = opHours.daysPerWeek * opHours.hoursPerDay * (opHours.minutesPerHour / 60) * (opHours.secondsPerMinute / 60) * opHours.weeksPerYear;
    return Math.round(hoursPerYear);
  }
}
