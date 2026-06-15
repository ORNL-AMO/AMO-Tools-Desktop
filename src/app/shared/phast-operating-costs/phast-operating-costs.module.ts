import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhastOperatingCostsComponent } from './phast-operating-costs.component';

@NgModule({
  declarations: [PhastOperatingCostsComponent],
  imports: [CommonModule, FormsModule],
  exports: [PhastOperatingCostsComponent],
})
export class PhastOperatingCostsModule {}
