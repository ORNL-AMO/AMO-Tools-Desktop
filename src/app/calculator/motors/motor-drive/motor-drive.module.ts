import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotorDriveComponent } from './motor-drive.component';
import { MotorDriveService } from './motor-drive.service';
import { MotorDriveFormComponent } from './motor-drive-form/motor-drive-form.component';
import { MotorDriveGraphComponent } from './motor-drive-graph/motor-drive-graph.component';
import { MotorDriveTableComponent } from './motor-drive-table/motor-drive-table.component';
import { MotorDriveHelpComponent } from './motor-drive-help/motor-drive-help.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [MotorDriveComponent, MotorDriveFormComponent, MotorDriveGraphComponent, MotorDriveTableComponent, MotorDriveHelpComponent],
  providers: [MotorDriveService],
  exports: [MotorDriveComponent]
})
export class MotorDriveModule { }
