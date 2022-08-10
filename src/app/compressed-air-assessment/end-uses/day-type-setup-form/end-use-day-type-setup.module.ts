import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DayTypeSetupFormComponent } from './day-type-setup-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DayTypeSetupService } from './day-type-setup.service';



@NgModule({
  declarations: [DayTypeSetupFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ], 
  exports: [DayTypeSetupFormComponent],
  providers: [DayTypeSetupService]
})
export class EndUseDayTypeSetupModule { }
