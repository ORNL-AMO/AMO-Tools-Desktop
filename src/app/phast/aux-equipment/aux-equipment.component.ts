import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuxEquipment } from '../../shared/models/phast/auxEquipment';
import { PHAST } from '../../shared/models/phast/phast';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import * as _ from 'lodash';
import { AuxEquipmentService } from './aux-equipment.service';
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
  @Input()
  containerHeight: number;
  
  tabSelect: string = 'results';
  currentField: string = 'fuelType';

  results: any;
  resultsSum: number = 0;
  constructor(private convertUnitsService: ConvertUnitsService, private auxEquipmentService: AuxEquipmentService) { }

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
    this.results = this.auxEquipmentService.calculate(this.phast);
    this.resultsSum = this.auxEquipmentService.getResultsSum(this.results);
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
