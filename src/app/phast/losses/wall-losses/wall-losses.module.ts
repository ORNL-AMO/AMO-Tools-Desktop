import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { WallLossesComponent } from './wall-losses.component';
import { WallLossesFormComponent } from './wall-losses-form/wall-losses-form.component';
import { WallLossCompareService } from './wall-loss-compare.service';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SuiteDbModule,
    ModalModule,
    SharedPipesModule
  ],
  declarations: [
    WallLossesComponent,
    WallLossesFormComponent
  ],
  providers: [
    WallLossCompareService
  ],
  exports: [
    WallLossesComponent
  ]
})
export class WallLossesModule { }
