import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TurbineOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-turbine-diagram',
  templateUrl: './turbine-diagram.component.html',
  styleUrls: ['./turbine-diagram.component.css']
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
  constructor() { }

  ngOnInit() {
    if (this.turbineType == 'condensing') {
      this.turbineLabel = 'Condensing Turbine';
    } else if (this.turbineType == 'mediumToLow') {
      this.turbineLabel = 'MP to LP Turbine';
    } else if (this.turbineType == 'highToLow') {
      this.turbineLabel = 'HP to LP Turbine';
    } else if (this.turbineType == 'highToMedium') {
      this.turbineLabel = 'HP to MP Turbine';
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

  selectEquipment() {
    this.emitSelectEquipment.emit();
  }


  hoverTurbine() {
    this.emitSetHover.emit(this.turbineType + 'TurbineHovered');
  }
}
