import { Injectable } from '@angular/core';
import { PhastInputs, PHAST } from '../../shared/models/phast/phast';
import { AuxEquipment } from '../../shared/models/phast/auxEquipment';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
@Injectable()
export class AuxEquipmentService {

  constructor(private convertUnitsService: ConvertUnitsService) { }


  calculate(phast: PHAST) {
    let results = new Array<any>();
    phast.auxEquipment.forEach(equipment => {
      results.push({
        name: equipment.name,
        totalPower: this.calcTotalPower(equipment),
        motorPower: equipment.motorPower
      })
    })
    return results;
  }


  getResultsSum(results: any) {
    let sum = 0;
    results.forEach(result => {
      if (result.motorPower == 'Calculated') {
        sum += result.totalPower;
      } else if (result.motorPower == 'Rated') {
        if (result.totalPower != 0) {
          let convert = this.convertUnitsService.value(result.totalPower).from('hp').to('kW');
          sum += convert;
        }
      }
    })
    return sum;
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
}
