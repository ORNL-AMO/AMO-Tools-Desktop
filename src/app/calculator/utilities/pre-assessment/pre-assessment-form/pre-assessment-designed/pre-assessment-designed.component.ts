import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PreAssessment } from '../../pre-assessment';
import { DesignedEnergyElectricity, DesignedEnergyFuel, DesignedEnergySteam } from '../../../../../shared/models/phast/designedEnergy'

import { Settings } from '../../../../../shared/models/settings';
@Component({
  selector: 'app-pre-assessment-designed',
  templateUrl: './pre-assessment-designed.component.html',
  styleUrls: ['./pre-assessment-designed.component.css']
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
      // this.assessment.designedEnergy = {
      //   designedEnergyElectricity: new Array<DesignedEnergyElectricity>(),
      //   designedEnergyFuel: new Array<DesignedEnergyFuel>(),
      //   designedEnergySteam: new Array<DesignedEnergySteam>()
      // }
      this.addElectricityZone();
      this.addFuelZone();
      this.addSteamZone();
    }
  }

  // addZone() {
  //   if (this.assessment.settings.energySourceType == 'Fuel') {
  //     this.addFuelZone();
  //   } else if (this.assessment.settings.energySourceType == 'Steam') {
  //     this.addSteamZone();
  //   } else if (this.assessment.settings.energySourceType == 'Electricity') {
  //     this.addElectricityZone();
  //   }
  //   else if (this.assessment.settings.energySourceType == 'Hybrid') {
  //     this.addElectricityZone();
  //     this.addFuelZone();
  //   }
  // }

  calculate() {
    this.emitCalculate.emit(true);
  }

  addElectricityZone() {
    let eqNum = 1;
    // if (this.assessment.designedEnergy.designedEnergyElectricity) {
    //   eqNum = this.assessment.designedEnergy.designedEnergyElectricity.length + 1;
    // }
    // let tmpZone: DesignedEnergyElectricity = {
    //   name: 'Electric Zone #' + eqNum,
    //   kwRating: 0,
    //   percentCapacityUsed: 0,
    //   percentOperatingHours: 0
    // }
    // this.assessment.designedEnergy.designedEnergyElectricity.push(tmpZone);
  }

  addFuelZone() {
    let eqNum = 1;
    // if (this.assessment.designedEnergy.designedEnergyFuel) {
    //   eqNum = this.assessment.designedEnergy.designedEnergyFuel.length + 1;
    // }
    // let tmpZone: DesignedEnergyFuel = {
    //   name: 'Fuel Zone #' + eqNum,
    //   fuelType: 0,
    //   percentCapacityUsed: 0,
    //   totalBurnerCapacity: 0,
    //   percentOperatingHours: 0
    // }
    // this.assessment.designedEnergy.designedEnergyFuel.push(tmpZone);
  }

  addSteamZone() {
    let eqNum = 1;
    // if (this.assessment.designedEnergy.designedEnergySteam) {
    //   eqNum = this.assessment.designedEnergy.designedEnergySteam.length + 1;
    // }
    // let tmpZone: DesignedEnergySteam = {
    //   name: 'Steam Zone #' + eqNum,
    //   totalHeat: 0,
    //   steamFlow: 0,
    //   percentCapacityUsed: 0,
    //   percentOperatingHours: 0
    // }
    // this.assessment.designedEnergy.designedEnergySteam.push(tmpZone);
  }

  removeFuelZone(num: number) {
   // this.assessment.designedEnergy.designedEnergyFuel.splice(num, 1);
  }

  removeSteamZone(num: number) {
  //  this.assessment.designedEnergy.designedEnergySteam.splice(num, 1);
  }

  removeElectricityZone(num: number) {
   // this.assessment.designedEnergy.designedEnergyElectricity.splice(num, 1);
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
