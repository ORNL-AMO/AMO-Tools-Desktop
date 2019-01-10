import { Component, OnInit, Input } from '@angular/core';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-feedwater-diagram',
  templateUrl: './feedwater-diagram.component.html',
  styleUrls: ['./feedwater-diagram.component.css']
})
export class FeedwaterDiagramComponent implements OnInit {
  @Input()
  deaerator: DeaeratorOutput;
  constructor() { }

  ngOnInit() {
  }

}
