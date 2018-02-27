import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Plane } from '../../../../../shared/models/fan-copy';

@Component({
  selector: 'app-pressure-readings-form',
  templateUrl: './pressure-readings-form.component.html',
  styleUrls: ['./pressure-readings-form.component.css']
})
export class PressureReadingsFormComponent implements OnInit {
  @Input()
  fanData: Plane;
  @Output('emitSave')
  emitSave = new EventEmitter<Plane>();

  traverseHoles: Array<Array<number>>;
  constructor() { }

  ngOnInit() {
    console.log(this.fanData.length);
    console.log(this.fanData.numInsertionPoints);
    console.log(this.fanData.numTraverseHoles);
    if (this.fanData.traverseData.length != this.fanData.numInsertionPoints) {
      let cols = new Array();
      for (let i = 0; i < this.fanData.numTraverseHoles; i++) {
        cols.push(i)
      }

      let rows = new Array();
      for (let i = 0; i < this.fanData.numInsertionPoints; i++) {
        rows.push(JSON.parse(JSON.stringify(cols)));
      }
      this.traverseHoles = rows;
    } else {
      this.traverseHoles = this.fanData.traverseData
    }
  }

  save() {
    this.fanData.traverseData = this.traverseHoles;
    this.emitSave.emit(this.fanData);

  }

  trackByFn(index: any, item: any) {
    return index;
  }
}
