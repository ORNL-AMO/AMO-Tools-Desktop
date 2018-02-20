import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../../shared/models/phast/phast';
import { DesignedEnergyElectricity, DesignedEnergyFuel, DesignedEnergySteam } from '../../shared/models/phast/designedEnergy'
@Component({
  selector: 'app-designed-energy',
  templateUrl: './designed-energy.component.html',
  styleUrls: ['./designed-energy.component.css']
})
export class DesignedEnergyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();
  @Input()
  containerHeight: number;
  
  constructor() { }

  ngOnInit() {
    if(!this.phast.designedEnergy){
      this.phast.designedEnergy = {
        designedEnergyElectricity: new Array<DesignedEnergyElectricity>(),
        designedEnergyFuel: new Array<DesignedEnergyFuel>(),
        designedEnergySteam: new Array<DesignedEnergySteam>()
      }
    }
  }

  emitSave(){
    this.save.emit(true);
  }

}
