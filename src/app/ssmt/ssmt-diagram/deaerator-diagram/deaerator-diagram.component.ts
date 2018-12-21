import { Component, OnInit, Input } from '@angular/core';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-deaerator-diagram',
  templateUrl: './deaerator-diagram.component.html',
  styleUrls: ['./deaerator-diagram.component.css']
})
export class DeaeratorDiagramComponent implements OnInit {
  @Input()
  deaerator: DeaeratorOutput;
  @Input()
  inletPressure: string;
  constructor() { }

  ngOnInit() {
  }

}
