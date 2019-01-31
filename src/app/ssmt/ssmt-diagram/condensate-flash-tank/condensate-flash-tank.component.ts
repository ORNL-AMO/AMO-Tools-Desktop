import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-condensate-flash-tank',
  templateUrl: './condensate-flash-tank.component.html',
  styleUrls: ['./condensate-flash-tank.component.css']
})
export class CondensateFlashTankComponent implements OnInit {
  @Input()
  flashTank: FlashTankOutput;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Output('emitSelectEquipment')
  emitSelectEquipment = new EventEmitter<string>();
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {
  }


  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  selectEquipment() {
    this.emitSelectEquipment.emit('condensateFlashTank');
  }

}
