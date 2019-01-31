import { Component, OnInit, Input } from '@angular/core';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-deaerator-table',
  templateUrl: './deaerator-table.component.html',
  styleUrls: ['./deaerator-table.component.css']
})
export class DeaeratorTableComponent implements OnInit {
  @Input()
  deaerator: DeaeratorOutput;
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit() {
  }

}
