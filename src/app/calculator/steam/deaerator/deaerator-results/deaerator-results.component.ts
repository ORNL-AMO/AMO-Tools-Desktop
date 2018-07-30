import { Component, OnInit, Input } from '@angular/core';
import { DeaeratorOutput } from '../../../../shared/models/steam';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-deaerator-results',
  templateUrl: './deaerator-results.component.html',
  styleUrls: ['./deaerator-results.component.css']
})
export class DeaeratorResultsComponent implements OnInit {
  @Input()
  results: DeaeratorOutput;
  @Input()
  settings: Settings;

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
