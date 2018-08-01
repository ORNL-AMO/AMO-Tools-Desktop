import { Component, OnInit, Input } from '@angular/core';
import { FlashTankOutput } from '../../../../shared/models/steam';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-flash-tank-results',
  templateUrl: './flash-tank-results.component.html',
  styleUrls: ['./flash-tank-results.component.css']
})
export class FlashTankResultsComponent implements OnInit {
  @Input()
  results: FlashTankOutput;
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
