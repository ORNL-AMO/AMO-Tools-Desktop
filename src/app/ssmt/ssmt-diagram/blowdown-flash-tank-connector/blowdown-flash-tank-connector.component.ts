import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BoilerInput } from '../../../shared/models/steam/ssmt';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-blowdown-flash-tank-connector',
  standalone: false,
  templateUrl: './blowdown-flash-tank-connector.component.html',
  styleUrl: './blowdown-flash-tank-connector.component.css',
})
export class BlowdownFlashTankConnectorComponent {
  @Input()
  flashTank: FlashTankOutput;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Output('emitSelectEquipment')
  emitSelectEquipment = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  boilerInput: BoilerInput;



  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }
  selectEquipment(str: string) {
    this.emitSelectEquipment.emit(str);
  }
}
