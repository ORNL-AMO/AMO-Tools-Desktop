import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { PHAST } from '../../shared/models/phast/phast';
import { PhastService } from '../phast.service';
@Component({
  selector: 'app-metered-energy',
  templateUrl: './metered-energy.component.html',
  styleUrls: ['./metered-energy.component.css']
})
export class MeteredEnergyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();

  constructor(private phastService: PhastService) { }

  ngOnInit() {
    if(!this.phast.meteredEnergy){
      this.phast.meteredEnergy = {
        meteredEnergyElectricity: null,
        meteredEnergyFuel: null,
        meteredEnergySteam: null
      }
    }
  }

  emitSave(){
    this.save.emit(true);
  }

}
