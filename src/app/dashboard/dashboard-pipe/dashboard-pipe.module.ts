import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectoryDashboardPipe } from './directory-dashboard.pipe';



@NgModule({
  declarations: [
    DirectoryDashboardPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DirectoryDashboardPipe
  ]
})
export class DashboardPipeModule { }
