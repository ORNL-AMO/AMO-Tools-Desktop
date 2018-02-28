import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Plane } from '../../../../../shared/models/fans';

@Component({
  selector: 'app-pressure-readings-form',
  templateUrl: './pressure-readings-form.component.html',
  styleUrls: ['./pressure-readings-form.component.css']
})
export class PressureReadingsFormComponent implements OnInit {
  @Input()
  planeData: Plane;
  @Output('emitSave')
  emitSave = new EventEmitter<Plane>();
  @Output('emitBack')
  emitBack = new EventEmitter<boolean>();
  traverseHoles: Array<Array<number>>;
  numLabels: Array<number>;
  constructor() { }

  ngOnInit() {
    this.numLabels = new Array();
    if (this.planeData.traverseData.length != this.planeData.numInsertionPoints) {
      let cols = new Array();
      for (let i = 0; i < this.planeData.numTraverseHoles; i++) {
        cols.push(i)
      }

      let rows = new Array();
      for (let i = 0; i < this.planeData.numInsertionPoints; i++) {
        rows.push(JSON.parse(JSON.stringify(cols)));
      }
      this.traverseHoles = rows;
    } else {
      this.traverseHoles = this.planeData.traverseData
      for(let i = 0; i < this.planeData.numTraverseHoles; i++){
        this.numLabels.push(i+1);
      }
    }
  }

  save() {
    this.planeData.traverseData = this.traverseHoles;
    this.emitSave.emit(this.planeData);
  }

  goBack(){
    this.emitBack.emit(true);
  }

  trackByFn(index: any, item: any) {
    return index;
  }
}
