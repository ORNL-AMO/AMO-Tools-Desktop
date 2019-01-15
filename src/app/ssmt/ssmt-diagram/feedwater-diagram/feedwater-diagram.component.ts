import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-feedwater-diagram',
  templateUrl: './feedwater-diagram.component.html',
  styleUrls: ['./feedwater-diagram.component.css']
})
export class FeedwaterDiagramComponent implements OnInit {
  @Input()
  deaerator: DeaeratorOutput;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }
}
