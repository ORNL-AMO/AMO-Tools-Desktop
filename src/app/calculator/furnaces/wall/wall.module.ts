import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WallFormComponent } from './wall-form/wall-form.component';
import { WallHelpComponent } from './wall-help/wall-help.component';
import { WallResultsComponent } from './wall-results/wall-results.component';
import { FormsModule } from '@angular/forms';
import { SharedPipesModule } from '../../../shared/shared-pipes/shared-pipes.module';
import { WallService } from './wall.service';



@NgModule({
  declarations: [
    WallFormComponent, 
    WallHelpComponent, 
    WallResultsComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedPipesModule,
  ],
  providers: [
    WallService
  ]
})
export class WallModule { }
