import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BleedTestComponent } from './bleed-test.component';
import { BleedTestFormComponent } from './bleed-test-form/bleed-test-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BleedTestService } from './bleed-test.service';



@NgModule({
  declarations: [
    BleedTestComponent,
    BleedTestFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    BleedTestComponent
  ],
  providers: [
    BleedTestService
  ]
})
export class BleedTestModule { }
