import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-turbine-connector',
    templateUrl: './turbine-connector.component.html',
    styleUrls: ['./turbine-connector.component.css'],
    standalone: false
})
export class TurbineConnectorComponent implements OnInit {
  @Input()
  inletColor: string;
  @Input()
  noOutletConnection: boolean;
  @Input()
  noInletConnection: boolean;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Input()
  massFlow: number;
  @Output('emitSelectEquipment')
  emitSelectEquipment = new EventEmitter<string>();

  connectorClasses: Array<string>;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(){
    this.getClasses();
  }

  getClasses(){
    this.connectorClasses = [this.inletColor];
    if(this.massFlow < 1e-3){
      this.connectorClasses = ['no-steam-flow'];
    }
  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  hoverConnector() {
    if (this.inletColor === 'makeup-water') {
      this.emitSetHover.emit('makeupWaterCondensateHovered');
    } else if (this.inletColor === 'low-pressure') {
      this.emitSetHover.emit('lowPressureHovered');
    }
  }

  selectConnector(){
    if (this.inletColor === 'makeup-water') {
      this.emitSelectEquipment.emit('makeupWaterCondensateHovered');
    } else if (this.inletColor === 'low-pressure') {
      this.emitSelectEquipment.emit('lowPressureHovered');
    }
  }
}
