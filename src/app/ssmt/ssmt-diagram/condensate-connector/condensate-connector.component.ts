import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SteamPropertiesOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-condensate-connector',
  templateUrl: './condensate-connector.component.html',
  styleUrls: ['./condensate-connector.component.css']
})
export class CondensateConnectorComponent implements OnInit {
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Input()
  returnCondensate: SteamPropertiesOutput;
  @Input()
  isOneHeaderSystem: boolean;
  @Input()
  settings: Settings;
  @Input()
  isConnector: boolean;

  condensateClasses: Array<string>;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.setClasses();
  }

  setClasses() {
    this.condensateClasses = ['condensate'];
    if (this.returnCondensate && this.returnCondensate.massFlow < 1e-3) {
      this.condensateClasses = ['no-steam-flow']
    }
  }
  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  hoverChevron() {
    if (this.returnCondensate) {
      this.emitSetHover.emit('returnCondensateHovered');
    }
  }
}
