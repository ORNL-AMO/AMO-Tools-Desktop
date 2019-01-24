import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BoilerOutput } from '../../../shared/models/steam/steam-outputs';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-boiler-diagram',
  templateUrl: './boiler-diagram.component.html',
  styleUrls: ['./boiler-diagram.component.css']
})
export class BoilerDiagramComponent implements OnInit {
  @Input()
  boiler: BoilerOutput;
  @Input()
  inputData: SSMTInputs;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Output('emitSelectEquipment')
  emitSelectEquipment = new EventEmitter<string>();
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit() {
  }

  hoverEquipment(str: string){
    this.emitSetHover.emit(str);
  }

  selectEquipment(str: string){
    this.emitSelectEquipment.emit(str);
  }
}
