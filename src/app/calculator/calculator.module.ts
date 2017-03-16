import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ModalModule } from 'ng2-bootstrap';
import { CalculatorComponent } from './calculator.component';
import { HeadToolComponent } from './pumps/head-tool/head-tool.component';
import { HeadToolFormComponent } from './pumps/head-tool/head-tool-form/head-tool-form.component';
import { HeadToolHelpComponent } from './pumps/head-tool/head-tool-help/head-tool-help.component';
import { HeadToolResultsComponent } from './pumps/head-tool/head-tool-results/head-tool-results.component';
import { PumpsComponent } from './pumps/pumps.component';
import { FansComponent } from './fans/fans.component';
import { FurnacesComponent } from './furnaces/furnaces.component';
import { SteamComponent } from './steam/steam.component';
import { MotorsComponent } from './motors/motors.component';
import { HeadToolSuctionFormComponent } from './pumps/head-tool/head-tool-suction-form/head-tool-suction-form.component';

@NgModule({
  declarations: [
    CalculatorComponent,
    HeadToolComponent,
    HeadToolFormComponent,
    HeadToolHelpComponent,
    HeadToolResultsComponent,
    PumpsComponent,
    FansComponent,
    FurnacesComponent,
    SteamComponent,
    MotorsComponent,
    HeadToolSuctionFormComponent
  ],
  exports: [
    CalculatorComponent,
    HeadToolComponent
  ],
  imports: [
    RouterModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ModalModule
  ],
  providers: [
  ]
})

export class CalculatorModule { }
