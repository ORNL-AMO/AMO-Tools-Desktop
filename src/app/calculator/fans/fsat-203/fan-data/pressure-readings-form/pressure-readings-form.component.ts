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
  numLabels: Array<number>;
  constructor() { }

  ngOnInit() {
    console.log(this.fanData.traverseData.length);
    console.log(this.fanData.numInsertionPoints);
    console.log(this.fanData.numTraverseHoles);
    this.numLabels = new Array();
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
      for(let i = 0; i < this.fanData.numTraverseHoles; i++){
        this.numLabels.push(i+1);
      }
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
