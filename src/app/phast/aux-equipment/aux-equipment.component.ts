import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuxEquipment } from '../../shared/models/phast/auxEquipment';
import { PHAST } from '../../shared/models/phast/phast';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-aux-equipment',
  templateUrl: 'aux-equipment.component.html',
  styleUrls: ['aux-equipment.component.css', '../../psat/explore-opportunities/explore-opportunities.component.css']
})
export class AuxEquipmentComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();

  tabSelect: string = 'results';
  currentField: string = 'fuelType';

  results: any;
  resultsSum: number = 0;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.phast.auxEquipment) {
      this.phast.auxEquipment = new Array<AuxEquipment>();
      this.addEquipment();
    }else {
      this.calculate();
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  emitSave() {
    this.save.emit(true);
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
    this.getResultsSum();
  }


  getResultsSum() {
    let sum = 0;
    this.results.forEach(result => {
      if (result.motorPower == 'Calculated') {
        sum += result.totalPower;
      } else if (result.motorPower == 'Rated') {
        if (result.totalPower != 0) {
          let convert = this.convertUnitsService.value(result.totalPower).from('hp').to('kW');
          sum += convert;
        }
      }
    })
    this.resultsSum = sum;
  }

  calcTotalPower(equipment: AuxEquipment): number {
    let tmpPower = 0;
    if (equipment.motorPower == 'Calculated') {
      tmpPower = (Math.pow(Number(equipment.motorPhase), .5) * equipment.supplyVoltage * equipment.averageCurrent * equipment.powerFactor * (equipment.dutyCycle / 100)) / 1000;
    } else if (equipment.motorPower == 'Rated') {
      tmpPower = equipment.totalConnectedPower * (equipment.ratedCapacity / 100) * (equipment.dutyCycle / 100)
    }
    return tmpPower;
  }

  setField(str: string) {
    this.currentField = str;
  }

  addEquipment() {
    let eqNum = 1;
    if (this.phast.auxEquipment) {
      eqNum = this.phast.auxEquipment.length + 1;
    }
    let tmpAuxEquipment: AuxEquipment = {
      name: 'Equipment #' + eqNum,
      dutyCycle: 100,
      motorPower: 'Calculated',
      motorPhase: '3',
      supplyVoltage: 0,
      averageCurrent: 0,
      powerFactor: .85,
      totalConnectedPower: 0,
      ratedCapacity: 0
    }
    this.phast.auxEquipment.push(tmpAuxEquipment);
    this.calculate();
  }

  removeEquipment(index: number) {
    this.phast.auxEquipment.splice(index, 1);
    this.calculate();
  }
}
