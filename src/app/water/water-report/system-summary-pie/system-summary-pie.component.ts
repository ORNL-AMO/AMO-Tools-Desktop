import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { Subscription } from 'rxjs';
import { PrintOptionsMenuService } from '../../../shared/print-options-menu/print-options-menu.service';
import { WaterReportService } from '../water-report.service';

@Component({
  selector: 'app-system-summary-pie',
  standalone: false,
  templateUrl: './system-summary-pie.component.html',
  styleUrls: ['./system-summary-pie.component.css'],
})
export class SystemSummaryPieComponent {
  private readonly waterReportService = inject(WaterReportService)
  private readonly printOptionsMenuService = inject(PrintOptionsMenuService)
  private readonly plotlyService = inject(PlotlyService)

  printView: boolean;
  @ViewChild('systemTrueCostBarChart', { static: false }) systemTrueCostBarChart: ElementRef;

  plantSummaryReport: Subscription;
  showPrintViewSub: Subscription;

  ngOnInit(): void {
      this.showPrintViewSub = this.printOptionsMenuService.showPrintView.subscribe(val => {
      this.printView = val;
    });
  }

  ngOnDestroy() {
      this.plantSummaryReport.unsubscribe();
      this.showPrintViewSub.unsubscribe();
  }

  ngAfterViewInit() {
    // todo needs print logic, programmatic colors
    this.plantSummaryReport = this.waterReportService.systemSummaryReport.subscribe(report => {
        console.log(report);

    });
  }


}
