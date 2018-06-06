import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../../shared/models/phast/phast';
import { PhastService } from '../phast.service';
import { MeteredEnergyResults, MeteredEnergySteam, MeteredEnergyFuel, MeteredEnergyElectricity } from '../../shared/models/phast/meteredEnergy';
import { MeteredEnergyService } from './metered-energy.service';

@Component({
  selector: 'app-metered-energy',
  templateUrl: './metered-energy.component.html',
  styleUrls: ['./metered-energy.component.css']
})
export class MeteredEnergyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();
  @Input()
  containerHeight: number;


  results: MeteredEnergyResults = {
    meteredEnergyUsed: 0,
    meteredEnergyIntensity: 0,
    meteredElectricityUsed: 0,
    calculatedFuelEnergyUsed: 0,
    calculatedEnergyIntensity: 0,
    calculatedElectricityUsed: 0
  };

  tabSelect: string = 'results';
  currentField: string;
  energySource: string;
  constructor(private phastService: PhastService, private meteredEnergyService: MeteredEnergyService) { }

  ngOnInit() {
    if (!this.phast.meteredEnergy) {
      this.initializeNew()
    } else {
      this.initializeExisting();
    }
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
    this.phast.meteredEnergy = {
      meteredEnergyElectricity: this.getEmptyElectricityInput(),
      meteredEnergyFuel: this.getEmptyFuelInput(),
      meteredEnergySteam: this.getEmptySteamInput(),
      fuel: fuel,
      steam: steam,
      electricity: electricity
    }
  }

  initializeExisting() {
    if (!this.phast.meteredEnergy.meteredEnergyElectricity) {
      this.phast.meteredEnergy.meteredEnergyElectricity = this.getEmptyElectricityInput();
    } else if (!this.phast.meteredEnergy.electricity) {
      this.setElectricity();
    }
    if (!this.phast.meteredEnergy.meteredEnergyFuel) {
      this.phast.meteredEnergy.meteredEnergyFuel = this.getEmptyFuelInput();
    } else if (!this.phast.meteredEnergy.fuel) {
      this.setFuel();
    }
    if (!this.phast.meteredEnergy.meteredEnergySteam) {
      this.phast.meteredEnergy.meteredEnergySteam = this.getEmptySteamInput();
    } else if (!this.phast.meteredEnergy.steam) {
      this.setSteam();
    }
  }

  emitSave() {
    this.save.emit(true);
  }

  setElectricity() {
    this.phast.meteredEnergy.electricity = !this.phast.meteredEnergy.electricity;
    if (!this.phast.meteredEnergy.electricity) {
      this.phast.meteredEnergy.meteredEnergyElectricity = this.getEmptyElectricityInput();
    }
    this.calculate();
  }

  setFuel() {
    this.phast.meteredEnergy.fuel = !this.phast.meteredEnergy.fuel;
    if (!this.phast.meteredEnergy.fuel) {
      this.phast.meteredEnergy.meteredEnergyFuel = this.getEmptyFuelInput();
    }
    this.calculate();
  }

  setSteam() {
    this.phast.meteredEnergy.steam = !this.phast.meteredEnergy.steam;
    if (!this.phast.meteredEnergy.steam) {
      this.phast.meteredEnergy.meteredEnergySteam = this.getEmptySteamInput();
    }
    this.calculate();
  }

  calculate() {
    this.results = this.meteredEnergyService.calculateMeteredEnergy(this.phast, this.settings);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setField(currentField: string, energySource: string) {
    this.currentField = currentField;
    this.energySource = energySource;
  }

  getEmptySteamInput(): MeteredEnergySteam {
    return {
      totalHeatSteam: 0,
      flowRate: 0,
      collectionTime: 0,
      electricityUsed: 0,
      electricityCollectionTime: 0
    }
  }

  getEmptyFuelInput(): MeteredEnergyFuel {
    return {
      fuelDescription: 'gas',
      fuelType: 0,
      heatingValue: 0,
      collectionTime: 0,
      electricityUsed: 0,
      electricityCollectionTime: 0,
      fuelEnergy: 0
    }
  }

  getEmptyElectricityInput(): MeteredEnergyElectricity {
    return {
      electricityCollectionTime: 0,
      electricityUsed: 0,
      auxElectricityUsed: 0,
      auxElectricityCollectionTime: 0
    }
  }
}
