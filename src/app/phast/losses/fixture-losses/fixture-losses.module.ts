import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FixtureLossesCompareService } from "./fixture-losses-compare.service";
import { FixtureLossesComponent } from "./fixture-losses.component";
import { FixtureLossesFormComponent } from "./fixture-losses-form/fixture-losses-form.component";

import { ModalModule } from 'ngx-bootstrap/modal';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
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
    FixtureLossesComponent,
    FixtureLossesFormComponent
  ],
  providers: [
    FixtureLossesCompareService,
  ],
  exports: [
    FixtureLossesComponent
  ]
})
export class FixtureLossesModule { }
