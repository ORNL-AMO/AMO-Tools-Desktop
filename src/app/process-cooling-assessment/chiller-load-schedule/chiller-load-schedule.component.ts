import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ChillerInventoryItem } from '../../shared/models/process-cooling-assessment';
import { debounceTime} from 'rxjs';
import { ChillerLoadScheduleService, LoadForm } from '../services/chiller-load-schedule.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-asessment.service';
import { LOAD_LABELS, MONTHS } from '../process-cooling-constants';

@Component({
  selector: 'app-chiller-load-schedule',
  standalone: false,
  templateUrl: './chiller-load-schedule.component.html',
  styleUrls: ['./chiller-load-schedule.component.css']
})
export class ChillerLoadScheduleComponent implements OnInit {
  @Input({required: true})
  chiller: ChillerInventoryItem;

  destroyRef = inject(DestroyRef);
  processCoolingAssessmentService: ProcessCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
  chillerLoadScheduleService: ChillerLoadScheduleService = inject(ChillerLoadScheduleService);

  isCollapsed = false;
  form: FormGroup<LoadForm>;
  loadLabels = LOAD_LABELS;
  months = MONTHS;
  private copiedRow: number[] | null = null;

  ngOnInit() {
    this.form = this.chillerLoadScheduleService.getLoadScheduleForm(this.chiller);
    this.observeFormChanges();
  }

  observeFormChanges() {
    this.form.valueChanges.pipe(
      debounceTime(150),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((val)=> {
      this.chillerLoadScheduleService.setChillerLoadSchedule(this.form.getRawValue(), this.chiller);
      this.processCoolingAssessmentService.updateAssessmentChiller(this.chiller);
    });
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
    const row = this.loadScheduleByMonth.at(rowIndex) as FormArray;
    this.copiedRow = row.controls.map(ctrl => ctrl.value);
  }

  pasteRow(rowIndex: number) {
    if (!this.copiedRow) return;
    const row = this.loadScheduleByMonth.at(rowIndex) as FormArray;
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

  get loadScheduleAllMonths(): FormArray {
    return this.form.get('loadScheduleAllMonths') as FormArray;
  }
  get loadScheduleByMonth(): FormArray {
    return this.form.get('loadScheduleByMonth') as FormArray;
  }
  get useSameMonthlyLoading() {
    return this.form.get('useSameMonthlyLoading').value;
  }
}