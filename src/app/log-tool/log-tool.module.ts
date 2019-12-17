import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogToolComponent } from './log-tool.component';
import { LogToolBannerComponent } from './log-tool-banner/log-tool-banner.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [LogToolComponent, LogToolBannerComponent],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class LogToolModule { }
