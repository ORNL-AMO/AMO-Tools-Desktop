import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-flash-tank-diagram',
  templateUrl: './flash-tank-diagram.component.html',
  styleUrls: ['./flash-tank-diagram.component.css']
})
export class FlashTankDiagramComponent implements OnInit {
  @Input()
  flashTank: FlashTankOutput;
  @Input()
  steamPressure: string;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }
  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  hoverCondensate() {
    this.emitSetHover.emit('condensateHovered');
  }

  hoverHeader() {
    if (this.steamPressure == 'high-pressure') {
      this.emitSetHover.emit('highPressureHovered');
    } else if (this.steamPressure == 'medium-pressure') {
      this.emitSetHover.emit('mediumPressureHovered');
    } else if (this.steamPressure == 'low-pressure') {
      this.emitSetHover.emit('lowPressureHovered');
    }
  }
}
