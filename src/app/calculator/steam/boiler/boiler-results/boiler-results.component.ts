import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { BoilerInput } from '../../../../shared/models/steam/steam-inputs';
import { SteamService } from '../../steam.service';
import { BoilerOutput } from '../../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-boiler-results',
  templateUrl: './boiler-results.component.html',
  styleUrls: ['./boiler-results.component.css']
})
export class BoilerResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: BoilerOutput;
  @Input()
  inputData: BoilerInput;
  energyMeasurement: string;
  constructor(private steamService: SteamService) { }

  ngOnInit() {
    if (this.settings.steamEnergyMeasurement == 'kWh') {
      this.energyMeasurement = 'kW';
    } else {
      this.energyMeasurement = this.settings.steamEnergyMeasurement + '/hr';
    }
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      return this.steamService.getDisplayUnit(unit);
    } else {
      return unit;
    }
  }
  
}
