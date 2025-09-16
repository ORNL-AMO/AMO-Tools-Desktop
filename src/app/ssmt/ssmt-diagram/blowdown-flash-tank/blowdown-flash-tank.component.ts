import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-blowdown-flash-tank',
    templateUrl: './blowdown-flash-tank.component.html',
    styleUrls: ['./blowdown-flash-tank.component.css'],
    standalone: false
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

  steamPressureClasses: Array<string>;
  outletCondensateClasses: Array<string>;
  inletCondensateClasses: Array<string>;

  ngOnInit() {
  }

  ngOnChanges() {
    this.setClasses();
  }

  setClasses() {
    this.steamPressureClasses = ['low-pressure'];
    this.outletCondensateClasses = ['blowdown'];
    this.inletCondensateClasses = ['blowdown'];
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
  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }
  selectEquipment(str: string) {
    this.emitSelectEquipment.emit(str);
  }
}
