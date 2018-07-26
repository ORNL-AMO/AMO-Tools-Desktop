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
