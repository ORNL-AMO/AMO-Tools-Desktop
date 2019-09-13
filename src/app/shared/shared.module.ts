import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';

import { ValidationService } from './validation.service';
import { ModelService } from './model.service';

import { ConvertUnitsService } from './convert-units/convert-units.service';
import { PercentGraphComponent } from './percent-graph/percent-graph.component';
import { SigFigsPipe } from './pipes/sig-figs.pipe';
import { UpdateDataService } from './update-data.service';
import { FacilityInfoSummaryComponent } from './facility-info-summary/facility-info-summary.component';
import { SvgToPngService } from './svg-to-png/svg-to-png.service';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { PhonePipe } from './pipes/phone.pipe';
import { SimpleTooltipComponent } from './simple-tooltip/simple-tooltip.component';
import { LineChartHelperService } from './line-chart-helper/line-chart-helper.service';
import { TabsTooltipComponent } from './tabs-tooltip/tabs-tooltip.component';
import { SettingsLabelPipe } from './pipes/settings-label.pipe';
import { WaterfallGraphComponent } from './waterfall-graph/waterfall-graph.component';
import { WaterfallGraphService } from './waterfall-graph/waterfall-graph.service';
import { ToastComponent } from './toast/toast.component';
import { OperatingHoursModalComponent } from './operating-hours-modal/operating-hours-modal.component';
import { OperatingHoursModalService } from './operating-hours-modal/operating-hours-modal.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule
  ],
  declarations: [
    PercentGraphComponent,
    SigFigsPipe,
    FacilityInfoSummaryComponent,
    PieChartComponent,
    PhonePipe,
    SimpleTooltipComponent,
    TabsTooltipComponent,
    SettingsLabelPipe,
    WaterfallGraphComponent,
    ToastComponent,
    OperatingHoursModalComponent
  ],
  exports: [
    PercentGraphComponent,
    SigFigsPipe,
    FacilityInfoSummaryComponent,
    PieChartComponent,
    PhonePipe,
    SimpleTooltipComponent,
    TabsTooltipComponent,
    SettingsLabelPipe,
    WaterfallGraphComponent,
    ToastComponent,
    OperatingHoursModalComponent
  ],
  providers: [
    ValidationService,
    ModelService,
    ConvertUnitsService,
    UpdateDataService,
    SvgToPngService,
    LineChartHelperService,
    WaterfallGraphService,
    OperatingHoursModalService
  ]
})

export class SharedModule { }
