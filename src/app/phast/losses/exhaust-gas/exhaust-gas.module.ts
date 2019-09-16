import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExhaustGasService } from './exhaust-gas.service';
import { ExhaustGasCompareService } from './exhaust-gas-compare.service';
import { ExhaustGasComponent } from './exhaust-gas.component';
import { ExhaustGasFormComponent} from './exhaust-gas-form/exhaust-gas-form.component';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule
  ],
  declarations: [
    ExhaustGasComponent,
    ExhaustGasFormComponent
  ],
  providers: [
    ExhaustGasService,
    ExhaustGasCompareService
  ],
  exports: [
    ExhaustGasComponent
  ]
})
export class ExhaustGasModule { }
