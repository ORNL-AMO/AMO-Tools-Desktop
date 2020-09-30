import { Component, OnInit, Input } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { PieChartDataItem } from '../../rollup-summary-pie-chart/rollup-summary-pie-chart.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-phast-rollup-energy-use-table',
  templateUrl: './phast-rollup-energy-use-table.component.html',
  styleUrls: ['./phast-rollup-energy-use-table.component.css']
})
export class PhastRollupEnergyUseTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  pieChartData: Array<PieChartDataItem>;

  totalFuelUsage: number;
  totalFuelCost: number;
  totalElectricityUsage: number;
  totalElectricityCost: number;
  totalSteamUsage: number;
  totalSteamCost: number;
  tableData: Array<PieChartDataItem>
  showSteam: boolean;
  showFuel: boolean;
  showElectricity: boolean;
  showTotal: boolean;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    //pie chart data comes in converted to phastRollupUnit
    //use copy to convert to individual type settings
    this.tableData = JSON.parse(JSON.stringify(this.pieChartData));
    this.tableData.forEach(dataItem => {
      if (dataItem.furnaceType == 'electricity') {
        dataItem.energyUsed = this.convertUnitsService.value(dataItem.energyUsed).from(this.settings.phastRollupUnit).to(this.settings.phastRollupElectricityUnit);
      } else if (dataItem.furnaceType == 'steam') {
        dataItem.energyUsed = this.convertUnitsService.value(dataItem.energyUsed).from(this.settings.phastRollupUnit).to(this.settings.phastRollupSteamUnit);
      } else if (dataItem.furnaceType == 'fuel') {
        dataItem.energyUsed = this.convertUnitsService.value(dataItem.energyUsed).from(this.settings.phastRollupUnit).to(this.settings.phastRollupFuelUnit);
      }
      dataItem.annualCost
    })

    let fuelResults: Array<PieChartDataItem> = this.tableData.filter(resultItem => { return resultItem.furnaceType == 'Fuel' });
    this.totalFuelUsage = _.sumBy(fuelResults, 'energyUsed');
    this.totalFuelCost = _.sumBy(fuelResults, 'annualCost');

    let electricityResults: Array<PieChartDataItem> = this.tableData.filter(resultItem => { return resultItem.furnaceType == 'Electricity' });
    this.totalElectricityUsage = _.sumBy(electricityResults, 'energyUsed');
    this.totalElectricityCost = _.sumBy(electricityResults, 'annualCost');

    let steamResults: Array<PieChartDataItem> = this.tableData.filter(resultItem => { return resultItem.furnaceType == 'Steam' });
    this.totalSteamUsage = _.sumBy(steamResults, 'energyUsed');
    this.totalSteamCost = _.sumBy(steamResults, 'annualCost');

    this.showElectricity = (this.totalElectricityCost != 0 || this.totalElectricityUsage != 0);
    this.showFuel = (this.totalFuelCost != 0 || this.totalFuelUsage != 0);
    this.showSteam = (this.totalSteamCost != 0 || this.totalSteamUsage != 0);
    this.showTotal = (this.showElectricity && this.showFuel) || (this.showElectricity && this.showSteam) || (this.showFuel && this.showSteam);
  }
}
