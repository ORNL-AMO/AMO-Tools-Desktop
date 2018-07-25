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

  constructor(private steamService: SteamService) { }

  ngOnInit() {
  }
  getDisplayUnit(unit: string) {
    if (unit) {
      return this.steamService.getDisplayUnit(unit);
    } else {
      return unit;
    }
  }

}
