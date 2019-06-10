import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-saturated-properties-help',
  templateUrl: './saturated-properties-help.component.html',
  styleUrls: ['./saturated-properties-help.component.css']
})
export class SaturatedPropertiesHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  @Input()
  ranges: { minTemp: number, maxTemp: number, minPressure: number, maxPressure: number };
  constructor(private steamService: SteamService) { }

  ngOnInit() {
  }
  getDisplayUnit(unit: string) {
    return this.steamService.getDisplayUnit(unit);
  }
}
