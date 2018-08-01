import { Component, OnInit, Input } from '@angular/core';
import { PrvOutput } from '../../../../shared/models/steam';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-prv-results',
  templateUrl: './prv-results.component.html',
  styleUrls: ['./prv-results.component.css']
})
export class PrvResultsComponent implements OnInit {
  @Input()
  results: PrvOutput;
  @Input()
  settings: Settings;
  @Input()
  isSuperHeating: boolean;
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
