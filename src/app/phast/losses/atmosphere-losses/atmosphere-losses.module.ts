import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { AtmosphereLossesCompareService } from "./atmosphere-losses-compare.service";
import { AtmosphereLossesService } from "./atmosphere-losses.service";
import { AtmosphereLossesFormComponent } from "./atmosphere-losses-form/atmosphere-losses-form.component";
import { AtmosphereLossesComponent } from "./atmosphere-losses.component";
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalModule,
    SuiteDbModule,
    SharedPipesModule
  ],
  declarations: [
    AtmosphereLossesComponent,
    AtmosphereLossesFormComponent
  ],
  providers: [
    AtmosphereLossesCompareService,
    AtmosphereLossesService
  ],
  exports: [
    AtmosphereLossesComponent
  ]
})
export class AtmosphereLossesModule { }
