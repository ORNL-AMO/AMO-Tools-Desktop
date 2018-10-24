import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Plane } from '../../../../../shared/models/fans';

@Component({
  selector: 'app-pressure-readings-form',
  templateUrl: './pressure-readings-form.component.html',
  styleUrls: ['./pressure-readings-form.component.css']
})
export class PressureReadingsFormComponent implements OnInit {
  @Input()
  toggleResetData: boolean;
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
    if (this.planeData.traverseData.length != this.planeData.numInsertionPoints || this.planeData.traverseData[0].length != this.planeData.numTraverseHoles) {
      let cols = new Array();
      for (let i = 0; i < this.planeData.numTraverseHoles; i++) {
        cols.push(0)
        this.numLabels.push(i+1);
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleResetData && !changes.toggleResetData.firstChange) {
      this.resetData();
    }
  }

  resetData() {
    this.numLabels = new Array();
    if (this.planeData.traverseData.length != this.planeData.numInsertionPoints || this.planeData.traverseData[0].length != this.planeData.numTraverseHoles) {
      let cols = new Array();
      for (let i = 0; i < this.planeData.numTraverseHoles; i++) {
        cols.push(0)
        this.numLabels.push(i+1);
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
    this.save();
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
