import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EndUseEnergy, EndUseEnergyData, EndUsesService } from '../end-uses-setup/end-uses.service';
import { PlotlyService } from 'angular-plotly.js';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { CompressedAirInventoryService } from '../../compressed-air-inventory.service';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirInventoryData, CompressedAirInventorySystem } from '../../compressed-air-inventory';
import { Subscription } from 'rxjs';
import { CompressedAirCatalogService } from '../compressed-air-catalog/compressed-air-catalog.service';

@Component({
  selector: 'app-end-uses-chart',
  templateUrl: './end-uses-chart.component.html',
  styleUrl: './end-uses-chart.component.css',
  standalone: false
})
export class EndUsesChartComponent implements OnInit {
  @ViewChild('overviewPieChart', { static: false }) overviewPieChart: ElementRef;
  settings: Settings;
  airflowUnits: string = 'acfm';
  selectedDayTypeAverage: number;
  dayTypeEndUseWarning: string;
  compressedAirInventoryData: CompressedAirInventoryData;
  compressedAirInventoryDataSub: Subscription;
  selectedSystemIdSub: Subscription;
  selectedSystemId: string;
  selectedSystem: CompressedAirInventorySystem;
  showChart: boolean = true;
  chartTitle: string;
  exceededAirflow: boolean = false;

  plotlyTraceColors: Array<string> = [
    '#1f77b4',  // muted blue
    '#ff7f0e',  // safety orange
    '#2ca02c',  // cooked asparagus green
    // '#d62728',  // brick red
    '#9467bd',  // muted purple
    '#8c564b',  // chestnut brown
    '#e377c2',  // raspberry yogurt pink
    '#7f7f7f',  // middle gray
    '#bcbd22',  // curry yellow-green
    '#17becf'   // blue-teal
  ];
  constructor(
    private compressedAirInventoryService: CompressedAirInventoryService,
    private convertUnitsService: ConvertUnitsService,
    private endUsesService: EndUsesService,
    private cd: ChangeDetectorRef,
    private compressedAirCatalogService: CompressedAirCatalogService,
    private plotlyService: PlotlyService
  ) { }

  ngOnInit(): void {
    this.settings = this.compressedAirInventoryService.settings.getValue();
    this.compressedAirInventoryData = this.compressedAirInventoryService.compressedAirInventoryData.getValue();

    this.selectedSystemId = this.compressedAirCatalogService.selectedSystemId.getValue();
    this.selectedSystem = this.compressedAirInventoryData.systems.find(system => { return system.id == this.selectedSystemId });


    // this.endUseDayTypeSetup = this.dayTypeSetupService.endUseDayTypeSetup.getValue();
    // if (!this.endUseDayTypeSetup.selectedDayTypeId) {
    //   // set default from setup
    //   this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes[0];
    // } else {
    //   this.selectedDayType = this.compressedAirAssessment.compressedAirDayTypes.find(dayType => dayType.dayTypeId === this.endUseDayTypeSetup.selectedDayTypeId);
    // }
    // this.dayTypeBaselineResults = this.endUsesService.getBaselineResults(this.compressedAirAssessment, this.settings);
    // if (this.settings.unitsOfMeasure !== 'Imperial') {
    //   this.airflowUnits = 'm<sup>3</sup>/min';
    // }
  }

  ngOnDestroy() {
    this.compressedAirInventoryDataSub.unsubscribe();
    this.selectedSystemIdSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.compressedAirInventoryDataSub = this.compressedAirInventoryService.compressedAirInventoryData.subscribe(compressedAirInventoryData => {
      this.compressedAirInventoryData = compressedAirInventoryData;
      this.showChart = true;
      this.setChartData();
    });
    this.selectedSystemIdSub = this.compressedAirCatalogService.selectedSystemId.subscribe(val => {
      if (val) {
        this.selectedSystemId = val;
        this.selectedSystem = this.compressedAirInventoryData.systems.find(system => { return system.id == this.selectedSystemId });
        this.setChartData();
      }
    });
  }

  setChartData() {
    if (this.selectedSystem.endUses.length > 0) {
      this.showChart = true;
      let endUseEnergy: EndUseEnergy = this.endUsesService.getEndUseEnergyData(this.selectedSystem);
      let endUseEnergyData: Array<EndUseEnergyData> = endUseEnergy.endUseEnergyData;
      let otherEndUseData: EndUseEnergyData;
      if (endUseEnergy.hasValidEndUses) {
        if (endUseEnergyData.length > 10) {
          endUseEnergyData = endUseEnergyData.slice(0, 10);
        }
      } else {
        this.showChart = false;
      }
      this.renderPieChart(endUseEnergyData, otherEndUseData);
    } else {
      this.showChart = false;
    }
    this.cd.detectChanges();
  }

  renderPieChart(endUseEnergyData: Array<EndUseEnergyData>, otherEndUseData: EndUseEnergyData) {
    this.chartTitle = `${this.selectedSystem.name} Average Airflow: ${this.selectedSystem.knownTotalAirflow} ${this.airflowUnits}`;
    if (endUseEnergyData.length === 0) {
      this.dayTypeEndUseWarning = "There are no valid End Uses with selected Day Type";
    } else {
      this.dayTypeEndUseWarning = undefined;
    }

    let data = [];

    let totalEndUseAirflow: number = 0;
    let unaccountedAirflow: number = 0;
    this.selectedSystem.endUses.forEach(use => {
      totalEndUseAirflow += use.averageAirflow;
    });

    if (this.selectedSystem.knownTotalAirflow > totalEndUseAirflow) {
      let values: Array<number> = endUseEnergyData.map(val => val.averageAirflowPercent);
      let labels: Array<string> = endUseEnergyData.map(val => val.endUseName);
      let text: Array<number> = endUseEnergyData.map(val => val.averageAirFlow);
      let colors: Array<string> = this.setChartColors(endUseEnergyData);
      let width: Array<number> = endUseEnergyData.map(val => 2);

      if (otherEndUseData) {
        values.push(otherEndUseData.averageAirflowPercent);
        labels.push('Other End Use Airflow');
        text.push(otherEndUseData.averageAirFlow);
        colors.push(undefined);
        width.push(2);
      }

      unaccountedAirflow = this.selectedSystem.knownTotalAirflow - totalEndUseAirflow;
      let unaccountedAirflowPercent: number = (unaccountedAirflow / this.selectedSystem.knownTotalAirflow) * 100;
      if (unaccountedAirflow > 0) {
        this.exceededAirflow = false;
        values.push(unaccountedAirflowPercent);
        labels.push('Unaccounted Airflow');
        text.push(unaccountedAirflow);
        colors.push('rgb(211,211,211)');
        width.push(2);
      }


      data = [{
        values: values,
        labels: labels,
        text: text,
        marker: {
          colors: colors,
          line: {
            width: width,
            color: '#fff'
          }
        },
        type: 'pie',
        textposition: 'auto',
        insidetextorientation: "horizontal",
        textinfo: 'label+value',
        texttemplate: '%{label}<br>%{text:.0f} ' + this.airflowUnits,
        hovertemplate: '%{label} <br> %{value:.3r}% <extra></extra>',
        sort: false,
        automargin: true
      }];
    } else {
      this.exceededAirflow = true;
      this.showChart = false;
    }


    let layout = {
      showlegend: false,
      font: {
        size: 12,
      },
    };

    let configOptions = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };

    this.plotlyService.newPlot(this.overviewPieChart.nativeElement, data, layout, configOptions);
  }

  getChunkedArray(array, size) {
    let chunked = [];
    let index = 0;
    while (index < array.length) {
      chunked.push(array.slice(index, size + index));
      index += size;
    }
    return chunked;
  }

  setChartColors(endUseEnergyData: Array<EndUseEnergyData>) {
    let colors: Array<string> = [];
    let leakRateColor: string = 'red'
    let chunkedEnergyData: Array<Array<EndUseEnergyData>> = this.getChunkedArray(endUseEnergyData, 10);
    chunkedEnergyData.forEach((chunk: Array<EndUseEnergyData>) => {
      chunk.forEach((data, i) => {
        if (data.endUseId !== 'dayTypeLeakRate') {
          colors.push(this.plotlyTraceColors[i]);
        } else {
          colors.push(leakRateColor);
        }
      })
    })
    return colors;
  }

}
