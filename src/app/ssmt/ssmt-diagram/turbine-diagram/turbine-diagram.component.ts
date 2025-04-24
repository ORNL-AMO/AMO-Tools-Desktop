import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TurbineOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-turbine-diagram',
    templateUrl: './turbine-diagram.component.html',
    styleUrls: ['./turbine-diagram.component.css'],
    standalone: false
})
export class TurbineDiagramComponent implements OnInit {
  @Input()
  turbine: TurbineOutput;
  @Input()
  inletColor: string;
  @Input()
  outletColor: string;
  @Input()
  noOutletConnection: boolean;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Output('emitSelectEquipment')
  emitSelectEquipment = new EventEmitter<string>();
  @Input()
  turbineType: string;
  @Input()
  settings: Settings;
  
  turbineLabel: string;

  inletSteamClasses: Array<string>;
  outletSteamClasses: Array<string>;
  turbineWarnings: boolean;
  constructor() { }

  ngOnInit() {
    if (this.turbineType === 'condensing') {
      this.turbineLabel = 'Condensing Turbine';
    } else if (this.turbineType === 'mediumToLow') {
      this.turbineLabel = 'MP to LP Turbine';
    } else if (this.turbineType === 'highToLow') {
      this.turbineLabel = 'HP to LP Turbine';
    } else if (this.turbineType === 'highToMedium') {
      this.turbineLabel = 'HP to MP Turbine';
    }
  }

  ngOnChanges(){
    this.setClasses();
    this.checkWarnings();
  }

  setClasses() {
    this.inletSteamClasses = [this.inletColor];
    this.outletSteamClasses = [this.outletColor];
    if (this.turbine.massFlow < 1e-3) {
      this.inletSteamClasses = ['no-steam-flow'];
      this.outletSteamClasses = ['no-steam-flow'];
    }
  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  hoverInlet() {
    this.emitSetHover.emit(this.turbineType + 'TurbineInletHovered');
  }

  hoverOutlet() {
    this.emitSetHover.emit(this.turbineType + 'TurbineOutletHovered');
  }

  selectInlet() {
    this.emitSelectEquipment.emit(this.turbineType + 'TurbineInletHovered');
  }

  selectOutlet() {
    this.emitSelectEquipment.emit(this.turbineType + 'TurbineOutletHovered');
  }


  selectEquipment() {
    this.emitSelectEquipment.emit();
  }

  hoverTurbine() {
    this.emitSetHover.emit(this.turbineType + 'TurbineHovered');
  }

  checkWarnings(){
    if(this.turbine.outletQuality < 1 || this.turbine.inletQuality < 1){
      this.turbineWarnings = true;
    }else if(this.turbine.outletPressure > this.turbine.inletPressure){
      this.turbineWarnings = true;
    }else if(this.turbine.massFlow < 0){
      this.turbineWarnings = true;
    }else{
      this.turbineWarnings = false;
    }
  }
}
