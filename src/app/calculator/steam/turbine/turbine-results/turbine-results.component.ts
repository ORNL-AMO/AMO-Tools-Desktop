import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { TurbineOutput } from '../../../../shared/models/steam';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-turbine-results',
  templateUrl: './turbine-results.component.html',
  styleUrls: ['./turbine-results.component.css']
})
export class TurbineResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: TurbineOutput;
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
      if (unit != 'kWh') {
        return this.steamService.getDisplayUnit(unit);
      }else{
        return 'kW'
      }
    } else {
      return unit;
    }
  }
}
