import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SteamPropertiesOutput, FlashTankOutput, DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-return-condensate-header',
    templateUrl: './return-condensate-header.component.html',
    styleUrls: ['./return-condensate-header.component.css'],
    standalone: false
})
export class ReturnCondensateHeaderComponent implements OnInit {
  @Input()
  makeupWaterAndCondensateHeader: SteamPropertiesOutput;
  @Input()
  returnCondensate: SteamPropertiesOutput;
  @Input()
  condensateFlashTank: FlashTankOutput;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Input()
  deaerator: DeaeratorOutput;
  @Input()
  settings: Settings;
  @Output('emitSelectEquipment')
  emitSelectEquipment = new EventEmitter<string>();

  condensateMassFlow: number;
  condensateClasses: Array<string>;
  constructor() { }

  ngOnInit() {

  }

  ngOnChanges() {
    this.setCondensateMassFlow();
    this.setClasses();
  }

  setCondensateMassFlow() {
    if (this.condensateFlashTank && isNaN(this.condensateFlashTank.outletLiquidMassFlow) == false && this.condensateFlashTank.outletLiquidMassFlow != undefined) {
      this.condensateMassFlow = this.condensateFlashTank.outletLiquidMassFlow;
    } else {
      this.condensateMassFlow = this.returnCondensate.massFlow;
    }
  }

  setClasses() {
    this.condensateClasses = ['makeup-water'];
    if (this.makeupWaterAndCondensateHeader.massFlow < 1e-3) {
      this.condensateClasses = ['no-steam-flow'];
    }
  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  selectEquipment(str: string) {
    this.emitSelectEquipment.emit(str);
  }
}
