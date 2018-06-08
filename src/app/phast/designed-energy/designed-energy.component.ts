import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../../shared/models/phast/phast';
import { DesignedEnergyElectricity, DesignedEnergyFuel, DesignedEnergySteam, DesignedEnergyResults, DesignedZone } from '../../shared/models/phast/designedEnergy'
import { DesignedEnergyService } from './designed-energy.service';
@Component({
  selector: 'app-designed-energy',
  templateUrl: './designed-energy.component.html',
  styleUrls: ['./designed-energy.component.css']
})
export class DesignedEnergyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();
  @Input()
  containerHeight: number;

  results: DesignedEnergyResults = {
    designedEnergyUsed: 0,
    designedEnergyIntensity: 0,
    designedElectricityUsed: 0,
    calculatedFuelEnergyUsed: 0,
    calculatedEnergyIntensity: 0,
    calculatedElectricityUsed: 0
  };

  tabSelect: string = 'results';
  currentField: string;
  energySource: string;
  constructor(private designedEnergyService: DesignedEnergyService) { }

  ngOnInit() {
    if (!this.phast.designedEnergy) {
      this.initializeNew()
    }
    this.calculate();
  }

  initializeNew() {
    let steam: boolean = false;
    let electricity: boolean = false;
    let fuel: boolean = false;
    if (this.settings.energySourceType == 'Steam') {
      steam = true;
    }
    if (this.settings.energySourceType == 'Fuel') {
      fuel = true;
    }
    if (this.settings.energySourceType == 'Electricity') {
      electricity = true;
    }
    this.phast.designedEnergy = {
      zones: new Array<DesignedZone>(),
      fuel: fuel,
      steam: steam,
      electricity: electricity
    }
    this.addZone();
  }

  emitSave() {
    this.save.emit(true);
  }

  setElectricity() {
    this.phast.designedEnergy.electricity = !this.phast.designedEnergy.electricity;
    if (!this.phast.designedEnergy.electricity) {
      this.phast.designedEnergy.zones.forEach(zone => {
        zone.designedEnergyElectricity = this.getEmptyElectricityInput();
      })
    }
    this.calculate();
  }

  setFuel() {
    this.phast.designedEnergy.fuel = !this.phast.designedEnergy.fuel;
    if (!this.phast.designedEnergy.fuel) {
      this.phast.designedEnergy.zones.forEach(zone => {
        zone.designedEnergyFuel = this.getEmptyFuelInput();
      })
    }
    this.calculate();
  }

  setSteam() {
    this.phast.designedEnergy.steam = !this.phast.designedEnergy.steam;
    if (!this.phast.designedEnergy.steam) {
      this.phast.designedEnergy.zones.forEach(zone => {
        zone.designedEnergySteam = this.getEmptySteamInput();
      })
    }
    this.calculate();
  }

  calculate() {
    this.results = this.designedEnergyService.calculateDesignedEnergy(this.phast, this.settings);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setField(currentField: string, energySource: string) {
    this.currentField = currentField;
    this.energySource = energySource;
  }

  addZone() {
    let zoneNum: number = this.phast.designedEnergy.zones.length + 1;
    this.phast.designedEnergy.zones.push({
      name: 'Zone #' + zoneNum,
      designedEnergyElectricity: this.getEmptyElectricityInput(),
      designedEnergyFuel: this.getEmptyFuelInput(),
      designedEnergySteam: this.getEmptySteamInput()
    })
    this.calculate();
  }

  removeZone(index: number){
    this.phast.designedEnergy.zones.splice(index,1);
    this.calculate();
  }

  getEmptySteamInput(): DesignedEnergySteam {
    return {
      totalHeat: 0,
      steamFlow: 0,
      percentCapacityUsed: 0,
      percentOperatingHours: 0
    }
  }

  getEmptyFuelInput(): DesignedEnergyFuel {
    return {
      fuelType: 0,
      percentCapacityUsed: 0,
      totalBurnerCapacity: 0,
      percentOperatingHours: 0
    }
  }

  getEmptyElectricityInput(): DesignedEnergyElectricity {
    return {
      kwRating: 0,
      percentCapacityUsed: 0,
      percentOperatingHours: 0
    }
  }

}
