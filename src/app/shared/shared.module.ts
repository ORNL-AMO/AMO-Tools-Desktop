import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { ModalModule } from 'ngx-bootstrap/modal/modal.module';

import { ControlMessagesComponent } from './control-messages/control-messages.component';
import { ValidationService } from './validation.service';
import { ModelService } from './model.service';

import { ConvertUnitsService } from './convert-units/convert-units.service';
import { PercentGraphComponent } from './percent-graph/percent-graph.component';
import { SigFigsPipe } from './pipes/sig-figs.pipe';
import { UpdateDataService } from './update-data.service';
import { FacilityInfoSummaryComponent } from './facility-info-summary/facility-info-summary.component';
import { SvgToPngService } from './svg-to-png/svg-to-png.service';
import { AnimatedCheckmarkComponent } from './animated-checkmark/animated-checkmark.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { PhonePipe } from './pipes/phone.pipe';
import { SimpleTooltipComponent } from './simple-tooltip/simple-tooltip.component';
import { LineChartHelperService } from './line-chart-helper/line-chart-helper.service';
import { ExportableTableComponent } from './exportable-table/exportable-table.component';
import { TabsTooltipComponent } from './tabs-tooltip/tabs-tooltip.component';
import { PrintOptionsMenuComponent } from './print-options-menu/print-options-menu.component';
import { SettingsLabelPipe } from './pipes/settings-label.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
    ModalModule
    // ChartsModule
  ],
  declarations: [
    ControlMessagesComponent,
    PercentGraphComponent,
    SigFigsPipe,
    FacilityInfoSummaryComponent,
    AnimatedCheckmarkComponent,
    PieChartComponent,
    PhonePipe,
    SimpleTooltipComponent,
    ExportableTableComponent,
    TabsTooltipComponent,
    PrintOptionsMenuComponent,
    SettingsLabelPipe
  ],
  exports: [
    ControlMessagesComponent,
    PercentGraphComponent,
    SigFigsPipe,
    FacilityInfoSummaryComponent,
    AnimatedCheckmarkComponent,
    PieChartComponent,
    PhonePipe,
    SimpleTooltipComponent,
    ExportableTableComponent,
    TabsTooltipComponent,
    PrintOptionsMenuComponent,
    SettingsLabelPipe
  ],
  providers: [
    ValidationService,
    ModelService,
    ConvertUnitsService,
    UpdateDataService,
    SvgToPngService,
    LineChartHelperService
  ]
})

export class SharedModule { }
