import { Component, OnInit, Input } from '@angular/core';
import { ProcessSteamUsage } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-steam-usage-table',
  templateUrl: './steam-usage-table.component.html',
  styleUrls: ['./steam-usage-table.component.css']
})
export class SteamUsageTableComponent implements OnInit {
  @Input()
  processSteamUsage: ProcessSteamUsage;
  @Input()
  name: string;
  
  constructor() { }

  ngOnInit() {
  }

}
