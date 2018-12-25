import { Component, OnInit, Input } from '@angular/core';
import { SteamPropertiesOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-makeup-water-diagram',
  templateUrl: './makeup-water-diagram.component.html',
  styleUrls: ['./makeup-water-diagram.component.css']
})
export class MakeupWaterDiagramComponent implements OnInit {
  @Input()
  makeupWater: SteamPropertiesOutput;
  constructor() { }

  ngOnInit() {
  }

}
