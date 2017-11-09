import { Component, OnInit, Input } from '@angular/core';
import { PreAssessment } from '../../pre-assessment';
import { DesignedEnergyElectricity, DesignedEnergyFuel, DesignedEnergySteam } from '../../../../../shared/models/phast/designedEnergy'

@Component({
  selector: 'app-pre-assessment-designed',
  templateUrl: './pre-assessment-designed.component.html',
  styleUrls: ['./pre-assessment-designed.component.css']
})
export class PreAssessmentDesignedComponent implements OnInit {
  @Input()
  assessment: PreAssessment;
  constructor() { }

  ngOnInit() {
    if(!this.assessment.designedEnergy){
      this.assessment.designedEnergy = {
        designedEnergyElectricity: new Array<DesignedEnergyElectricity>(),
        designedEnergyFuel: new Array<DesignedEnergyFuel>(),
        designedEnergySteam: new Array<DesignedEnergySteam>()
      }
      this.addElectricityZone();
      this.addFuelZone();
      this.addSteamZone();
    }
  }


  addElectricityZone(){
    let eqNum = 1;
    if (this.assessment.designedEnergy.designedEnergyElectricity) {
      eqNum = this.assessment.designedEnergy.designedEnergyElectricity.length + 1;
    }
    let tmpZone: DesignedEnergyElectricity = {
      name: 'Zone #'+eqNum,          
      kwRating: 0,
      percentCapacityUsed: 0,
      percentOperatingHours: 0
    }
    this.assessment.designedEnergy.designedEnergyElectricity.push(tmpZone);
  }

  addFuelZone(){
    let eqNum = 1;
    if (this.assessment.designedEnergy.designedEnergyFuel) {
      eqNum = this.assessment.designedEnergy.designedEnergyFuel.length + 1;
    }
    let tmpZone: DesignedEnergyFuel = {
      name: 'Zone #' + eqNum,
      fuelType: 0,
      percentCapacityUsed: 0,
      totalBurnerCapacity: 0,
      percentOperatingHours: 0
    }
    this.assessment.designedEnergy.designedEnergyFuel.push(tmpZone);
  }

  addSteamZone(){
    let eqNum = 1;
    if (this.assessment.designedEnergy.designedEnergySteam) {
      eqNum = this.assessment.designedEnergy.designedEnergySteam.length + 1;
    }
    let tmpZone: DesignedEnergySteam = {
      name: 'Zone #' + eqNum,
      totalHeat: 0,
      steamFlow: 0,
      percentCapacityUsed: 0,
      percentOperatingHours: 0
    }
    this.assessment.designedEnergy.designedEnergySteam.push(tmpZone);
  }
}
