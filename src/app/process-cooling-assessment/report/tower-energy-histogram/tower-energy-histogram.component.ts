import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, Input, ElementRef, ViewChild } from '@angular/core';
import { TowerBinRow, TowerSummaryUI } from '../../services/tower-summary.service';
import { PrintOptionsMenuService } from '../../../shared/print-options-menu/print-options-menu.service';
import { Subscription } from 'rxjs';
import { PlotlyService } from 'angular-plotly.js';

@Component({
    selector: 'app-tower-energy-histogram',
    standalone: false,
    template: `
      <div id="towerEnergyHistogram" #towerEnergyHistogram [class.print-view]="printView"></div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TowerEnergyHistogramComponent implements OnInit, OnDestroy {
    @Input() towerSummaryUI: TowerSummaryUI;
    @ViewChild('towerEnergyHistogram', { static: false }) towerEnergyHistogram: ElementRef;

    private plotlyService: PlotlyService = inject(PlotlyService);
    private printOptionsMenuService: PrintOptionsMenuService = inject(PrintOptionsMenuService);
    private showPrintViewSub: Subscription;
    printView: boolean;

    ngOnInit(): void {
        this.showPrintViewSub = this.printOptionsMenuService.showPrintView.subscribe(val => {
            this.printView = val;
        });
    }

    ngAfterViewInit() {
        // this.renderChart();
    }


    // todo this chart needs feedback. Line chart with different line types for hours vs energy, different colors for baseline vs modifications.
    renderChart() {
        const baselineBins = this.towerSummaryUI.baselineEnergyBins;
        const binLabels = this.towerSummaryUI.binLabels || [];
        const traces = [];

        traces.push({
            x: binLabels,
            y: baselineBins[2]?.binValues || [],
            type: 'bar',
            name: 'Baseline',
            marker: { color: '#007bff' }
        });

        this.towerSummaryUI.modificationEnergyBins.forEach((row: TowerBinRow[], i) => {
            row.forEach((dataRow, index) => {
                // default to energy for now, ignore hours
                if (index === 2) {
                    traces.push({
                        x: binLabels || [],
                        y: dataRow.binValues || [],
                        type: 'bar',
                        name: dataRow.label
                    });
                }
            });
        });

        const plotLayout = {
            barmode: 'group',
            title: 'Tower Energy Histogram',
            xaxis: { title: 'Wet Bulb Bin' },
            yaxis: { title: 'Energy (kWh)' },
            legend: { orientation: 'v' }
        };

        let configOptions = {
            modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
            displaylogo: false,
            displayModeBar: true,
            responsive: this.printView ? false : true
        };
        this.plotlyService.newPlot(this.towerEnergyHistogram.nativeElement, traces, plotLayout, configOptions);
    }

    ngOnDestroy() {
        if (this.showPrintViewSub) {
            this.showPrintViewSub.unsubscribe();
        }
    }

}
