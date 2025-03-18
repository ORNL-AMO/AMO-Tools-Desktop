import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BoilerOutput } from '../../../shared/models/steam/steam-outputs';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-boiler-diagram',
    templateUrl: './boiler-diagram.component.html',
    styleUrls: ['./boiler-diagram.component.css'],
    standalone: false
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

  feedwaterClasses: Array<string>;
  blowdownClasses: Array<string>;
  steamClasses: Array<string>;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.getClasses();
  }

  getClasses() {
    this.feedwaterClasses = [];
    if (this.boiler.feedwaterMassFlow < 1e-3) {
      this.feedwaterClasses.push('noSteamFlow');
    }
    this.blowdownClasses = [];
    if(this.boiler.blowdownMassFlow < 1e-3){
      this.blowdownClasses.push('noSteamFlow');
    }
    this.steamClasses = [];
    if(this.boiler.steamMassFlow < 1e-3){
      this.steamClasses.push('noSteamFlow');
    }
  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  selectEquipment(str: string) {
    this.emitSelectEquipment.emit(str);
  }
}
