import { Component, OnInit, Input } from '@angular/core';
import { AuxEquipment } from '../../shared/models/phast/auxEquipment';
import { PHAST } from '../../shared/models/phast/phast';
import * as _ from 'lodash';
@Component({
  selector: 'app-aux-equipment',
  templateUrl: 'aux-equipment.component.html',
  styleUrls: ['aux-equipment.component.css', '../../psat/explore-opportunities/explore-opportunities.component.css']
})
export class AuxEquipmentComponent implements OnInit {
  @Input()
  phast: PHAST;
  tabSelect: string = 'results';
  currentField: string = 'fuelType';

  results: any;
  resultsSum: number = 0;
  constructor() { }

  ngOnInit() {
    if (!this.phast.auxEquipment) {
      this.phast.auxEquipment = new Array<AuxEquipment>();
      this.addEquipment();
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  save() {
    console.log('save');
  }

  calculate() {
    this.results = new Array<any>();
    this.phast.auxEquipment.forEach(equipment => {
      this.results.push({
        name: equipment.name,
        totalPower: this.calcTotalPower(equipment),
        motorPower: equipment.motorPower
      })
    })
    this.resultsSum = _.sumBy(this.results, 'totalPower');
    console.log(this.resultsSum);
  }

  calcTotalPower(equipment: AuxEquipment): number{
    let tmpPower = 0;
    if(equipment.motorPower == 'Calculated'){
      tmpPower = (Math.pow(equipment.motorPhase,.5)*equipment.supplyVoltage*equipment.averageCurrent*equipment.powerFactor*(equipment.dutyCycle/100))/1000;
    }else if(equipment.motorPower == 'Rated'){
      tmpPower = equipment.totalConnectedPower * (equipment.ratedCapacity / 100) * (equipment.dutyCycle / 100)
    }
    return tmpPower;
  }

  setField(str: string) {
    this.currentField = str;
  }

  addEquipment() {
    let tmpAuxEquipment: AuxEquipment = {
      name: 'Equipment #1',
      dutyCycle: 0,
      motorPower: 'Calculated',
      motorPhase: 1,
      supplyVoltage: 0,
      averageCurrent: 0,
      powerFactor: 0,
      totalConnectedPower: 0,
      ratedCapacity: 0
    }
    this.phast.auxEquipment.push(tmpAuxEquipment);
    this.calculate();
  }
}
