import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }


  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  hoverPressure() {
    if (this.inletPressure == 'high-pressure') {
      this.emitSetHover.emit('highPressureHovered');
    } else if (this.inletPressure == 'low-pressure') {
      this.emitSetHover.emit('lowPressureHovered');
    }
  }
}
