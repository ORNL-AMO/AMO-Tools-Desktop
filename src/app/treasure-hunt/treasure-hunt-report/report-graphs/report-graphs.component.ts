import { Component, OnInit, Input } from '@angular/core';
import { SavingsItem, TreasureHuntResults } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-report-graphs',
  templateUrl: './report-graphs.component.html',
  styleUrls: ['./report-graphs.component.css']
})
export class ReportGraphsComponent implements OnInit {
  @Input()
  treasureHuntResults: TreasureHuntResults;
  @Input()
  showPrint: boolean;
  @Input()
  settings: Settings;

  graphTab: string = 'cost';

  savingsItems: Array<SavingsItem>;
  costSavingsItems: Array<SavingsItem>;
  energySavingsItems: Array<SavingsItem>;
  carbonSavingsItems: Array<SavingsItem>;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {

  }

  ngOnChanges() {
    this.setSavingsItems();
  }

  setSavingsItems() {
    this.savingsItems = new Array();
    this.costSavingsItems = new Array();
    this.energySavingsItems = new Array();
    this.carbonSavingsItems = new Array();
    if (!this.showPrint) {
      if (this.graphTab === 'carbon') {
        this.setCarbonSavingsItems();
        this.savingsItems = this.carbonSavingsItems;
      } else if (this.graphTab === 'cost') {
        this.setCostSavingsItems();
        this.savingsItems = this.costSavingsItems;
      } else if (this.graphTab === 'energy') {
        this.setEnergySavingsItems();
        this.savingsItems = this.energySavingsItems;
      }
    } else {
      this.setCostSavingsItems();
      this.setEnergySavingsItems();
      this.setCarbonSavingsItems();
    }
  }

  addCostSavingsItem(savings: number, currentCost: number, newCost: number, label: string) {
    this.costSavingsItems.push({
      savings: savings,
      currentCost: currentCost,
      newCost: newCost,
      label: label + ' Utility Expenditures'
    });
  }

  addEnergySavingsItem(savings: number, currentCost: number, newCost: number, label: string, unitLabel?: string) {
    this.energySavingsItems.push({
      savings: savings,
      currentCost: currentCost,
      newCost: newCost,
      label: label + ' Utility Saving (' + unitLabel + ')'
    });
  }

  addCarbonSavingsItem(savings: number, currentCost: number, newCost: number, label: string) {
    this.carbonSavingsItems.push({
      savings: savings,
      currentCost: currentCost,
      newCost: newCost,
      label: label + ' Carbon Emissions Savings'
    });
  }

  changeGraphTab(str: string) {
    this.graphTab = str;
    this.setSavingsItems()
  }

  setCostSavingsItems() {
    this.addCostSavingsItem(this.treasureHuntResults.totalSavings, this.treasureHuntResults.totalBaselineCost, this.treasureHuntResults.totalModificationCost, 'Total');
    if (this.treasureHuntResults.electricity.costSavings) {
      this.addCostSavingsItem(this.treasureHuntResults.electricity.costSavings, this.treasureHuntResults.electricity.baselineEnergyCost, this.treasureHuntResults.electricity.modifiedEnergyCost, 'Electricity');
    }
    if (this.treasureHuntResults.naturalGas.costSavings) {
      this.addCostSavingsItem(this.treasureHuntResults.naturalGas.costSavings, this.treasureHuntResults.naturalGas.baselineEnergyCost, this.treasureHuntResults.naturalGas.modifiedEnergyCost, 'Natural Gas');
    }
    if (this.treasureHuntResults.water.costSavings) {
      this.addCostSavingsItem(this.treasureHuntResults.water.costSavings, this.treasureHuntResults.water.baselineEnergyCost, this.treasureHuntResults.water.modifiedEnergyCost, 'Water');
    }
    if (this.treasureHuntResults.wasteWater.costSavings) {
      this.addCostSavingsItem(this.treasureHuntResults.wasteWater.costSavings, this.treasureHuntResults.wasteWater.baselineEnergyCost, this.treasureHuntResults.wasteWater.modifiedEnergyCost, 'Waste Water');
    }
    if (this.treasureHuntResults.otherFuel.costSavings) {
      this.addCostSavingsItem(this.treasureHuntResults.otherFuel.costSavings, this.treasureHuntResults.otherFuel.baselineEnergyCost, this.treasureHuntResults.otherFuel.modifiedEnergyCost, 'Other Fuel');
    }
    if (this.treasureHuntResults.compressedAir.costSavings) {
      this.addCostSavingsItem(this.treasureHuntResults.compressedAir.costSavings, this.treasureHuntResults.compressedAir.baselineEnergyCost, this.treasureHuntResults.compressedAir.modifiedEnergyCost, 'Compressed Air');
    }
    if (this.treasureHuntResults.steam.costSavings) {
      this.addCostSavingsItem(this.treasureHuntResults.steam.costSavings, this.treasureHuntResults.steam.baselineEnergyCost, this.treasureHuntResults.steam.modifiedEnergyCost, 'Steam');
    }
  }

  setEnergySavingsItems() {
    if (this.treasureHuntResults.electricity.energySavings) {
      this.addEnergySavingsItem(this.treasureHuntResults.electricity.energySavings, this.treasureHuntResults.electricity.baselineEnergyUsage, this.treasureHuntResults.electricity.modifiedEnergyUsage, 'Electricity', 'kWh');
    }
    if (this.treasureHuntResults.naturalGas.energySavings) {
      let unitLabel: string;
      if (this.settings.unitsOfMeasure === 'Imperial') {
        unitLabel = 'MMBtu';
      } else {
        unitLabel = 'GJ';
      }
      this.addEnergySavingsItem(this.treasureHuntResults.naturalGas.energySavings, this.treasureHuntResults.naturalGas.baselineEnergyUsage, this.treasureHuntResults.naturalGas.modifiedEnergyUsage, 'Natural Gas', unitLabel);
    }
    if (this.treasureHuntResults.water.energySavings) {
      let unitLabel: string;
      if (this.settings.unitsOfMeasure === 'Imperial') {
        unitLabel = 'kgal';
      } else {
        unitLabel = 'm<sup>3</sup>';
      }
      this.addEnergySavingsItem(this.treasureHuntResults.water.energySavings, this.treasureHuntResults.water.baselineEnergyUsage, this.treasureHuntResults.water.modifiedEnergyUsage, 'Water', unitLabel);
    }
    if (this.treasureHuntResults.wasteWater.energySavings) {
      let unitLabel: string;
      if (this.settings.unitsOfMeasure === 'Imperial') {
        unitLabel = 'kgal';
      } else {
        unitLabel = 'm<sup>3</sup>';
      }
      this.addEnergySavingsItem(this.treasureHuntResults.wasteWater.energySavings, this.treasureHuntResults.wasteWater.baselineEnergyUsage, this.treasureHuntResults.wasteWater.modifiedEnergyUsage, 'Waste Water', unitLabel);
    }
    if (this.treasureHuntResults.otherFuel.energySavings) {
      let unitLabel: string;
      if (this.settings.unitsOfMeasure === 'Imperial') {
        unitLabel = 'MMBtu';
      } else {
        unitLabel = 'GJ';
      }
      this.addEnergySavingsItem(this.treasureHuntResults.otherFuel.energySavings, this.treasureHuntResults.otherFuel.baselineEnergyUsage, this.treasureHuntResults.otherFuel.modifiedEnergyUsage, 'Other Fuel', unitLabel);
    }
    if (this.treasureHuntResults.compressedAir.energySavings) {
      let unitLabel: string;
      if (this.settings.unitsOfMeasure === 'Imperial') {
        unitLabel = 'kSCF';
      } else {
        unitLabel = 'Nm<sup>3</sup>';
      }
      this.addEnergySavingsItem(this.treasureHuntResults.compressedAir.energySavings, this.treasureHuntResults.compressedAir.baselineEnergyUsage, this.treasureHuntResults.compressedAir.modifiedEnergyUsage, 'Compressed Air', unitLabel);
    }
    if (this.treasureHuntResults.steam.energySavings) {
      let unitLabel: string;
      if (this.settings.unitsOfMeasure === 'Imperial') {
        unitLabel = 'klb';
      } else {
        unitLabel = 'tonne';
      }
      this.addEnergySavingsItem(this.treasureHuntResults.steam.energySavings, this.treasureHuntResults.steam.baselineEnergyUsage, this.treasureHuntResults.steam.modifiedEnergyUsage, 'Steam', unitLabel);
    }
  }

  setCarbonSavingsItems() {
    this.addCarbonSavingsItem(this.treasureHuntResults.co2EmissionsResults.totalCO2Savings, this.treasureHuntResults.co2EmissionsResults.totalCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.totalCO2ProjectedUse, 'Total');
    if (this.treasureHuntResults.co2EmissionsResults.electricityCO2Savings) {
      this.addCarbonSavingsItem(this.treasureHuntResults.co2EmissionsResults.electricityCO2Savings, this.treasureHuntResults.co2EmissionsResults.electricityCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.electricityCO2ProjectedUse, 'Electricity');
    }
    if (this.treasureHuntResults.co2EmissionsResults.naturalGasCO2Savings) {
      this.addCarbonSavingsItem(this.treasureHuntResults.co2EmissionsResults.naturalGasCO2Savings, this.treasureHuntResults.co2EmissionsResults.naturalGasCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.naturalGasCO2ProjectedUse, 'Natural Gas');
    }
    if (this.treasureHuntResults.co2EmissionsResults.waterCO2Savings) {
      this.addCarbonSavingsItem(this.treasureHuntResults.co2EmissionsResults.waterCO2Savings, this.treasureHuntResults.co2EmissionsResults.waterCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.waterCO2ProjectedUse, 'Water');
    }
    if (this.treasureHuntResults.co2EmissionsResults.wasteWaterCO2Savings) {
      this.addCarbonSavingsItem(this.treasureHuntResults.co2EmissionsResults.wasteWaterCO2Savings, this.treasureHuntResults.co2EmissionsResults.wasteWaterCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.wasteWaterCO2ProjectedUse, 'Waste Water');
    }
    if (this.treasureHuntResults.co2EmissionsResults.otherFuelCO2Savings) {
      this.addCarbonSavingsItem(this.treasureHuntResults.co2EmissionsResults.otherFuelCO2Savings, this.treasureHuntResults.co2EmissionsResults.otherFuelCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.otherFuelCO2ProjectedUse, 'Other Fuel');
    }
    if (this.treasureHuntResults.co2EmissionsResults.compressedAirCO2Savings) {
      this.addCarbonSavingsItem(this.treasureHuntResults.co2EmissionsResults.compressedAirCO2Savings, this.treasureHuntResults.co2EmissionsResults.compressedAirCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.compressedAirCO2ProjectedUse, 'Compressed Air');
    }
    if (this.treasureHuntResults.co2EmissionsResults.steamCO2Savings) {
      this.addCarbonSavingsItem(this.treasureHuntResults.co2EmissionsResults.steamCO2Savings, this.treasureHuntResults.co2EmissionsResults.steamCO2CurrentUse, this.treasureHuntResults.co2EmissionsResults.steamCO2ProjectedUse, 'Steam');
    }
  }

}