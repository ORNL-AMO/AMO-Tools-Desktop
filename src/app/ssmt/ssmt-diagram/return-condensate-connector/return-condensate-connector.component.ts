import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

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
  settings: Settings;
  @Output('emitSelectEquipment')
  emitSelectEquipment = new EventEmitter<string>();

  makeupWaterClasses: Array<string>;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.setClasses();
  }

  setClasses() {
    this.makeupWaterClasses = [];
    if (this.deaerator.inletWaterMassFlow < 1e-3) {
      this.makeupWaterClasses = ['no-steam-flow'];
    }

  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  selectEquipment(str: string) {
    this.emitSelectEquipment.emit(str);
  }
}
