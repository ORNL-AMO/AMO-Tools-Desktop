import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
@Component({
  selector: 'app-metered-energy-results',
  templateUrl: './metered-energy-results.component.html',
  styleUrls: ['./metered-energy-results.component.css']
})
export class MeteredEnergyResultsComponent implements OnInit {
  @Input()
  results: MeteredEnergyResults;
  @Input()
  settings: Settings;
  @Input()
  label: string;
  resultUnits: { energyPerMassUnit: string, energyPerTimeUnit: string, electricityUsedUnit: string } = {
    energyPerMassUnit: '',
    energyPerTimeUnit: '',
    electricityUsedUnit: ''
  };
  meteredEnergyIntensity: number;
  calculatedEnergyIntensity: number;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (this.settings.energyResultUnit == 'kWh') {
      this.resultUnits.energyPerTimeUnit = this.settings.energyResultUnit;
    } else {
      this.resultUnits.energyPerTimeUnit = this.settings.energyResultUnit + '/hr';
    }
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.resultUnits.energyPerMassUnit = this.settings.energyResultUnit + '/kg';
    } else if (this.settings.unitsOfMeasure == 'Imperial') {
      this.resultUnits.energyPerMassUnit = this.settings.energyResultUnit + '/lb';
    }
    this.resultUnits.electricityUsedUnit = 'kW';
    this.setEnergyIntensity();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.results) {
      this.setEnergyIntensity();
    }
  }

  setEnergyIntensity() {
    if (this.settings.energyResultUnit == 'MMBtu') {
      //   this.calculatedEnergyIntensity = this.convertUnitsService.value(this.results.calculatedEnergyIntensity).from('MMBtu').to('Btu');
      this.calculatedEnergyIntensity = this.results.calculatedEnergyIntensity;
     // this.meteredEnergyIntensity = this.convertUnitsService.value(this.results.meteredEnergyIntensity).from('MMBtu').to('Btu');
      this.meteredEnergyIntensity = this.results.meteredEnergyIntensity;
      this.resultUnits.energyPerMassUnit = 'Btu/lb';
    } else if (this.settings.energyResultUnit == 'GJ') {
      //  this.calculatedEnergyIntensity = this.convertUnitsService.value(this.results.calculatedEnergyIntensity).from('GJ').to('kJ');
      this.calculatedEnergyIntensity = this.results.calculatedEnergyIntensity;
     // this.meteredEnergyIntensity = this.convertUnitsService.value(this.results.meteredEnergyIntensity).from('GJ').to('kJ');
      this.meteredEnergyIntensity = this.results.meteredEnergyIntensity;
      this.resultUnits.energyPerMassUnit = 'kJ/kg';
    } else {
      this.calculatedEnergyIntensity = this.results.calculatedEnergyIntensity;
      this.meteredEnergyIntensity = this.results.meteredEnergyIntensity;
    }
  }

}
