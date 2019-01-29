import { Component, OnInit, Input } from '@angular/core';
import { TurbineOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-turbine-table',
  templateUrl: './turbine-table.component.html',
  styleUrls: ['./turbine-table.component.css']
})
export class TurbineTableComponent implements OnInit {
  @Input()
  turbine: TurbineOutput;
  @Input()
  turbineName: string;
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit() {
  }

}
