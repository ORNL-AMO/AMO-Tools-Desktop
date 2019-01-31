import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from 'http2';

@Component({
  selector: 'app-blowdown-flash-tank',
  templateUrl: './blowdown-flash-tank.component.html',
  styleUrls: ['./blowdown-flash-tank.component.css']
})
export class BlowdownFlashTankComponent implements OnInit {
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
    this.emitSelectEquipment.emit('blowdownFlashTank');
  }
}
