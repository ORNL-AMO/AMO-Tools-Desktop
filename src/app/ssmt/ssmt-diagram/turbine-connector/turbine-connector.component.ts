import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-turbine-connector',
  templateUrl: './turbine-connector.component.html',
  styleUrls: ['./turbine-connector.component.css']
})
export class TurbineConnectorComponent implements OnInit {
  @Input()
  inletColor: string;
  @Input()
  noOutletConnection: boolean;
  @Input()
  noInletConnection: boolean;
  constructor() { }

  ngOnInit() {
  }

}
