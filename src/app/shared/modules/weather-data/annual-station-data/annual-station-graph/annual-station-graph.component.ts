import { Component, Input, ViewChild, ElementRef, SimpleChanges, inject } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { AnnualStationDataSummary } from '../annual-station-data.component';
import { WeatherDataPoint } from '../../../../weather-api.service';

@Component({
    selector: 'app-annual-station-graph',
    templateUrl: './annual-station-graph.component.html',
    styleUrls: ['./annual-station-graph.component.css'],
    standalone: false
})
export class AnnualStationGraphComponent {
    private readonly plotlyService: PlotlyService = inject(PlotlyService);
    @ViewChild('annualDataChart', { static: false }) annualDataChart: ElementRef;
    @Input()
    set annualHourlyWeather(value: Array<WeatherDataPoint>) {
        this._annualHourlyWeather = value;
        if (this._annualHourlyWeather && this.annualDataChart) {
            this.drawChart();
        }
    }
    get annualHourlyWeather(): Array<WeatherDataPoint> {
        return this._annualHourlyWeather;
    }
    private _annualHourlyWeather: Array<WeatherDataPoint>;

    ngAfterViewInit() {
        this.drawChart();
    }

    drawChart() {
        if (this.annualDataChart) {
            let chartTitle = 'Wet Bulb Temp. and Dry Bulb Temp. (TMY3 year)';
            let traceData = [
                {
                    x: this.annualHourlyWeather.map(data => new Date(data.time)),
                    y: this.annualHourlyWeather.map(data => { return data.dry_bulb_temp }),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Dry Bulb Temp',
                    // yaxis: 'y',
                    marker: {
                        color: '#a04000'
                    }
                },
                {
                    x: this.annualHourlyWeather.map(data => new Date(data.time)),
                    y: this.annualHourlyWeather.map(data => { return data.wet_bulb_temp }),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Wet Bulb Temp',
                    // yaxis: 'y',
                    marker: {
                        color: '#0068a0ff'
                    }
                }
            ];



            const layout = {
                legend: {
                    orientation: "h"
                },
                barmode: 'group',
                title: {
                    text: chartTitle,
                    font: {
                        size: 18
                    },
                },
                xaxis: {
                    automargin: true,
                    autorange: true,
                },
                yaxis: {
                    title: {
                        text: 'Temperature (&#8457;)'
                    },
                    automargin: true,
                    overlaying: undefined,
                    side: 'left',
                    ticksuffix: ' &#8457;',
                    // dtick: yAxis2Dtick,
                    rangemode: undefined,
                    tickmode: undefined
                },
            };

            let config = {
                modeBarButtonsToRemove: ['autoScale2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
                displaylogo: false,
                responsive: true,
            };
            this.plotlyService.newPlot(this.annualDataChart.nativeElement, traceData, layout, config);
        }
    }

}


export interface Month {
    name: string,
    abbreviation: string,
    monthNumValue: number
}


export const Months: Array<Month> = [
    { name: 'January', abbreviation: 'Jan', monthNumValue: 0 },
    { name: 'February', abbreviation: 'Feb', monthNumValue: 1 },
    { name: 'March', abbreviation: 'Mar', monthNumValue: 2 },
    { name: 'April', abbreviation: 'Apr', monthNumValue: 3 },
    { name: 'May', abbreviation: 'May', monthNumValue: 4 },
    { name: 'June', abbreviation: 'Jun', monthNumValue: 5 },
    { name: 'July', abbreviation: 'Jul', monthNumValue: 6 },
    { name: 'August', abbreviation: 'Aug', monthNumValue: 7 },
    { name: 'September', abbreviation: 'Sep', monthNumValue: 8 },
    { name: 'October', abbreviation: 'Oct', monthNumValue: 9 },
    { name: 'November', abbreviation: 'Nov', monthNumValue: 10 },
    { name: 'December', abbreviation: 'Dec', monthNumValue: 11 }
]

