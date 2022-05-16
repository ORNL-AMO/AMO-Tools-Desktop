import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BleedTestComponent } from './bleed-test.component';
import { BleedTestFormComponent } from './bleed-test-form/bleed-test-form.component';
import { FormsModule } from '@angular/forms';
import { BleedTestService } from './bleed-test.service';



@NgModule({
  declarations: [
    BleedTestComponent,
    BleedTestFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    BleedTestComponent
  ],
  providers: [
    BleedTestService
  ]
})
export class BleedTestModule { }
