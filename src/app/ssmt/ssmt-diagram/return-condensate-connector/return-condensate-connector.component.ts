import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-return-condensate-connector',
  templateUrl: './return-condensate-connector.component.html',
  styleUrls: ['./return-condensate-connector.component.css']
})
export class ReturnCondensateConnectorComponent implements OnInit {
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Input()
  deaerator: DeaeratorOutput;
  @Input()
  deaeratorWidth: number;
  constructor() { }

  ngOnInit() {
  }


  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }
}
