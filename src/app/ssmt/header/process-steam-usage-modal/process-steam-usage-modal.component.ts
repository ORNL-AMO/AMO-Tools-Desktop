import { Component, effect, inject, input } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { ProcessSteamUsageData, ProcessSteamUsageRow } from '../../../shared/models/steam/ssmt';
import { ProcessSteamUsageService, ProcessSteamUsageTotals, SteamHeaderPressureLevel } from './process-steam-usage.service';

type ProcessSteamUsageRowForm = FormGroup<{
  name: FormControl<string>;
  type: FormControl<ProcessSteamUsageRow['type']>;
  quantity: FormControl<number>;
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
  data = input.required<ProcessSteamUsageData>();
  settings = input.required<Settings>();
  pressureLevel = input.required<SteamHeaderPressureLevel>();
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

  constructor() {
    effect(() => {
      this.rows.clear();
      this.data().rows.forEach(row => this.rows.push(this.createRowForm(row)));
      this.calculate();
    });
  }

  get rows(): FormArray<ProcessSteamUsageRowForm> {
    return this.form.controls.rows;
  }

  addRow() {
    const names = new Set(this.rows.controls.map(row => row.controls.name.value));
    let processNumber = 1;
    while (names.has(`Process ${processNumber}`)) {
      processNumber++;
    }
    this.rows.push(this.createRowForm({
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
    const updatedData = this.processSteamUsageService.updateCalculatedLosses(
      this.getData(),
      this.pressureLevel(),
      this.settings()
    );
    updatedData.rows.forEach((row, index) => {
      if (row.type !== 'process') {
        this.rows.at(index).controls.steamUsage.patchValue(row.steamUsage, { emitEvent: false });
      }
    });
    this.totals = this.processSteamUsageService.calculateTotals(updatedData);
  }

  getData(): ProcessSteamUsageData {
    return {
      rows: this.rows.controls.map(row => {
        const value = row.getRawValue();
        return {
          name: (value.name ?? '').trim(),
          type: value.type,
          quantity: value.type === 'process' ? undefined : value.quantity,
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
      quantity: this.formBuilder.control(row.quantity ?? 0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]),
      steamUsage: this.formBuilder.control(row.steamUsage ?? 0, [Validators.required, Validators.min(0)]),
      condensateRecoverable: this.formBuilder.control(row.condensateRecoverable),
      condensateRecoveryRate: this.formBuilder.control(row.condensateRecoveryRate ?? 0, [Validators.required, Validators.min(0), Validators.max(100)])
    });
  }
}
