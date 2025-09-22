

import { Component, OnInit, inject, DestroyRef, Signal } from '@angular/core';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import { WeeklyOperatingScheduleService, WeeklyOperatingScheduleForm } from '../../services/weekly-operating-schedule.service';
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

  form: FormGroup<WeeklyOperatingScheduleForm>;

  ngOnInit() {
    const weeklySchedule = this.processCooling().weeklyOperatingSchedule ? this.processCooling().weeklyOperatingSchedule : this.weeklyOperatingScheduleService.getDefaultScheduleData();
    this.form = this.weeklyOperatingScheduleService.getWeeklyScheduleForm(weeklySchedule);
    this.updateDayGroups();
    this.observeFormChanges();
  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      if (this.useSameSchedule.value) {
        this.setSameSchedule();
      }
      this.updateDayGroups();
      this.updateWeeklyOperatingSchedule();
    });
  }

  updateDayGroups() {
    for (let dayGroup of this.daysFormArray.controls) {
      this.updateDaysControlStatus(dayGroup as FormGroup);
    }
  }

  onUseSameScheduleChange() {
    const monday = this.getDayGroup(0);
    if (this.useSameSchedule.value) {
      this.setSameSchedule();
      // * keep Monday enabled
      monday.enable({ emitEvent: false });
    } else {
      if (!monday.get('off').value && !monday.get('allDay').value) {
        for (let dayGroup of this.daysFormArray.controls) {
          dayGroup.enable({ emitEvent: false });
        }
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
    const weeklySchedule = this.weeklyOperatingScheduleService.getWeeklyOperatingSchedule(this.form.getRawValue());
    this.processCoolingAssessmentService.updateWeeklyOperatingSchedule(weeklySchedule);
  }

  updateDaysControlStatus(dayGroup: FormGroup) {
    const isOff = dayGroup.get('off').value;
    const isAllDay = dayGroup.get('allDay').value;

    if (isOff) {
      dayGroup.get('start').disable({ emitEvent: false });
      dayGroup.get('end').disable({ emitEvent: false });
      dayGroup.get('allDay').disable({ emitEvent: false });
    } else {
      dayGroup.get('allDay').enable({ emitEvent: false });
      if (isAllDay) {
        dayGroup.get('start').disable({ emitEvent: false });
        dayGroup.get('end').disable({ emitEvent: false });
      } else {
        dayGroup.get('start').enable({ emitEvent: false });
        dayGroup.get('end').enable({ emitEvent: false });
      }
    }
  }

  onScheduleTypeChange(scheduleType: string, dayIndex: number) {
    const dayGroup = this.getDayGroup(dayIndex);
    if (scheduleType === 'off') {
      dayGroup.get('off').setValue(true, { emitEvent: true });
      dayGroup.get('allDay').setValue(false, { emitEvent: true });

      dayGroup.get('start').setValue(0, { emitEvent: false });
      dayGroup.get('end').setValue(0, { emitEvent: false });
    } else if (scheduleType === 'allDay') {
      dayGroup.get('off').setValue(false, { emitEvent: true });
      dayGroup.get('allDay').setValue(true, { emitEvent: true });

      dayGroup.get('start').setValue(0, { emitEvent: false });
      dayGroup.get('end').setValue(24, { emitEvent: false });
    } else {
      dayGroup.get('off').setValue(false, { emitEvent: true });
      dayGroup.get('allDay').setValue(false, { emitEvent: true });
    }

    if (this.useSameSchedule.value) {
      this.setSameSchedule();
    }
    this.updateDaysControlStatus(dayGroup);
  }

  getScheduleType(dayIndex: number): 'off' | 'allDay' | 'custom' {
    const dayGroup = this.getDayGroup(dayIndex);
    if (dayGroup.get('off').value) {
      return 'off';
    }
    if (dayGroup.get('allDay').value) {
      return 'allDay';
    }
    return 'custom';
  }


  get daysFormArray(): FormArray {
    return this.form.get('days') as FormArray;
  }

  get useSameSchedule(): FormControl {
    return this.form.get('useSameSchedule') as FormControl;
  }

  getDayGroup(dayIndex: number) {
    return this.daysFormArray.at(dayIndex) as FormGroup;
  }

}

