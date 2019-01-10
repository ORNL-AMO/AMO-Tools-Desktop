import { Component, OnInit, Input } from '@angular/core';
import { TurbineOutput } from '../../../shared/models/steam/steam-outputs';

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
  constructor() { }

  ngOnInit() {
  }

}
