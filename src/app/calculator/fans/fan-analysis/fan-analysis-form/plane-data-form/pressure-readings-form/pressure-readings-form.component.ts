import { Component, OnInit, Input } from '@angular/core';
import { Plane } from '../../../../../../shared/models/fans';
import { FanAnalysisService } from '../../../fan-analysis.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pressure-readings-form',
  templateUrl: './pressure-readings-form.component.html',
  styleUrls: ['./pressure-readings-form.component.css']
})
export class PressureReadingsFormComponent implements OnInit {
  @Input()
  planeNum: string;
  @Input()
  pressureType: string = 'Velocity';

  traverseHoles: Array<Array<number>>;
  numLabels: Array<number>;
  planeData: Plane;
  resetFormSubscription: Subscription;
  updateTraverseDataSubscription: Subscription;
  constructor(private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.numLabels = new Array();
    this.setPlaneData();
    this.initializeData();
    this.resetFormSubscription = this.fanAnalysisService.resetForms.subscribe(val => {
      if (val == true) {
        this.numLabels = new Array();
        this.setPlaneData();
        this.initializeData();
      }
    });
    this.updateTraverseDataSubscription = this.fanAnalysisService.updateTraverseData.subscribe(val => {
      if (val == true) {
        this.setPlaneData();
        this.updateData();
      }
    });
    this.save();
  }

  ngOnDestroy() {
    this.resetFormSubscription.unsubscribe();
    this.updateTraverseDataSubscription.unsubscribe();
  }

  setPlaneData() {
    this.planeData = this.fanAnalysisService.getPlane(this.planeNum);
  }

  initializeData() {
    if (this.pressureType != 'Static') {
      this.setTraverseHoles(this.planeData.traverseData);
    } else {
      this.setTraverseHoles(this.planeData.staticPressureData);
    }
  }

  setTraverseHoles(currentTraverseData: Array<Array<number>>) {
      this.traverseHoles = currentTraverseData;
      for (let i = 0; i < this.planeData.numTraverseHoles; i++) {
        this.numLabels.push(i + 1);
      }
  }

  updateData() {
    this.traverseHoles = this.traverseHoles.slice(0, this.planeData.numInsertionPoints);
    if (this.traverseHoles.length < this.planeData.numInsertionPoints) {
      for (let i = this.traverseHoles.length; i < this.planeData.numInsertionPoints; i++) {
        this.traverseHoles.push(new Array<number>(this.planeData.numTraverseHoles).fill(0));
      }
    }

    for (let i = 0; i < this.traverseHoles.length; i++) {
      this.traverseHoles[i] = this.traverseHoles[i].slice(0, this.planeData.numTraverseHoles);
      if (this.traverseHoles[i].length < this.planeData.numTraverseHoles) {
        for (let n = this.traverseHoles[i].length; n < this.planeData.numTraverseHoles; n++) {
          this.traverseHoles[i].push(0);
        }
      }
    }
    this.numLabels = new Array();
    for (let i = 0; i < this.planeData.numTraverseHoles; i++) {
      this.numLabels.push(i + 1);
    }
    this.save();
  }

  setStaticPressure() {
    // Static pressure result is avg of all traverse holes/insertion points
    let row: Array<number>;
    let totalHolesValue: number = 0;
    let holeCount: number = 0;
    let holesAverage: number;

    for (let i = 0; i < this.traverseHoles.length; i++) {
      row = this.traverseHoles[i];
      holeCount += row.length;
      for (let j = 0; j < row.length; j++) {
        totalHolesValue += row[j];
        }
      }

    holesAverage = (totalHolesValue / holeCount);
    if (isNaN(holesAverage)) {
      this.planeData.staticPressure = undefined;
    } else {
      this.planeData.staticPressure = holesAverage;
    }
  }

  save() {
    if (this.pressureType == 'Static') {
      this.setStaticPressure();
      this.planeData.staticPressureData = this.traverseHoles;
    } else {
      this.planeData.traverseData = this.traverseHoles;
    }
    this.fanAnalysisService.setPlane(this.planeNum, this.planeData);
    this.fanAnalysisService.getResults.next(true);
  }

  trackByFn(index: any, item: any) {
    return index;
  }
}
