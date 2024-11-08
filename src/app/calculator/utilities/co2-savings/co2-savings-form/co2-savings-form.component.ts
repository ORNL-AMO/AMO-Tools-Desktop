import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OtherFuel, otherFuels } from './co2FuelSavingsFuels';
import { eGridRegion, electricityGridRegions } from './electricityGridRegions';
import * as _ from 'lodash';
import { Co2SavingsData } from '../co2-savings.service';
import { Settings } from '../../../../shared/models/settings';
import { EGridService, SubRegionData, SubregionEmissions } from '../../../../shared/helper-services/e-grid.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
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
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

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

  hasValidSubRegion: boolean;
  zipCodeSubRegionData: Array<string>;
  constructor(private egridService: EGridService, private convertUnitsService: ConvertUnitsService) { }

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
    this.setSubRegionData();
    this.calculate();
  }

  setFuelOptions() {
    let tmpOtherFuel: OtherFuel = _.find(this.otherFuels, (val) => { return this.data.energySource === val.energySource; });
    this.fuelOptions = tmpOtherFuel.fuelTypes;
    this.data.fuelType = undefined;
    this.data.totalEmissionOutputRate = undefined;
  }
  setFuel() {
    let fuel: { fuelType: string, outputRate: number } = _.find(this.fuelOptions, (val) => { return this.data.fuelType === val.fuelType; });
    let outputRate = fuel.outputRate;
    if(this.settings.unitsOfMeasure !== 'Imperial'){
      outputRate = this.convertUnitsService.convertInvertedEnergy(outputRate, 'MMBtu', 'GJ');
      outputRate = Number(outputRate.toFixed(3));
    }
    this.data.totalEmissionOutputRate = outputRate;
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


  setZipcode() {
    this.setSubRegionData();
  }

  setSubRegionData() {
    this.zipCodeSubRegionData = [];

    let subRegionData: SubRegionData = _.find(this.egridService.subRegionsByZipcode, (val) => this.data.zipcode === val.zip);
    if (subRegionData) {
      subRegionData.subregions.forEach(subregion => {
        if (subregion !== '') {
          this.zipCodeSubRegionData.push(subregion);
        }
      });
      if (!this.data.eGridSubregion) {
        // set the first from the subregion list as default
        this.data.eGridSubregion = this.zipCodeSubRegionData[0];
      }

      this.hasValidSubRegion = true;
      if (this.zipCodeSubRegionData.length === 0) {
        // none found - form select is hidden, set form val to null
        this.data.eGridSubregion = undefined;
      } 
    } else {
      this.data.eGridSubregion = undefined;
    }

    this.setSubRegionEmissionsOutput();
  }


  setSubRegionEmissionsOutput() {
    let subregionEmissions: SubregionEmissions = this.egridService.findEGRIDCO2Emissions(this.data.eGridSubregion);

    if (subregionEmissions) {
      this.data.totalEmissionOutputRate = subregionEmissions.co2Emissions
      this.calculate();
    }
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }
  calculate() {
    this.emitCalculate.emit();
  }
}
