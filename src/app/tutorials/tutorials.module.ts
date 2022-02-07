import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardTutorialComponent } from './dashboard-tutorial/dashboard-tutorial.component';
import { TutorialsComponent } from './tutorials.component';
import { OpeningTutorialComponent } from './opening-tutorial/opening-tutorial.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    TutorialsComponent,
    DashboardTutorialComponent,
    OpeningTutorialComponent,
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    TutorialsComponent,
    DashboardTutorialComponent,
    OpeningTutorialComponent,
  ]
})
export class TutorialsModule { }
