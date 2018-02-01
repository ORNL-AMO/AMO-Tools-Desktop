import { Component, OnInit, Input } from '@angular/core';
import { EnergyEquivalencyFuel, EnergyEquivalencyElectric, EnergyEquivalencyElectricOutput, EnergyEquivalencyFuelOutput } from '../../../shared/models/phast/energyEquivalency';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-energy-equivalency',
  templateUrl: './energy-equivalency.component.html',
  styleUrls: ['./energy-equivalency.component.css']
})
export class EnergyEquivalencyComponent implements OnInit {
  @Input()
  settings: Settings;

  energyEquivalencyElectric: EnergyEquivalencyElectric = {
    fuelFiredEfficiency: 60,
    electricallyHeatedEfficiency: 90,
    fuelFiredHeatInput: 10
  };
  energyEquivalencyFuel: EnergyEquivalencyFuel = {
    electricallyHeatedEfficiency: 90,
    fuelFiredEfficiency: 60,
    electricalHeatInput: 1800
  };

  energyEquivalencyFuelOutput: EnergyEquivalencyFuelOutput = { fuelFiredHeatInput: 0 };
  energyEquivalencyElectricOutput: EnergyEquivalencyElectricOutput = { electricalHeatInput: 0 };

  currentField: string = 'fuelFiredEfficiency';
  tabSelect: string = 'results';
  constructor(private phastService: PhastService, private indexedDbService: IndexedDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.indexedDbService.getDirectorySettings(1).then(results => {
        if(results){
          this.settings = results[0];
          this.initDefaultValues(this.settings);
          this.calculateElectric();
          this.calculateFuel();
        }
      })
    } else {
      this.initDefaultValues(this.settings);
      this.calculateElectric();
      this.calculateFuel();
    }
  }

  initDefaultValues(settings: Settings) {
    if (settings.unitsOfMeasure == 'Metric') {
      this.energyEquivalencyElectric = {
        fuelFiredEfficiency: 60,
        electricallyHeatedEfficiency: 90,
        fuelFiredHeatInput: this.convertUnitsService.roundVal(this.convertUnitsService.value(10).from('MMBtu').to('GJ'), 2)
      };
    }
    else {
      this.energyEquivalencyElectric = {
        fuelFiredEfficiency: 60,
        electricallyHeatedEfficiency: 90,
        fuelFiredHeatInput: 10
      };
    }
  }

  calculateFuel() {
    this.energyEquivalencyFuelOutput = this.phastService.energyEquivalencyFuel(this.energyEquivalencyFuel, this.settings);
  }

  calculateElectric() {
    this.energyEquivalencyElectricOutput = this.phastService.energyEquivalencyElectric(this.energyEquivalencyElectric, this.settings);
  }

  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }


}
