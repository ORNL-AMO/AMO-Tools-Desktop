import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PreAssessment } from '../../pre-assessment';
import { DesignedEnergyElectricity, DesignedEnergyFuel, DesignedEnergySteam, DesignedZone } from '../../../../../shared/models/phast/designedEnergy';

import { Settings } from '../../../../../shared/models/settings';
@Component({
    selector: 'app-pre-assessment-designed',
    templateUrl: './pre-assessment-designed.component.html',
    styleUrls: ['./pre-assessment-designed.component.css'],
    standalone: false
})
export class PreAssessmentDesignedComponent implements OnInit {
  @Input()
  assessment: PreAssessment;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<{ inputField: string, energyType: string }>();
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
    if (!this.assessment.designedEnergy) {
      this.initializeNew();
    }
  }

  initializeNew() {
    this.assessment.designedEnergy = {
      zones: new Array<DesignedZone>(),
      fuel: this.assessment.fuel,
      steam: this.assessment.steam,
      electricity: this.assessment.electric
    };
    this.addZone();
  }

  setElectricity() {
    this.assessment.designedEnergy.electricity = !this.assessment.designedEnergy.electricity;
    if (!this.assessment.designedEnergy.electricity) {
      this.assessment.designedEnergy.zones.forEach(zone => {
        zone.designedEnergyElectricity = this.getEmptyElectricityInput();
      });
    }
    this.calculate();
  }

  setFuel() {
    this.assessment.designedEnergy.fuel = !this.assessment.designedEnergy.fuel;
    if (!this.assessment.designedEnergy.fuel) {
      this.assessment.designedEnergy.zones.forEach(zone => {
        zone.designedEnergyFuel = this.getEmptyFuelInput();
      });
    }
    this.calculate();
  }

  setSteam() {
    this.assessment.designedEnergy.steam = !this.assessment.designedEnergy.steam;
    if (!this.assessment.designedEnergy.steam) {
      this.assessment.designedEnergy.zones.forEach(zone => {
        zone.designedEnergySteam = this.getEmptySteamInput();
      });
    }
    this.calculate();
  }


  addZone() {
    let zoneNum: number = this.assessment.designedEnergy.zones.length + 1;
    this.assessment.designedEnergy.zones.push({
      name: 'Zone #' + zoneNum,
      designedEnergyElectricity: this.getEmptyElectricityInput(),
      designedEnergyFuel: this.getEmptyFuelInput(),
      designedEnergySteam: this.getEmptySteamInput()
    });
    this.calculate();
  }

  removeZone(index: number) {
    this.assessment.designedEnergy.zones.splice(index, 1);
    this.calculate();
  }

  getEmptySteamInput(): DesignedEnergySteam {
    return {
      totalHeat: 0,
      steamFlow: 0,
      percentCapacityUsed: 0,
      operatingHours: 0
    };
  }

  getEmptyFuelInput(): DesignedEnergyFuel {
    return {
      fuelType: 0,
      percentCapacityUsed: 0,
      totalBurnerCapacity: 0,
      operatingHours: 0
    };
  }

  getEmptyElectricityInput(): DesignedEnergyElectricity {
    return {
      kwRating: 0,
      percentCapacityUsed: 0,
      operatingHours: 0
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
