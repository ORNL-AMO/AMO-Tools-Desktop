import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { TreasureHunt, EnergyUsage, TreasureHuntResults } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { TreasureHuntReportService } from '../treasure-hunt-report/treasure-hunt-report.service';
import { TreasureHuntService } from '../treasure-hunt.service';
import { Subscription } from 'rxjs';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

@Component({
  selector: 'app-operation-costs',
  templateUrl: './operation-costs.component.html',
  styleUrls: ['./operation-costs.component.css']
})
export class OperationCostsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();

  treasureHuntSub: Subscription;
  treasureHunt: TreasureHunt;
  treasureHuntResults: TreasureHuntResults;
  saveSettingsOnDestroy: boolean = false;
  constructor(private treasureHuntReportService: TreasureHuntReportService, private treasureHuntService: TreasureHuntService,
    private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
      this.initData();
    });
  }

  ngOnDestroy() {
    if (this.saveSettingsOnDestroy == true) {
      this.saveSettings();
    }
    this.treasureHuntSub.unsubscribe();
  }

  initData() {
    if (this.treasureHunt.currentEnergyUsage == undefined) {
      this.initCurrentEnergyUse();
    }

    this.treasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResults(this.treasureHunt, this.settings);
    if (this.treasureHuntResults.electricity.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.electricityUsed) {
      this.treasureHunt.currentEnergyUsage.electricityUsed = true;
    }
    if (this.treasureHuntResults.naturalGas.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.naturalGasUsed) {
      this.treasureHunt.currentEnergyUsage.naturalGasUsed = true;
    }
    if (this.treasureHuntResults.otherFuel.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.otherFuelUsed) {
      this.treasureHunt.currentEnergyUsage.otherFuelUsed = true;
    }
    if (this.treasureHuntResults.water.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.waterUsed) {
      this.treasureHunt.currentEnergyUsage.waterUsed = true;
    }
    if (this.treasureHuntResults.wasteWater.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.wasteWaterUsed) {
      this.treasureHunt.currentEnergyUsage.wasteWaterUsed = true;
    }
    if (this.treasureHuntResults.compressedAir.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.compressedAirUsed) {
      this.treasureHunt.currentEnergyUsage.compressedAirUsed = true;
    }
    if (this.treasureHuntResults.steam.energySavings != 0 && !this.treasureHunt.currentEnergyUsage.steamUsed) {
      this.treasureHunt.currentEnergyUsage.steamUsed = true;
    }
  }

  initCurrentEnergyUse() {
    let defaultUsage: EnergyUsage = {
      electricityUsage: 0,
      electricityCosts: 0,
      electricityUsed: false,
      naturalGasUsage: 0,
      naturalGasCosts: 0,
      naturalGasUsed: false,
      otherFuelUsage: 0,
      otherFuelCosts: 0,
      otherFuelUsed: false,
      waterUsage: 0,
      waterCosts: 0,
      waterUsed: false,
      waterCO2OutputRate: 0,
      wasteWaterUsage: 0,
      wasteWaterCosts: 0,
      wasteWaterUsed: false,
      wasteWaterCO2OutputRate: 0,
      compressedAirUsage: 0,
      compressedAirCosts: 0,
      compressedAirUsed: false,
      compressedAirCO2OutputRate: 0,
      steamUsage: 0,
      steamCosts: 0,
      steamUsed: false,
      steamCO2OutputRate: 0,
    }
    this.treasureHunt.currentEnergyUsage = defaultUsage;
    this.save();
  }


  save() {
    this.treasureHuntService.treasureHunt.next(this.treasureHunt);
  }

  toggleElectricityUsed() {
    if (this.treasureHunt.currentEnergyUsage.electricityUsed != true) {
      this.treasureHunt.currentEnergyUsage.electricityUsed = true;
    } else if (this.treasureHuntResults.electricity.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.electricityUsed = false;
      this.treasureHunt.currentEnergyUsage.electricityUsage = 0;
      this.treasureHunt.currentEnergyUsage.electricityCosts = 0;
    }
    this.save();
  }

  toggleNaturalGasUsed() {
    if (this.treasureHunt.currentEnergyUsage.naturalGasUsed != true) {
      this.treasureHunt.currentEnergyUsage.naturalGasUsed = true;
    } else if (this.treasureHuntResults.naturalGas.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.naturalGasUsed = false;
      this.treasureHunt.currentEnergyUsage.naturalGasUsage = 0;
      this.treasureHunt.currentEnergyUsage.naturalGasCosts = 0;
    }
    this.save();
  }

  toggleOtherFuelUsed() {
    if (this.treasureHunt.currentEnergyUsage.otherFuelUsed != true) {
      this.treasureHunt.currentEnergyUsage.otherFuelUsed = true;
    } else if (this.treasureHuntResults.otherFuel.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.otherFuelUsed = false;
      this.treasureHunt.currentEnergyUsage.otherFuelUsage = 0;
      this.treasureHunt.currentEnergyUsage.otherFuelCosts = 0;
    }
    this.save();
  }

  toggleWaterUsed() {
    if (this.treasureHunt.currentEnergyUsage.waterUsed != true) {
      this.treasureHunt.currentEnergyUsage.waterUsed = true;
    } else if (this.treasureHuntResults.water.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.waterUsed = false;
      this.treasureHunt.currentEnergyUsage.waterUsage = 0;
      this.treasureHunt.currentEnergyUsage.waterCosts = 0;
      this.treasureHunt.currentEnergyUsage.waterCO2OutputRate = 0;
    }
    this.save();
  }

  toggleWasteWaterUsed() {
    if (this.treasureHunt.currentEnergyUsage.wasteWaterUsed != true) {
      this.treasureHunt.currentEnergyUsage.wasteWaterUsed = true;
    } else if (this.treasureHuntResults.wasteWater.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.wasteWaterUsed = false;
      this.treasureHunt.currentEnergyUsage.wasteWaterUsage = 0;
      this.treasureHunt.currentEnergyUsage.wasteWaterCosts = 0;
      this.treasureHunt.currentEnergyUsage.wasteWaterCO2OutputRate = 0;
    }
    this.save();
  }

  toggleCompressedAirUsed() {
    if (this.treasureHunt.currentEnergyUsage.compressedAirUsed != true) {
      this.treasureHunt.currentEnergyUsage.compressedAirUsed = true;
    } else if (this.treasureHuntResults.compressedAir.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.compressedAirUsed = false;
      this.treasureHunt.currentEnergyUsage.compressedAirUsage = 0;
      this.treasureHunt.currentEnergyUsage.compressedAirCosts = 0;
      this.treasureHunt.currentEnergyUsage.compressedAirCO2OutputRate = 0;
    }
    this.save();
  }

  toggleSteamUsed() {
    if (this.treasureHunt.currentEnergyUsage.steamUsed != true) {
      this.treasureHunt.currentEnergyUsage.steamUsed = true;
    } else if (this.treasureHuntResults.steam.energySavings == 0) {
      this.treasureHunt.currentEnergyUsage.steamUsed = false;
      this.treasureHunt.currentEnergyUsage.steamUsage = 0;
      this.treasureHunt.currentEnergyUsage.steamCosts = 0;
      this.treasureHunt.currentEnergyUsage.steamCO2OutputRate = 0;
    }
    this.save();
  }

  setSaveSettings() {
    this.saveSettingsOnDestroy = true;
  }

  saveSettings() {
    this.indexedDbService.putSettings(this.settings).then(
      results => {
        this.settingsDbService.setAll().then(() => {
          //get updated settings
          this.updateSettings.emit(true);
        })
      }
    )
  }
}
