import { Component, OnInit, Input } from '@angular/core';
import { SavingsItem, TreasureHuntResults } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings'; 
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
  
  savingsItems: Array<SavingsItem>;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.setSavingsItems();
  }

  setSavingsItems() {
    this.savingsItems = new Array();
    this.addSavingsItem(this.treasureHuntResults.totalSavings, this.treasureHuntResults.totalBaselineCost, this.treasureHuntResults.totalModificationCost, 'Total');
    if (this.treasureHuntResults.electricity.costSavings) {
      this.addSavingsItem(this.treasureHuntResults.electricity.costSavings, this.treasureHuntResults.electricity.baselineEnergyCost, this.treasureHuntResults.electricity.modifiedEnergyCost, 'Electricity');
    }
    if (this.treasureHuntResults.naturalGas.costSavings) {
      this.addSavingsItem(this.treasureHuntResults.naturalGas.costSavings, this.treasureHuntResults.naturalGas.baselineEnergyCost, this.treasureHuntResults.naturalGas.modifiedEnergyCost, 'Natural Gas');
    }
    if (this.treasureHuntResults.water.costSavings) {
      this.addSavingsItem(this.treasureHuntResults.water.costSavings, this.treasureHuntResults.water.baselineEnergyCost, this.treasureHuntResults.water.modifiedEnergyCost, 'Water');
    }
    if (this.treasureHuntResults.wasteWater.costSavings) {
      this.addSavingsItem(this.treasureHuntResults.wasteWater.costSavings, this.treasureHuntResults.wasteWater.baselineEnergyCost, this.treasureHuntResults.wasteWater.modifiedEnergyCost, 'Waste Water');
    }
    if (this.treasureHuntResults.otherFuel.costSavings) {
      this.addSavingsItem(this.treasureHuntResults.otherFuel.costSavings, this.treasureHuntResults.otherFuel.baselineEnergyCost, this.treasureHuntResults.otherFuel.modifiedEnergyCost, 'Other Fuel');
    }
    if (this.treasureHuntResults.compressedAir.costSavings) {
      this.addSavingsItem(this.treasureHuntResults.compressedAir.costSavings, this.treasureHuntResults.compressedAir.baselineEnergyCost, this.treasureHuntResults.compressedAir.modifiedEnergyCost, 'Compressed Air');
    }
    if (this.treasureHuntResults.steam.costSavings) {
      this.addSavingsItem(this.treasureHuntResults.steam.costSavings, this.treasureHuntResults.steam.baselineEnergyCost, this.treasureHuntResults.steam.modifiedEnergyCost, 'Steam');
    }
  }

  addSavingsItem(savings: number, currentCost: number, newCost: number, label: string) {
    this.savingsItems.push({
      savings: savings,
      currentCost: currentCost,
      newCost: newCost,
      label: label + '  Utility Expenditures'
    })
  }

}