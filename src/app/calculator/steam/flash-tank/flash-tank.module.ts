import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashTankComponent } from './flash-tank.component';
import { FlashTankFormComponent } from './flash-tank-form/flash-tank-form.component';
import { FlashTankResultsComponent } from './flash-tank-results/flash-tank-results.component';
import { FlashTankHelpComponent } from './flash-tank-help/flash-tank-help.component';
import { FlashTankService } from './flash-tank.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ],
  declarations: [FlashTankComponent, FlashTankFormComponent, FlashTankResultsComponent, FlashTankHelpComponent],
  providers: [FlashTankService],
  exports: [FlashTankComponent]
})
export class FlashTankModule { }
