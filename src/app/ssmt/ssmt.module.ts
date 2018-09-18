import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SsmtComponent } from './ssmt.component';
import { SsmtBannerComponent } from './ssmt-banner/ssmt-banner.component';
import { SystemBasicsComponent } from './system-basics/system-basics.component';
import { SsmtTabsComponent } from './ssmt-tabs/ssmt-tabs.component';
import { SsmtService } from './ssmt.service';
import { BoilerComponent } from './boiler/boiler.component';
import { HeaderComponent } from './header/header.component';
import { TurbineComponent } from './turbine/turbine.component';
import { HelpPanelComponent } from './help-panel/help-panel.component';
import { SettingsModule } from '../settings/settings.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SystemBasicsHelpComponent } from './help-panel/system-basics-help/system-basics-help.component';
import { OperationsModule } from './operations/operations.module';
import { OperationsHelpComponent } from './help-panel/operations-help/operations-help.component';
import { ExploreOpportunitiesModule } from './explore-opportunities/explore-opportunities.module';
import { ModifyConditionsComponent } from './modify-conditions/modify-conditions.component';
import { ModifyConditionsTabsComponent } from './modify-conditions/modify-conditions-tabs/modify-conditions-tabs.component';
import { ModalModule } from 'ngx-bootstrap';
import { AddModificationComponent } from './add-modification/add-modification.component';
import { CompareService } from './compare.service';
import { ModificationListComponent } from './modification-list/modification-list.component';
import { ModifyConditionsNotesComponent } from './help-panel/modify-conditions-notes/modify-conditions-notes.component';

@NgModule({
  imports: [
    CommonModule,
    SettingsModule,
    FormsModule,
    ReactiveFormsModule,
    OperationsModule,
    ExploreOpportunitiesModule,
    ModalModule
  ],
  declarations: [
    SsmtComponent,
    SsmtBannerComponent,
    SystemBasicsComponent,
    SsmtTabsComponent,
    BoilerComponent,
    HeaderComponent,
    TurbineComponent,
    HelpPanelComponent,
    SystemBasicsHelpComponent,
    OperationsHelpComponent,
    ModifyConditionsComponent,
    ModifyConditionsTabsComponent,
    AddModificationComponent,
    ModificationListComponent,
    ModifyConditionsNotesComponent
  ],
  providers: [
    SsmtService,
    CompareService
  ]
})
export class SsmtModule { }
