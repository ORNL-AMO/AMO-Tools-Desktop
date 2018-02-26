import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PitotTubeData } from '../plane-3-form/plane-3-form.component';

@Component({
  selector: 'app-pressure-readings-form',
  templateUrl: './pressure-readings-form.component.html',
  styleUrls: ['./pressure-readings-form.component.css']
})
export class PressureReadingsFormComponent implements OnInit {
  @Input()
  pitotTubeData: PitotTubeData;
  @Output('emitSave')
  emitSave = new EventEmitter<PitotTubeData>();

  traverseHoles: Array<Array<number>>;
  constructor() { }

  ngOnInit() {
    let cols = new Array();
    for (let i = 0; i < this.pitotTubeData.traverseHoles; i++) {
      cols.push(i)
    }

    let rows = new Array();
    for (let i = 0; i < this.pitotTubeData.insertionPoints; i++) {
      rows.push(JSON.parse(JSON.stringify(cols)));
    }
    this.traverseHoles = rows;
  }

  save() {
    this.pitotTubeData.pressureReadings = this.traverseHoles;
    this.emitSave.emit(this.pitotTubeData);

  }

  trackByFn(index: any, item: any) {
    return index;
 }
}
