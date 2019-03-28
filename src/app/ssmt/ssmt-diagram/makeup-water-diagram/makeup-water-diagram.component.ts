import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SteamPropertiesOutput, HeatExchangerOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-makeup-water-diagram',
  templateUrl: './makeup-water-diagram.component.html',
  styleUrls: ['./makeup-water-diagram.component.css']
})
export class MakeupWaterDiagramComponent implements OnInit {
  @Input()
  makeupWater: SteamPropertiesOutput;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Output('emitSelectEquipment')
  emitSelectEquipment = new EventEmitter<string>();
  @Input()
  makeupWaterVolumeFlow: number;
  @Input()
  heatExchangerOutput: HeatExchangerOutput;
  @Input()
  settings: Settings;
  

  makeupWaterClasses: Array<string>;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(){
    this.setClasses();
  }
  setClasses(){
    this.makeupWaterClasses = [];
    if(this.makeupWater.massFlow < 1e-3){
      this.makeupWaterClasses = ['no-steam-flow'];
    }
  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  selectHeatExchanger() {
    this.emitSelectEquipment.emit('heat-exchanger');
  }
}
