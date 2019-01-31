import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

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
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  hoverConnector() {
    if (this.inletColor == 'makeup-water') {
      this.emitSetHover.emit('makeupWaterCondensateHovered');
    } else if (this.inletColor == 'low-pressure') {
      this.emitSetHover.emit('lowPressureHovered');
    }
  }
}
