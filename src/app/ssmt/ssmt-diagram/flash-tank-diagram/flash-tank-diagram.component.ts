import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

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
  @Output('emitSelectEquipment')
  emitSelectEquipment = new EventEmitter<string>();
  @Input()
  flashTankType: string;
  @Input()
  settings: Settings;

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
    if (this.steamPressure == 'medium-pressure') {
      this.emitSetHover.emit('mediumPressureHovered');
    } else if (this.steamPressure == 'low-pressure') {
      this.emitSetHover.emit('lowPressureHovered');
    }
  }

  selectEquipment() {
    if (this.flashTankType == 'highPressure') {
      this.emitSelectEquipment.emit('highPressureFlashTank');
    } else if (this.flashTankType == 'mediumPressure') {
      this.emitSelectEquipment.emit('mediumPressureFlashTank');
    }
  }

  hoverFlashTank() {
    if (this.flashTankType == 'highPressure') {
      this.emitSetHover.emit('highPressureFlashTankHovered');
    } else if (this.flashTankType == 'mediumPressure') {
      this.emitSetHover.emit('mediumPressureFlashTankHovered');
    }
  }

  hoverOutletGas() {
    if (this.flashTankType == 'highPressure') {
      this.emitSetHover.emit('highPressureFlashTankOutletSteamHovered');
    } else if (this.flashTankType == 'mediumPressure') {
      this.emitSetHover.emit('mediumPressureFlashTankOutletSteamHovered');
    }
  }

  hoverInlet() {
    if (this.flashTankType == 'mediumPressure') {
      this.emitSetHover.emit('mediumPressureFlashTankInletCondensateHovered');
    }
  }

  hoverOutlet() {
    if (this.flashTankType == 'highPressure') {
      this.emitSetHover.emit('highPressureFlashTankOutletCondensateHovered');
    } else if (this.flashTankType == 'mediumPressure') {
      this.emitSetHover.emit('mediumPressureFlashTankOutletCondensateHovered');
    }
  }
}
