import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WallFormComponent } from './wall-form/wall-form.component';
import { WallHelpComponent } from './wall-help/wall-help.component';
import { WallResultsComponent } from './wall-results/wall-results.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { WallService } from './wall.service';
import { WallFormService } from './wall-form.service';
import { WallComponent } from './wall.component';
import { SuiteDbModule } from '../../../suiteDb/suiteDb.module';
import { ModalModule } from 'ngx-bootstrap';



@NgModule({
  declarations: [
    WallFormComponent, 
    WallHelpComponent, 
    WallResultsComponent,
    WallComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    ReactiveFormsModule,
    SharedPipesModule,
    SuiteDbModule
  ],
  exports: [
    WallComponent
  ],
  providers: [
    WallService,
    WallFormService
  ]
})
export class WallModule { }
