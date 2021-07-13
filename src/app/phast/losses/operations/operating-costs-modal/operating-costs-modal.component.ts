import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OperatingSrcInput, OperatingSrcOutput } from "../../../../shared/models/standalone";
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from './losses.service';

//import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-operating-costs-modal',
  templateUrl: './operating-costs-modal.component.html',
  styleUrls: ['./operating-costs-modal.component.css']
})
export class OperatingCostsModalComponent implements OnInit {

  //@Input()
  //settings: Settings;
  @Input()
  inputs: OperatingSrcInput;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<OperatingSrcInput>();

  showModal: boolean = false;

  @ViewChild('operatingCostModal', { static: false }) public operatingCostModal: ModalDirective;

  fuels: Array<OperatingFuel> = [
    {
      name: 'string',
      usage: 0,
      cost: 0
  }
  ];
  /*
  steams: Array<OperatingSteam> = [
    {
      name: 'string',
      usage: 0,
      cost: 0
  }
  ];

  electrics: Array<OperatingElectric> = [
    {
      name: 'string',
      usage: 0,
      cost: 0
  }
  ];
  */
  constructor() { }

  ngOnInit(): void {
  }

  addFuel() {
    let newFuel = {
      name: 'string',
      usage: 0,
      cost: 0,
    };
    if (!this.fuels) {
      this.fuels = new Array<OperatingFuel>();
    }
    this.fuels.push(newFuel);
  }

  deleteFuel(i: number) {
    this.fuels.splice(i, 1);
    this.emitChange();
  }
  
  changeField(str: string) {
    this.emitChangeField.emit(str);
  }


  calculateMixedFuelCosts() {
    let length = this.fuels.length;
    let sum = 0;
    for (let i = 0; i < length; i++){
      sum += this.fuels[i].usage * this.fuels[i].cost;
    }
    return sum;
  }
  // Emit reuslt back to operating costs page/assessment
  getFuelCost() {
    this.operatingCostModal.patchValue({
      fuelCost: this.calculateMixedFuelCosts()
    });
    this.save();
  }
/*
  calculateMixedSteamCosts() {
    var length = this.steams.length;
    var sum = 0;
    for (let i = 0; i < length; i++){
      sum += this.steams[i].usage * this.steams[i].cost;
    }
    // Emit reuslt back to operating costs page/assessment
  }


calculateMixedElectricCosts() {
    var length = this.electrics.length;
    var sum = 0;
    for (let i = 0; i < length; i++){
      sum += this.electrics[i].usage * this.electrics[i].cost;
    }
    // Emit reuslt back to operating costs page/assessment
  }
*/
  emitChange() {
    this.emitCalculate.emit(this.inputs);
  }

  showOperatingCostModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(true);
    this.operatingCostModal.show();
  }

  hideOperatingCostModal(event?: any) {
    this.materialModal.hide();
    this.showModal = false;
    this.lossesService.modalOpen.next(false);
  }


}

export interface OperatingFuel {
    name: string,
    usage: number,
    cost: number
}
/*
export interface OperatingSteam {
    name: string,
    usage: number,
    cost: number
}

export interface OperatingElectric {
    name: string,
    usage: number,
    cost: number
}
*/