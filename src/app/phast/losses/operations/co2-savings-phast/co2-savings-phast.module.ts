import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Co2SavingsPhastComponent } from './co2-savings-phast.component';
import { Co2SavingsPhastService } from './co2-savings-phast.service';
import { ModalModule } from 'ngx-bootstrap/modal';
import { MixedCo2EmissionsModule } from '../../../../shared/mixed-co2-emissions/mixed-co2-emissions.module';



@NgModule({
  declarations: [
    Co2SavingsPhastComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MixedCo2EmissionsModule,
    ModalModule,
  ],
  providers: [
    Co2SavingsPhastService
  ],
  exports: [
    Co2SavingsPhastComponent
  ]
})
export class Co2SavingsPhastModule { }
