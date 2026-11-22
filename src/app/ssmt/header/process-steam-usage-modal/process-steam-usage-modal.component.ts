import { Component, Input, inject, input } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { ProcessSteamUsageData, ProcessSteamUsageRow } from '../../../shared/models/steam/ssmt';
import { ProcessSteamUsageService, ProcessSteamUsageTotals } from './process-steam-usage.service';

type ProcessSteamUsageRowForm = FormGroup<{
  name: FormControl<string>;
  type: FormControl<ProcessSteamUsageRow['type']>;
  steamUsage: FormControl<number>;
  condensateRecoverable: FormControl<boolean>;
  condensateRecoveryRate: FormControl<number>;
}>;

@Component({
  selector: 'app-process-steam-usage-modal',
  templateUrl: './process-steam-usage-modal.component.html',
  styleUrls: ['./process-steam-usage-modal.component.css'],
  standalone: false
})
export class ProcessSteamUsageModalComponent {
  // Rows load as soon as the data is set, so the parent's Apply Data button reads the loaded totals in the same check.
  @Input({ required: true })
  set data(data: ProcessSteamUsageData) {
    this.rows.clear();
    this.processSteamUsageService.getCalculatorData(data).rows.forEach(row => this.rows.push(this.createRowForm(row)));
    this.calculate();
  }
  settings = input.required<Settings>();
  idPrefix = input.required<string>();

  private formBuilder = inject(NonNullableFormBuilder);
  private processSteamUsageService = inject(ProcessSteamUsageService);

  form = this.formBuilder.group({
    rows: this.formBuilder.array<ProcessSteamUsageRowForm>([])
  });
  totals: ProcessSteamUsageTotals = {
    processSteamUsage: 0,
    recoveredCondensate: 0,
    condensateRecoveryRate: 0
  };

  get rows(): FormArray<ProcessSteamUsageRowForm> {
    return this.form.controls.rows;
  }

  // Applying a total of 0 would set the header's process steam usage to 0.
  get canApply(): boolean {
    return this.form.valid && this.totals.processSteamUsage > 0;
  }

  addRow() {
    const names = new Set(this.rows.controls.map(row => row.controls.name.value));
    let processNumber = 1;
    while (names.has(`Process ${processNumber}`)) {
      processNumber++;
    }
    // New process rows go above the fixed Other (Miscellaneous) row.
    const otherRowIndex = this.rows.controls.findIndex(row => row.controls.type.value === 'other');
    this.rows.insert(otherRowIndex === -1 ? this.rows.length : otherRowIndex, this.createRowForm({
      name: `Process ${processNumber}`,
      type: 'process',
      steamUsage: 0,
      condensateRecoverable: true,
      condensateRecoveryRate: 0
    }));
    this.calculate();
  }

  removeRow(index: number) {
    if (this.rows.at(index).controls.type.value === 'process') {
      this.rows.removeAt(index);
      this.calculate();
    }
  }

  toggleRecoverable(index: number) {
    const row = this.rows.at(index);
    if (!row.controls.condensateRecoverable.value) {
      row.controls.condensateRecoveryRate.patchValue(0);
    }
    this.calculate();
  }

  calculate() {
    this.totals = this.processSteamUsageService.calculateTotals(this.getData());
  }

  getData(): ProcessSteamUsageData {
    return {
      rows: this.rows.controls.map(row => {
        const value = row.getRawValue();
        return {
          name: (value.name ?? '').trim(),
          type: value.type,
          steamUsage: value.steamUsage,
          condensateRecoverable: value.condensateRecoverable,
          condensateRecoveryRate: value.condensateRecoverable ? value.condensateRecoveryRate : 0
        };
      })
    };
  }

  private createRowForm(row: ProcessSteamUsageRow): ProcessSteamUsageRowForm {
    return this.formBuilder.group({
      name: this.formBuilder.control(row.name, [Validators.required, Validators.pattern(/\S/)]),
      type: this.formBuilder.control(row.type),
      steamUsage: this.formBuilder.control(row.steamUsage ?? 0, [Validators.required, Validators.min(0)]),
      condensateRecoverable: this.formBuilder.control(row.condensateRecoverable),
      condensateRecoveryRate: this.formBuilder.control(row.condensateRecoveryRate ?? 0, [Validators.required, Validators.min(0), Validators.max(100)])
    });
  }
}
