import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-flash-tank-diagram',
    templateUrl: './flash-tank-diagram.component.html',
    styleUrls: ['./flash-tank-diagram.component.css'],
    standalone: false
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
  flashTankType: 'highPressure' | 'mediumPressure';
  @Input()
  settings: Settings;

  steamPressureClasses: Array<string>;
  outletCondensateClasses: Array<string>;
  inletCondensateClasses: Array<string>;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.setClasses();
  }

  setClasses() {
    this.steamPressureClasses = [this.steamPressure];
    this.outletCondensateClasses = ['condensate'];
    this.inletCondensateClasses = ['condensate'];
    
    if (this.flashTank) {
      if (this.flashTank.outletGasMassFlow < 1e-3) {
        this.steamPressureClasses = ['no-steam-flow']
      }
      
      if (this.flashTank.outletLiquidMassFlow < 1e-3) {
        this.outletCondensateClasses = ['no-steam-flow'];
      }
      if (this.flashTank.inletWaterMassFlow < 1e-3) {
        this.inletCondensateClasses = ['no-steam-flow'];
      }
    }
  }
  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  hoverCondensate() {
    this.emitSetHover.emit('condensateHovered');
  }

  selectCondensate() {
    this.emitSelectEquipment.emit('condensateHovered');
  }

  hoverHeader() {
    if (this.steamPressure === 'medium-pressure') {
      this.emitSetHover.emit('mediumPressureHovered');
    } else if (this.steamPressure === 'low-pressure') {
      this.emitSetHover.emit('lowPressureHovered');
    }
  }

  selectHeader() {
    if (this.steamPressure === 'medium-pressure') {
      this.emitSelectEquipment.emit('mediumPressureHovered');
    } else if (this.steamPressure === 'low-pressure') {
      this.emitSelectEquipment.emit('lowPressureHovered');
    }
  }

  selectEquipment() {
    if (this.flashTankType === 'highPressure') {
      this.emitSelectEquipment.emit('highPressureFlashTank');
    } else if (this.flashTankType === 'mediumPressure') {
      this.emitSelectEquipment.emit('mediumPressureFlashTank');
    }
  }

  hoverFlashTank() {
    if (this.flashTankType === 'highPressure') {
      this.emitSetHover.emit('highPressureFlashTankHovered');
    } else if (this.flashTankType === 'mediumPressure') {
      this.emitSetHover.emit('mediumPressureFlashTankHovered');
    }
  }

  hoverOutletGas() {
    if (this.flashTankType === 'highPressure') {
      this.emitSetHover.emit('highPressureFlashTankOutletSteamHovered');
    } else if (this.flashTankType === 'mediumPressure') {
      this.emitSetHover.emit('mediumPressureFlashTankOutletSteamHovered');
    }
  }

  selectOutletGas(){
    if (this.flashTankType === 'highPressure') {
      this.emitSelectEquipment.emit('highPressureFlashTankOutletSteamHovered');
    } else if (this.flashTankType === 'mediumPressure') {
      this.emitSelectEquipment.emit('mediumPressureFlashTankOutletSteamHovered');
    }
  }

  hoverInlet() {
    if (this.flashTankType === 'mediumPressure') {
      this.emitSetHover.emit('mediumPressureFlashTankInletCondensateHovered');
    }
  }

  selectInlet(){
    if (this.flashTankType === 'mediumPressure') {
      this.emitSelectEquipment.emit('mediumPressureFlashTankInletCondensateHovered');
    }
  }

  hoverOutlet() {
    if (this.flashTankType === 'highPressure') {
      this.emitSetHover.emit('highPressureFlashTankOutletCondensateHovered');
    } else if (this.flashTankType === 'mediumPressure') {
      this.emitSetHover.emit('mediumPressureFlashTankOutletCondensateHovered');
    }
  }

  selectOutlet() {
    if (this.flashTankType === 'highPressure') {
      this.emitSelectEquipment.emit('highPressureFlashTankOutletCondensateHovered');
    } else if (this.flashTankType === 'mediumPressure') {
      this.emitSelectEquipment.emit('mediumPressureFlashTankOutletCondensateHovered');
    }
  }
}
