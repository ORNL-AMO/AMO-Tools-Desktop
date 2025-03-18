import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-feedwater-diagram',
    templateUrl: './feedwater-diagram.component.html',
    styleUrls: ['./feedwater-diagram.component.css'],
    standalone: false
})
export class FeedwaterDiagramComponent implements OnInit {
  @Input()
  deaerator: DeaeratorOutput;
  @Output('emitSetHover')
  emitSetHover = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Output('emitSelectEquipment')
  emitSelectEquipment = new EventEmitter<string>();

  feedwaterClasses: Array<string>;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.setClasses();
  }

  setClasses() {
    this.feedwaterClasses = ['feedwater'];
    if (this.deaerator.feedwaterMassFlow < 1e-3) {
      this.feedwaterClasses = ['no-steam-flow'];
    }
  }

  hoverEquipment(str: string) {
    this.emitSetHover.emit(str);
  }

  selectEquipment(str: string) {
    this.emitSelectEquipment.emit(str);
  }
}
