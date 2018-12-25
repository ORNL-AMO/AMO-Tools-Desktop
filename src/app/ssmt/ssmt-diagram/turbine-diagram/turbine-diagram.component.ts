import { Component, OnInit, Input } from '@angular/core';
import { TurbineOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-turbine-diagram',
  templateUrl: './turbine-diagram.component.html',
  styleUrls: ['./turbine-diagram.component.css']
})
export class TurbineDiagramComponent implements OnInit {
  @Input()
  turbine: TurbineOutput;
  @Input()
  inletColor: string;
  @Input()
  outletColor: string;
  @Input()
  noOutletConnection: boolean;
  
  constructor() { }

  ngOnInit() {
  }

}
