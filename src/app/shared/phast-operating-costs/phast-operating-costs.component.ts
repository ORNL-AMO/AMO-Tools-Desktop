import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Settings } from '../models/settings';

export interface PhastOperatingCostsDialogData {
  settings: Settings;
}

export interface OperatingFuel {
  name: string;
  usage: number;
  cost: number;
}

@Component({
  selector: 'app-phast-operating-costs',
  standalone: false,
  templateUrl: './phast-operating-costs.component.html',
  styleUrl: './phast-operating-costs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhastOperatingCostsComponent {
  readonly data: PhastOperatingCostsDialogData = inject(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<number>);

  mixedFuelCostsResult: number;
  fuels: OperatingFuel[] = [{ name: 'New Source', usage: 0, cost: 0 }];

  ngOnInit(): void {
    this.calculateMixedFuelCosts();
  }

  addFuel(): void {
    this.fuels.push({ name: 'New Source', usage: 0, cost: 0 });
  }

  deleteFuel(index: number): void {
    this.fuels.splice(index, 1);
    this.calculateMixedFuelCosts();
  }

  calculateMixedFuelCosts(): void {
    let summedUse = 0;
    for (const fuel of this.fuels) {
      summedUse += fuel.usage * (fuel.cost / 100);
    }
    this.mixedFuelCostsResult = Number(summedUse.toFixed(2));
  }

  save(): void {
    this.dialogRef.close(this.mixedFuelCostsResult);
  }

  close(): void {
    this.dialogRef.close();
  }
}
