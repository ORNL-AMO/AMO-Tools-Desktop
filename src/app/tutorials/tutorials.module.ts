import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardTutorialComponent } from './dashboard-tutorial/dashboard-tutorial.component';
import { TutorialsComponent } from './tutorials.component';
import { FsatAssessmentTutorialComponent } from './fsat-assessment-tutorial/fsat-assessment-tutorial.component';
import { FsatReportTutorialComponent } from './fsat-report-tutorial/fsat-report-tutorial.component';
import { FsatSystemSetupComponent } from './fsat-system-setup/fsat-system-setup.component';
import { FsatTutorialComponent } from './fsat-tutorial/fsat-tutorial.component';
import { OpeningTutorialComponent } from './opening-tutorial/opening-tutorial.component';
import { PhastAssessmentTutorialComponent } from './phast-assessment-tutorial/phast-assessment-tutorial.component';
import { PhastReportTutorialComponent } from './phast-report-tutorial/phast-report-tutorial.component';
import { PhastSetupTutorialComponent } from './phast-setup-tutorial/phast-setup-tutorial.component';
import { PhastTutorialComponent } from './phast-tutorial/phast-tutorial.component';
import { FormsModule } from '@angular/forms';
import { SsmtSystemSetupTutorialComponent } from './ssmt-system-setup-tutorial/ssmt-system-setup-tutorial.component';
import { SsmtAssessmentTutorialComponent } from './ssmt-assessment-tutorial/ssmt-assessment-tutorial.component';
import { SsmtReportTutorialComponent } from './ssmt-report-tutorial/ssmt-report-tutorial.component';
import { TreasureHuntReportTutorialComponent } from './treasure-hunt-report-tutorial/treasure-hunt-report-tutorial.component';
import { TreasureHuntSetupTutorialComponent } from './treasure-hunt-setup-tutorial/treasure-hunt-setup-tutorial.component';
import { SsmtDiagramTutorialComponent } from './ssmt-diagram-tutorial/ssmt-diagram-tutorial.component';
import { TreasureHuntFindTreasureTutorialComponent } from './treasure-hunt-find-treasure-tutorial/treasure-hunt-find-treasure-tutorial.component';
import { TreasureHuntTreasureChestTutorialComponent } from './treasure-hunt-treasure-chest-tutorial/treasure-hunt-treasure-chest-tutorial.component';
import { SsmtTutorialComponent } from './ssmt-tutorial/ssmt-tutorial.component';
import { TreasureHuntTutorialComponent } from './treasure-hunt-tutorial/treasure-hunt-tutorial.component';



@NgModule({
  declarations: [
    TutorialsComponent,
    DashboardTutorialComponent,
    FsatAssessmentTutorialComponent,
    FsatReportTutorialComponent,
    FsatSystemSetupComponent,
    FsatTutorialComponent,
    OpeningTutorialComponent,
    PhastAssessmentTutorialComponent,
    PhastReportTutorialComponent,
    PhastSetupTutorialComponent,
    PhastTutorialComponent,
    SsmtSystemSetupTutorialComponent,
    SsmtAssessmentTutorialComponent,
    SsmtReportTutorialComponent,
    TreasureHuntReportTutorialComponent,
    TreasureHuntSetupTutorialComponent,
    SsmtDiagramTutorialComponent,
    TreasureHuntFindTreasureTutorialComponent,
    TreasureHuntTreasureChestTutorialComponent,
    SsmtTutorialComponent,
    TreasureHuntTutorialComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    TutorialsComponent,
    DashboardTutorialComponent,
    FsatAssessmentTutorialComponent,
    FsatReportTutorialComponent,
    FsatSystemSetupComponent,
    FsatTutorialComponent,
    OpeningTutorialComponent,
    PhastAssessmentTutorialComponent,
    PhastReportTutorialComponent,
    PhastSetupTutorialComponent,
    PhastTutorialComponent,
    SsmtSystemSetupTutorialComponent,
    SsmtAssessmentTutorialComponent,
    SsmtReportTutorialComponent,
    TreasureHuntReportTutorialComponent,
    TreasureHuntSetupTutorialComponent,
    SsmtDiagramTutorialComponent,
    TreasureHuntFindTreasureTutorialComponent,
    TreasureHuntTreasureChestTutorialComponent,
    SsmtTutorialComponent,
    TreasureHuntTutorialComponent
  ]
})
export class TutorialsModule { }
