import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { BoilerOutput, BoilerInput } from '../../../../shared/models/steam';
import { SteamService } from '../../steam.service';

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
