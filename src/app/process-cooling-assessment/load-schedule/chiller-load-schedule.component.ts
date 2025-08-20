import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-chiller-load-schedule',
  standalone: false,
  templateUrl: './chiller-load-schedule.component.html',
  styleUrls: ['./chiller-load-schedule.component.css']
})
export class ChillerLoadScheduleComponent implements OnInit {
  form: FormGroup<LoadForm>;
  loadLabels = ['0%', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  private copiedRow: number[] | null = null;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      allMonths: this.fb.array([this.createLoadRow()]),
      months: this.fb.array([]),
      useSameMonthlyLoading: [true]
    });

    const monthsArray = this.form.get('months') as FormArray;
    for (let i = 0; i < 12; i++) {
      monthsArray.push(this.createLoadRow());
    }
  }

  createLoadRow(): FormArray {
    return this.fb.array(Array.from({ length: 11 }, () => [0, [Validators.min(0), Validators.max(100)]]));
  }

  getTotal(row: FormArray): number {
    if (row && row.controls) {
      return row.controls.reduce((sum, ctrl) => sum + (Number(ctrl.value) || 0), 0);
    }
  }

  toggleUseSameLoading() {
    this.form.get('useSameMonthlyLoading').setValue(!this.form.get('useSameMonthlyLoading').value);
  }

  copyRow(rowIndex: number) {
    const row = this.monthsArray.at(rowIndex) as FormArray;
    this.copiedRow = row.controls.map(ctrl => ctrl.value);
  }

  pasteRow(rowIndex: number) {
    if (!this.copiedRow) return;
    const row = this.monthsArray.at(rowIndex) as FormArray;
    this.copiedRow.forEach((val, i) => {
      row.at(i).setValue(val);
    });
  }

  isRowValid(row: FormArray): boolean {
    if (!row.pristine) {
      const total = this.getTotal(row);
      if (total !== 100) {
        return false;
      }
    }
    return true;
  }

  get allMonthsArray(): FormArray {
    return this.form.get('allMonths') as FormArray;
  }
  get monthsArray(): FormArray {
    return this.form.get('months') as FormArray;
  }
  get useSameMonthlyLoading() {
    return this.form.get('useSameMonthlyLoading').value;
  }
}

export interface LoadForm {
  allMonths: FormArray;
  months: FormArray;
  useSameMonthlyLoading: FormControl<boolean>;
}