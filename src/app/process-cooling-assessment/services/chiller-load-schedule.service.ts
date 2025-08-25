import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChillerInventoryItem } from '../../shared/models/process-cooling-assessment';

@Injectable()
export class ChillerLoadScheduleService {

  constructor(private fb: FormBuilder) { }

  getLoadScheduleForm(chiller: ChillerInventoryItem): FormGroup<LoadForm> {
    const form = this.fb.group({
      loadScheduleAllMonths: this.createAllMonthsFormArray(chiller),
      loadScheduleByMonth: this.createByMonthFormArray(chiller),
      useSameMonthlyLoading: [chiller.useSameMonthlyLoading]
    });
    return form;
  }

  setChillerLoadSchedule(formValue: LoadScheduleData, currentChiller: ChillerInventoryItem) {
    currentChiller.loadScheduleByMonth = formValue.loadScheduleByMonth;
    currentChiller.loadScheduleAllMonths = formValue.loadScheduleAllMonths;
    currentChiller.useSameMonthlyLoading = formValue.useSameMonthlyLoading;
  }

  /**
   * Creates the form array for all months.
   * @returns 1x11 FormArray of FormArray
   */
  createAllMonthsFormArray(chiller: ChillerInventoryItem): FormArray<FormControl<number>> {
    if (chiller.loadScheduleAllMonths) {
      return this.fb.array(
        chiller.loadScheduleAllMonths.map((val: number) =>
          this.fb.control(val ?? 0, [Validators.min(0), Validators.max(100)])
        )
      );
    } else {
      return this.fb.array(
        Array.from({ length: 11 }, () =>
          this.fb.control(0, [Validators.min(0), Validators.max(100)])
        )
      );
    }
  }

  
  /**
   * Creates the form array for all months.
   * @returns 12x11 FormArray of FormArray
   */
  createByMonthFormArray(chiller: ChillerInventoryItem): FormArray<FormArray<FormControl<number>>> {
    let monthlyLoads: number[][];
    if (Array.isArray(chiller.loadScheduleByMonth)) {
      monthlyLoads = chiller.loadScheduleByMonth;
    } else {
      monthlyLoads = Array.from({ length: 11 }, () => [0]);
    }
    return this.fb.array(
      monthlyLoads.map(month =>
        this.fb.array(
          month.map(val =>
            this.fb.control(val ?? 0, [Validators.min(0), Validators.max(100)])
          )
        )
      )
    );
  }
  

}

export interface LoadForm {
  loadScheduleAllMonths: FormArray;
  loadScheduleByMonth: FormArray;
  useSameMonthlyLoading: FormControl<boolean>;
}

export type LoadScheduleData = Pick<ChillerInventoryItem, 'loadScheduleByMonth' | 'loadScheduleAllMonths' | 'useSameMonthlyLoading'>;