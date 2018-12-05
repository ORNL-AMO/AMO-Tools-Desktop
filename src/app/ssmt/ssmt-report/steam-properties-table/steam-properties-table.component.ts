import { Component, OnInit, Input } from '@angular/core';
import { SteamPropertiesOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-steam-properties-table',
  templateUrl: './steam-properties-table.component.html',
  styleUrls: ['./steam-properties-table.component.css']
})
export class SteamPropertiesTableComponent implements OnInit {
  @Input()
  steamProperties: SteamPropertiesOutput;
  @Input()
  name: string;

  volumeFlow: number;
  constructor() { }

  ngOnInit() {
    this.volumeFlow = this.steamProperties.specificVolume * this.steamProperties.massFlow;
  }

}
