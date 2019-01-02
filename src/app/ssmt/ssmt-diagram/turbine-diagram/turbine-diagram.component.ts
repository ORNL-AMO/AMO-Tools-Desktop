import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  hoverInlet() {
    if (this.inletColor == 'makeup-water') {
      this.emitSetHover.emit('makeupWaterCondensateHovered');
    } else if (this.inletColor == 'low-pressure') {
      this.emitSetHover.emit('lowPressureHovered');
    } else if (this.inletColor == 'medium-pressure') {
      this.emitSetHover.emit('mediumPressureHovered');
    } else if (this.inletColor == 'high-pressure') {
      this.emitSetHover.emit('highPressureHovered');
    }
  }

  hoverOutlet() {
    if (this.outletColor == 'makeup-water') {
      this.emitSetHover.emit('makeupWaterCondensateHovered');
    } else if (this.outletColor == 'low-pressure') {
      this.emitSetHover.emit('lowPressureHovered');
    } else if (this.outletColor == 'medium-pressure') {
      this.emitSetHover.emit('mediumPressureHovered');
    } else if (this.outletColor == 'high-pressure') {
      this.emitSetHover.emit('highPressureHovered');
    }
  }

}
