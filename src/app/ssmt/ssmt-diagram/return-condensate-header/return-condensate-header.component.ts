import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HeaderOutputObj, SteamPropertiesOutput, FlashTankOutput } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-return-condensate-header',
  templateUrl: './return-condensate-header.component.html',
  styleUrls: ['./return-condensate-header.component.css']
})
export class ReturnCondensateHeaderComponent implements OnInit {
  @Input()
  makeupWaterAndCondensateHeader: HeaderOutputObj;
  @Input()
  returnCondensate: SteamPropertiesOutput;
  @Input()
  condensateFlashTank: FlashTankOutput;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();

  condensateMassFlow: number;
  constructor() { }

  ngOnInit() {
    if(this.condensateFlashTank){
      this.condensateMassFlow = this.condensateFlashTank.outletLiquidMassFlow;
      console.log('flash tank mass flow');
    }else{
      this.condensateMassFlow = this.returnCondensate.massFlow;
      console.log('return condensate mass flow');
    }
  }


  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

}
