import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OtherFuel, otherFuels } from './co2FuelSavingsFuels';
import { eGridRegion, electricityGridRegions } from './electricityGridRegions';
import * as _ from 'lodash';
import { Co2SavingsData } from '../co2-savings.service';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-co2-savings-form',
  templateUrl: './co2-savings-form.component.html',
  styleUrls: ['./co2-savings-form.component.css']
})
export class Co2SavingsFormComponent implements OnInit {
  @Input()
  data: Co2SavingsData;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  modId: string;
  @Input()
  index: number;
  @Input()
  settings: Settings;
  @Input()
  currentField: string;

  otherFuels: Array<OtherFuel>;
  eGridRegions: Array<eGridRegion>;
  fuelOptions: Array<{
    fuelType: string,
    outputRate: number
  }>;
  subregions: Array<{
    subregion: string,
    outputRate: number
  }>;
  constructor() { }

  ngOnInit() {
    this.otherFuels = otherFuels;
    this.eGridRegions = electricityGridRegions;
    // this.setFuelOptions();
    // this.setRegion();
    if (this.data.fuelType) {
      let tmpOtherFuel: OtherFuel = _.find(this.otherFuels, (val) => { return this.data.energySource === val.energySource; });
      this.fuelOptions = tmpOtherFuel.fuelTypes;
    }
    if (this.data.eGridRegion) {
      let tmpRegion: eGridRegion = _.find(this.eGridRegions, (val) => { return this.data.eGridRegion === val.region; });
      this.subregions = tmpRegion.subregions;
    }
    this.calculate();
  }

  changeEnergyType() {
    this.data.eGridRegion = undefined;
    this.data.eGridSubregion = undefined;
    this.data.electricityUse = undefined;
    this.data.totalEmissionOutputRate = undefined;
    this.data.fuelType = undefined;
    this.data.energySource = undefined;
    this.calculate();
  }

  setFuelOptions() {
    let tmpOtherFuel: OtherFuel = _.find(this.otherFuels, (val) => { return this.data.energySource === val.energySource; });
    this.fuelOptions = tmpOtherFuel.fuelTypes;
    this.data.fuelType = undefined;
    this.data.totalEmissionOutputRate = undefined;
  }
  setFuel() {
    let tmpFuel: { fuelType: string, outputRate: number } = _.find(this.fuelOptions, (val) => { return this.data.fuelType === val.fuelType; });
    this.data.totalEmissionOutputRate = tmpFuel.outputRate;
    this.calculate();
  }
  setRegion() {
    let tmpRegion: eGridRegion = _.find(this.eGridRegions, (val) => { return this.data.eGridRegion === val.region; });
    this.subregions = tmpRegion.subregions;
    this.data.eGridSubregion = undefined;
    this.data.totalEmissionOutputRate = undefined;
  }
  setSubRegion() {
    let tmpSubRegion: { subregion: string, outputRate: number } = _.find(this.subregions, (val) => { return this.data.eGridSubregion === val.subregion; });
    this.data.totalEmissionOutputRate = tmpSubRegion.outputRate;
    this.calculate();
  }
  calculate() {
    this.emitCalculate.emit();
  }
}
