import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SteamPropertiesOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-makeup-water-diagram',
  templateUrl: './makeup-water-diagram.component.html',
  styleUrls: ['./makeup-water-diagram.component.css']
})
export class MakeupWaterDiagramComponent implements OnInit {
  @Input()
  makeupWater: SteamPropertiesOutput;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }


  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }
}
