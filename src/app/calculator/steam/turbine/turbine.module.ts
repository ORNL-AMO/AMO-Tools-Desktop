import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TurbineComponent } from './turbine.component';
import { TurbineFormComponent } from './turbine-form/turbine-form.component';
import { TurbineHelpComponent } from './turbine-help/turbine-help.component';
import { TurbineResultsComponent } from './turbine-results/turbine-results.component';
import { TurbineService } from './turbine.service';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '../../../../../node_modules/@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [TurbineComponent, TurbineFormComponent, TurbineHelpComponent, TurbineResultsComponent],
  exports: [TurbineComponent],
  providers: [TurbineService]
})
export class TurbineModule { }
