import { Component, OnInit, Input } from '@angular/core';
import { HeatLossOutput } from '../../../../shared/models/steam';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-heat-loss-results',
  templateUrl: './heat-loss-results.component.html',
  styleUrls: ['./heat-loss-results.component.css']
})
export class HeatLossResultsComponent implements OnInit {
  @Input()
  results: HeatLossOutput;
  @Input()
  settings: Settings;
  @Input()
  percentHeatLoss: number;
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
