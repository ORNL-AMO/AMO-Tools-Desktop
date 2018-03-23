import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { DesignedEnergyResults } from '../../../shared/models/phast/designedEnergy';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-designed-energy-results',
  templateUrl: './designed-energy-results.component.html',
  styleUrls: ['./designed-energy-results.component.css']
})
export class DesignedEnergyResultsComponent implements OnInit {
  @Input()
  results: DesignedEnergyResults;
  @Input()
  settings: Settings;
  @Input()
  title: string;
  resultUnits: { energyPerMassUnit: string, energyPerTimeUnit: string, electricityUsedUnit: string } = {
    energyPerMassUnit: '',
    energyPerTimeUnit: '',
    electricityUsedUnit: ''
  };
  designedEnergyIntensity: number;
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
      this.calculatedEnergyIntensity = this.convertUnitsService.value(this.results.calculatedEnergyIntensity).from('MMBtu').to('Btu');
      this.designedEnergyIntensity = this.convertUnitsService.value(this.results.designedEnergyIntensity).from('MMBtu').to('Btu');
      this.resultUnits.energyPerMassUnit = 'Btu/hr';
    } else if (this.settings.energyResultUnit == 'GJ') {
      this.calculatedEnergyIntensity = this.convertUnitsService.value(this.results.calculatedEnergyIntensity).from('GJ').to('kJ');
      this.designedEnergyIntensity = this.convertUnitsService.value(this.results.designedEnergyIntensity).from('GJ').to('kJ');
      this.resultUnits.energyPerMassUnit = 'kJ/hr';
    }else{
      this.calculatedEnergyIntensity = this.results.calculatedEnergyIntensity;
      this.designedEnergyIntensity = this.results.designedEnergyIntensity;
    }
  }
}
