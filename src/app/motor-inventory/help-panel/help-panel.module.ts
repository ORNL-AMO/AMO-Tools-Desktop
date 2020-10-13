import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BatchAnalysisHelpComponent } from './batch-analysis-help/batch-analysis-help.component';
import { LoadCharacteristicsHelpComponent } from './load-characteristics-help/load-characteristics-help.component';
import { ManualSpecificationsHelpComponent } from './manual-specifications-help/manual-specifications-help.component';
import { NameplateDataHelpComponent } from './nameplate-data-help/nameplate-data-help.component';
import { OperationDataHelpComponent } from './operation-data-help/operation-data-help.component';
import { OtherHelpComponent } from './other-help/other-help.component';
import { PurchaseInformationHelpComponent } from './purchase-information-help/purchase-information-help.component';
import { TorqueHelpComponent } from './torque-help/torque-help.component';
import { HelpPanelComponent } from './help-panel.component';



@NgModule({
  declarations: [
    HelpPanelComponent,
    BatchAnalysisHelpComponent,
    LoadCharacteristicsHelpComponent,
    ManualSpecificationsHelpComponent,
    NameplateDataHelpComponent,
    OperationDataHelpComponent,
    OtherHelpComponent,
    PurchaseInformationHelpComponent,
    TorqueHelpComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HelpPanelComponent
  ]
})
export class HelpPanelModule { }
