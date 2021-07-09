import { Component, OnInit, Input } from '@angular/core';
import { OperatingCostService } from '../../../shared/operating-cost/operating-cost.service';
import { OperatingCostService } from './operating-cost.service';

@Component({
  selector: 'app-operating-cost',
  templateUrl: './operating-cost.component.html',
  styleUrls: ['./operating-cost.component.css']
})
export class OperatingCostComponent implements OnInit {
  @Input()
  inAssessment: boolean;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<{ inputField: string, energyType: string }>();
  
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
    if (!this.assessment.OperatingCost) {
      this.initializeNew();
    }
  }
  
    initializeNew() {
    this.assessment.operatingCost = {
      fuel: new Array<fuelType>(),
      steam: new Array<steamType>(),
      electricity: new Array<electricityType>(),
    };
  }

  setElectricity() {
    this.assessment.operatingCost.electricity = !this.assessment.operatingCost.electricity;
    if (!this.assessment.operatingCost.electricity) {
      this.assessment.operatingCost.electricity.forEach(electricity => {
        electricity.electricityType = this.getEmptyElectricInput();
      });
    }
    this.calculate();
  }

  setFuel() {
    this.assessment.operatingCost.fuel = !this.assessment.operatingCost.fuel;
    if (!this.assessment.operatingCost.fuel) {
      this.assessment.operatingCost.fuel.forEach(fuel => {
        fuel.fuelType = this.getEmptyFuelInput();
      });
    }
    this.calculate();
  }

  setSteam() {
    this.assessment.operatingCost.steam = !this.assessment.operatingCost.steam;
    if (!this.assessment.operatingCost.steam) {
      this.assessment.operatingCost.steam.forEach(steam => {
        steam.steamType = this.getEmptySteamInput();
      });
    }
    this.calculate();
  }

  addElectricity() {
    let electricityNum: number = this.assessment.operatingCost.electricity.length + 1;
    this.assessment.operatingCost.electricity.push({
      name: 'Electricity #' + electricityNum,
      operatingCostElectricity: this.getEmptyElectricityInput(),
      });
    this.calculate();
  }

  addFuel() {
    let fuelNum: number = this.assessment.operatingCost.zones.length + 1;
    this.assessment.operatingCost.zones.push({
      name: 'Fuel #' + fuelNum,
      operatingCostFuel: this.getEmptyFuelInput(),
      });
    this.calculate();
  }

  addSteam() {
    let steamNum: number = this.assessment.operatingCost.steam.length + 1;
    this.assessment.operatingCost.steam.push({
      name: 'Steam #' + steamNum,
      operatingCostSteam: this.getEmptySteamInput()
    });
    this.calculate();
  }

  removeFuel(index: number) {
    this.assessment.operatingCost.fuel.splice(index, 1);
    this.calculate();
  }

  removeSteam(index: number) {
    this.assessment.operatingCost.steam.splice(index, 1);
    this.calculate();
  }

  removeElectricity(index: number) {
    this.assessment.operatingCost.electricity.splice(index, 1);
    this.calculate();
  }

  getEmptySteamInput(): OperatingCostSteam {
    return {
      steamName: "",
      steamFrac: 0,
      steamCost: 0,
    };
  }

  getEmptyFuelInput(): OperatingCostFuel {
    return {
      fuelName: "",
      fuelFrac: 0,
      fuelCost: 0,
    };
  }

  getEmptyElectricityInput(): OperatingCostElectricity {
    return {
      electricName: "",
      electricFrac: 0,
      electricCost: 0
    };
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

  changeFuelField(str: string) {
    this.emitChangeField.emit({ inputField: str, energyType: 'Fuel' });
  }

  changeElectricField(str: string) {
    this.emitChangeField.emit({ inputField: str, energyType: 'Electric' });
  }

  changeSteamField(str: string) {
    this.emitChangeField.emit({ inputField: str, energyType: 'Steam' });
  }
}