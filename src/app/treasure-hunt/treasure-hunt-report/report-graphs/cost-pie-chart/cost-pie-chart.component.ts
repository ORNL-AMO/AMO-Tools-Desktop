import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { TreasureHuntCo2EmissionsResults, TreasureHuntResults, UtilityUsageData } from '../../../../shared/models/treasure-hunt';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from '../../../../shared/models/settings';
import { PlotlyService } from 'angular-plotly.js';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-cost-pie-chart',
  templateUrl: './cost-pie-chart.component.html',
  styleUrls: ['./cost-pie-chart.component.css']
})
export class CostPieChartComponent implements OnInit {
  @Input()
  treasureHuntResults: TreasureHuntResults;
  @Input()
  isBaseline: boolean;
  @Input()
  showPrint: boolean;
  @Input()
  settings: Settings
  @Input()
  graphTab: string;

  @ViewChild('costPieChart', { static: false }) costPieChart: ElementRef;
  constructor(private plotlyService: PlotlyService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (!this.showPrint) {
      this.createChart();
    } else {
      this.createPrintChart();
    }
  }

  ngOnChanges() {
    if (this.costPieChart && !this.showPrint) {
      this.createChart();
    } else if (this.costPieChart && this.showPrint) {
      this.createPrintChart();
    }
  }

  ngOnDestroy() { }

  createChart() {
    let valuesAndLabels = this.getLabelsAndValues();
    var data = [{
      values: valuesAndLabels.values,
      labels: valuesAndLabels.labels,
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      // automargin: true,
      // textinfo: 'label+value',
      hoverformat: '.2r',
      texttemplate: '<b>%{label}</b> <br> %{value:,.0f}',
      // text: valuesAndLabels.values.map(y => { return (y).toFixed(2) }),
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: 90
    }];
    var layout = {
      font: {
        size: 12,
      },
      showlegend: false,
      margin: { t: 50, b: 80, l: 95, r: 95 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    this.plotlyService.newPlot(this.costPieChart.nativeElement, data, layout, modebarBtns);
  }


  createPrintChart() {
    let valuesAndLabels = this.getLabelsAndValues();
    var data = [{
      values: valuesAndLabels.values,
      labels: valuesAndLabels.labels,
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      // automargin: true,
      // textinfo: 'label+value',
      hoverformat: '.2r',
      texttemplate: '<b>%{label}</b> <br> %{value:,.0f}',
      // text: valuesAndLabels.values.map(y => { return (y).toFixed(2) }),
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: 90
    }];
    var layout = {
      width: 450,
      font: {
        size: 12,
      },
      showlegend: false,
      margin: { t: 50, b: 80, l: 95, r: 95 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: false,
    };
    this.plotlyService.newPlot(this.costPieChart.nativeElement, data, layout, modebarBtns);
  }


  getLabelsAndValues(): { values: Array<number>, labels: Array<string> } {
    let values: Array<number> = new Array();
    let labels: Array<string> = new Array();
    if (this.graphTab === 'cost') {
      this.addCostItem(values, labels, this.treasureHuntResults.electricity, this.isBaseline, 'Electricity');
      this.addCostItem(values, labels, this.treasureHuntResults.naturalGas, this.isBaseline, 'Natural Gas');
      this.addCostItem(values, labels, this.treasureHuntResults.water, this.isBaseline, 'Water');
      this.addCostItem(values, labels, this.treasureHuntResults.wasteWater, this.isBaseline, 'Waste Water');
      this.addCostItem(values, labels, this.treasureHuntResults.otherFuel, this.isBaseline, 'Other Fuel');
      this.addCostItem(values, labels, this.treasureHuntResults.compressedAir, this.isBaseline, 'Comp. Air');
      this.addCostItem(values, labels, this.treasureHuntResults.steam, this.isBaseline, 'Steam');
      this.addCostItem(values, labels, this.treasureHuntResults.other, this.isBaseline, 'Other');
    }
    if (this.graphTab === 'carbon') {
      this.addCarbonData(values, labels, this.treasureHuntResults.co2EmissionsResults.electricityCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.electricityCO2ProjectedUse, this.isBaseline, 'Electricity');
      this.addCarbonData(values, labels, this.treasureHuntResults.co2EmissionsResults.naturalGasCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.naturalGasCO2ProjectedUse, this.isBaseline, 'Natural Gas');
      this.addCarbonData(values, labels, this.treasureHuntResults.co2EmissionsResults.waterCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.waterCO2ProjectedUse, this.isBaseline, 'Water');
      this.addCarbonData(values, labels, this.treasureHuntResults.co2EmissionsResults.wasteWaterCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.wasteWaterCO2ProjectedUse, this.isBaseline, 'Waste Water');
      this.addCarbonData(values, labels, this.treasureHuntResults.co2EmissionsResults.otherFuelCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.otherFuelCO2ProjectedUse, this.isBaseline, 'Other Fuel');
      this.addCarbonData(values, labels, this.treasureHuntResults.co2EmissionsResults.compressedAirCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.compressedAirCO2ProjectedUse, this.isBaseline, 'Comp. Air');
      this.addCarbonData(values, labels, this.treasureHuntResults.co2EmissionsResults.steamCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.steamCO2ProjectedUse, this.isBaseline, 'Steam');

    }
    if (this.graphTab === 'energy') {
      let totalEnergyProjected: number;
      let totalEnergyCurrent: number;
      let totalEnergySavings: number;
      if (this.treasureHuntResults.electricity) {
        let energyProjected: number;
        let energyCurrent: number;
        let energySavings: number;
        if(this.settings.unitsOfMeasure === 'Imperial'){
          energyProjected = this.convertUnitsService.value(this.treasureHuntResults.electricity.modifiedEnergyUsage).from("kWh").to("MMBtu");
          energyCurrent = this.convertUnitsService.value(this.treasureHuntResults.electricity.baselineEnergyUsage).from("kWh").to("MMBtu");
          energySavings = this.convertUnitsService.value(this.treasureHuntResults.electricity.energySavings).from("kWh").to("MMBtu");
        } else {
          energyProjected = this.convertUnitsService.value(this.treasureHuntResults.electricity.modifiedEnergyUsage).from("kWh").to("GJ");
          energyCurrent = this.convertUnitsService.value(this.treasureHuntResults.electricity.baselineEnergyUsage).from("kWh").to("GJ");
          energySavings = this.convertUnitsService.value(this.treasureHuntResults.electricity.energySavings).from("kWh").to("GJ");
        }
        totalEnergyProjected += energyProjected;
        totalEnergyCurrent += energyCurrent;
        totalEnergySavings += energySavings; 
        this.addEnergyItem(values, labels, energyCurrent, energyProjected, this.isBaseline, 'Electricity');
      }
      if (this.treasureHuntResults.naturalGas) {
        totalEnergyProjected += this.treasureHuntResults.naturalGas.modifiedEnergyUsage;
        totalEnergyCurrent += this.treasureHuntResults.naturalGas.baselineEnergyUsage;
        totalEnergySavings += this.treasureHuntResults.naturalGas.energySavings; 
        this.addEnergyItem(values, labels, this.treasureHuntResults.naturalGas.baselineEnergyUsage, this.treasureHuntResults.naturalGas.modifiedEnergyUsage, this.isBaseline, 'Natural Gas');
      }
      if (this.treasureHuntResults.otherFuel) {
        totalEnergyProjected += this.treasureHuntResults.otherFuel.modifiedEnergyUsage;
        totalEnergyCurrent += this.treasureHuntResults.otherFuel.baselineEnergyUsage;
        totalEnergySavings += this.treasureHuntResults.otherFuel.energySavings; 
        this.addEnergyItem(values, labels, this.treasureHuntResults.otherFuel.baselineEnergyUsage, this.treasureHuntResults.otherFuel.modifiedEnergyUsage, this.isBaseline, 'Other Fuel');
      }
      this.addEnergyItem(values, labels, totalEnergyCurrent, totalEnergyProjected, this.isBaseline, 'Total');
    }
    return { values: values, labels: labels };
  }

  addCostItem(values: Array<number>, labels: Array<string>, data: UtilityUsageData, isBaseline: boolean, label: string) {
    if (isBaseline && data.baselineEnergyCost) {
      labels.push(label);
      values.push(data.baselineEnergyCost);
    } else if (!isBaseline && data.modifiedEnergyCost) {
      labels.push(label);
      values.push(data.modifiedEnergyCost);
    }
  }

  addCarbonData(values: Array<number>, labels: Array<string>, currentCO2: number, projectedCO2: number, isBaseline: boolean, label: string){
    if (isBaseline && currentCO2) {
      labels.push(label);
      values.push(currentCO2);
    } else if (!isBaseline && projectedCO2) {
      labels.push(label);
      values.push(projectedCO2);
    }
    
  }

  addEnergyItem(values: Array<number>, labels: Array<string>, currentEnergyUsage: number, projectedEnergyUsage: number, isBaseline: boolean, label: string){
    if (isBaseline && currentEnergyUsage) {
      labels.push(label);
      values.push(currentEnergyUsage);
    } else if (!isBaseline && projectedEnergyUsage) {
      labels.push(label);
      values.push(projectedEnergyUsage);
    }
    
  }

}
