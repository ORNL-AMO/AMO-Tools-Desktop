import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MeteredEnergyElectricity, MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { PHAST } from '../../../shared/models/phast/phast';
import { PhastService } from '../../phast.service';
import { Settings } from '../../../shared/models/settings';
import { MeteredEnergyService } from '../metered-energy.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-metered-electricity',
  templateUrl: './metered-electricity.component.html',
  styleUrls: ['./metered-electricity.component.css', '../../aux-equipment/aux-equipment.component.css', '../../../psat/explore-opportunities/explore-opportunities.component.css']
})
export class MeteredElectricityComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();

  tabSelect: string = 'results';
  resultsSum: MeteredEnergyResults = {
    meteredEnergyUsed: 0,
    meteredEnergyIntensity: 0,
    meteredElectricityUsed: 0,
    calculatedFuelEnergyUsed: 0,
    calculatedEnergyIntensity: 0,
    calculatedElectricityUsed: 0
  };

  electricResults: MeteredEnergyResults = {
    meteredEnergyUsed: 0,
    meteredEnergyIntensity: 0,
    meteredElectricityUsed: 0,
    calculatedFuelEnergyUsed: 0,
    calculatedEnergyIntensity: 0,
    calculatedElectricityUsed: 0
  }

  fuelResults: MeteredEnergyResults = {
    meteredEnergyUsed: 0,
    meteredEnergyIntensity: 0,
    meteredElectricityUsed: 0,
    calculatedFuelEnergyUsed: 0,
    calculatedEnergyIntensity: 0,
    calculatedElectricityUsed: 0
  }
  currentField: string = 'fuelType';
  constructor(private phastService: PhastService, private meteredEnergyService: MeteredEnergyService, private convertUnitsService: ConvertUnitsService) { }


  ngOnInit() {
    if (!this.phast.meteredEnergy.meteredEnergyElectricity) {
      this.phast.meteredEnergy.meteredEnergyElectricity = {
        electricityCollectionTime: 0,
        electricityUsed: 0,
        auxElectricityUsed: 0,
        auxElectricityCollectionTime: 0
      };
    }
    if (!this.phast.meteredEnergy.meteredEnergyFuel) {
      this.phast.meteredEnergy.meteredEnergyFuel = {
        fuelDescription: 'gas',
        fuelType: 0,
        heatingValue: 0,
        collectionTime: 0,
        electricityUsed: 0,
        electricityCollectionTime: 0,
        fuelEnergy: 0
      };
    }
    this.calculate();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  save() {
    this.emitSave.emit(true);
  }

  calculate() {
    this.fuelResults = this.meteredEnergyService.meteredFuel(this.phast.meteredEnergy.meteredEnergyFuel, this.phast, this.settings);
    this.fuelResults = this.convertFuelResults(this.fuelResults);
    this.electricResults = this.meteredEnergyService.meteredElectricity(this.phast.meteredEnergy.meteredEnergyElectricity, this.phast, this.settings);
    this.resultsSum = {
      meteredEnergyUsed: this.electricResults.meteredEnergyUsed + this.fuelResults.meteredEnergyUsed,
      meteredEnergyIntensity: this.electricResults.meteredEnergyIntensity + this.fuelResults.meteredEnergyIntensity,
      meteredElectricityUsed: this.fuelResults.meteredElectricityUsed + this.electricResults.meteredElectricityUsed,
      calculatedFuelEnergyUsed: this.electricResults.calculatedFuelEnergyUsed,
      calculatedEnergyIntensity: this.electricResults.calculatedEnergyIntensity,
      calculatedElectricityUsed: this.electricResults.calculatedElectricityUsed
    }
  }

  convertFuelResults(results: MeteredEnergyResults): MeteredEnergyResults{
    if(this.settings.unitsOfMeasure == 'Metric'){
      results.meteredEnergyUsed = this.convertUnitsService.value(results.meteredEnergyUsed).from('GJ').to('kWh');
      results.meteredEnergyIntensity = this.convertUnitsService.value(results.meteredEnergyIntensity).from('GJ').to('kWh');
    }else{
      results.meteredEnergyUsed = this.convertUnitsService.value(results.meteredEnergyUsed).from('MMBtu').to('kWh');
      results.meteredEnergyIntensity = this.convertUnitsService.value(results.meteredEnergyIntensity).from('MMBtu').to('kWh');
    }
    return results;
  }

  setField(str: string) {
    this.currentField = str;
  }
}
