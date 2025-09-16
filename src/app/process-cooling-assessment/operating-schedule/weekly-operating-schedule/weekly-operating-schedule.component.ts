

import { Component, OnInit, inject, DestroyRef, Signal } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { WeeklyOperatingScheduleService, WeeklyScheduleForm } from '../../services/weekly-operating-schedule.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';
import { ProcessCoolingAssessment } from '../../../shared/models/process-cooling-assessment';
import { DAY_LABELS, HOUR_OPTIONS } from '../../process-cooling-constants';

@Component({
  selector: 'app-weekly-operating-schedule',
  templateUrl: './weekly-operating-schedule.component.html',
  styleUrls: ['./weekly-operating-schedule.component.css'],
  standalone: false,
  providers: [WeeklyOperatingScheduleService]
})
export class WeeklyOperatingScheduleComponent implements OnInit {
  private processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  weeklyOperatingScheduleService = inject(WeeklyOperatingScheduleService);
  destroyRef = inject(DestroyRef);

  processCooling: Signal<ProcessCoolingAssessment> = this.processCoolingAssessmentService.processCoolingSignal;
  DAY_LABELS = DAY_LABELS;
  HOUR_OPTIONS = HOUR_OPTIONS;
  
  useSameSchedule = false;
  form: FormGroup<WeeklyScheduleForm>;

  ngOnInit() {
    const weeklySchedule = this.processCooling().weeklyOperatingSchedule ? this.processCooling().weeklyOperatingSchedule : this.weeklyOperatingScheduleService.getDefaultDays();
    this.form = this.weeklyOperatingScheduleService.getWeeklyScheduleForm(weeklySchedule);
    this.updateDayGroups();
    this.observeFormChanges();
  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      if (this.useSameSchedule) {
        this.setSameSchedule();
      }
      this.updateDayGroups();
      this.updateWeeklyOperatingSchedule();
    });
  }

  updateDayGroups() {
    for (let dayGroup of this.daysFormArray.controls) {
      this.updateDayControls(dayGroup as FormGroup);
    }
  }

  onUseSameScheduleChange() {
    this.useSameSchedule = !this.useSameSchedule;
    if (this.useSameSchedule) {
      this.setSameSchedule();
      // * keep Monday enabled
      this.getDayGroup(0).enable({ emitEvent: false });
    } else {
      for (let dayGroup of this.daysFormArray.controls) {
        dayGroup.enable({ emitEvent: false });
      }
    }
    this.updateWeeklyOperatingSchedule();
  }
  
  setSameSchedule() {
     const monday = this.getDayGroup(0).getRawValue();
      for (let dayGroup of this.daysFormArray.controls) {
        dayGroup.patchValue(monday, { emitEvent: false });
        dayGroup.disable({ emitEvent: false });
      }
  }

  
  updateWeeklyOperatingSchedule() {
    const weeklySchedule = this.weeklyOperatingScheduleService.getWeeklySchedule(this.form.getRawValue().days);
    this.processCoolingAssessmentService.updateWeeklySchedule(weeklySchedule);
    console.log('weeklySchedule:', weeklySchedule);
    console.log('form:', this.form.getRawValue());
  }


  onOffToggle(dayIndex: number) {
    this.updateDayControls(this.getDayGroup(dayIndex));
  }

  updateDayControls(dayGroup: FormGroup) {
    const isOff = dayGroup.get('off')?.value;
    const isAllDay = dayGroup.get('allDay')?.value;

    if (isOff) {
      dayGroup.get('start')?.disable({ emitEvent: false });
      dayGroup.get('end')?.disable({ emitEvent: false });
      dayGroup.get('allDay')?.disable({ emitEvent: false });
    } else {
      dayGroup.get('allDay')?.enable({ emitEvent: false });
      if (isAllDay) {
        dayGroup.get('start')?.disable({ emitEvent: false });
        dayGroup.get('end')?.disable({ emitEvent: false });
      } else {
        dayGroup.get('start')?.enable({ emitEvent: false });
        dayGroup.get('end')?.enable({ emitEvent: false });
      }
    }
  }

  getScheduleType(dayIndex: number): 'off' | 'allDay' | 'custom' {
    const dayGroup = this.getDayGroup(dayIndex);
    if (dayGroup.get('off')?.value) {
      return 'off';
    }
    if (dayGroup.get('allDay')?.value) {
      return 'allDay';
    }
    return 'custom';
  }

  onScheduleTypeChange(scheduleType: string, dayIndex: number) {
    const dayGroup = this.getDayGroup(dayIndex);
    if (scheduleType === 'off') {
      dayGroup.get('off')?.setValue(true, { emitEvent: true });
      dayGroup.get('allDay')?.setValue(false, { emitEvent: true });
    } else if (scheduleType === 'allDay') {
      dayGroup.get('off')?.setValue(false, { emitEvent: true });
      dayGroup.get('allDay')?.setValue(true, { emitEvent: true });
    } else {
      dayGroup.get('off')?.setValue(false, { emitEvent: true });
      dayGroup.get('allDay')?.setValue(false, { emitEvent: true });
    }
    this.updateDayControls(dayGroup);
  }

  get daysFormArray(): FormArray {
    return this.form.get('days') as FormArray;
  }
  getDayGroup(dayIndex: number) {
    return this.daysFormArray.at(dayIndex) as FormGroup;
  }

}

