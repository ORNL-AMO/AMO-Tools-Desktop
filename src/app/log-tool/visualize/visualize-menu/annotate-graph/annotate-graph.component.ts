import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { VisualizeService } from '../../visualize.service';
import { GraphObj, AnnotationData } from '../../../log-tool-models';
import * as _ from 'lodash';

@Component({
  selector: 'app-annotate-graph',
  templateUrl: './annotate-graph.component.html',
  styleUrls: ['./annotate-graph.component.css']
})
export class AnnotateGraphComponent implements OnInit {

  annotateDataPointSub: Subscription;
  annotateDataPoint: AnnotationData;
  selectedGraphObjSub: Subscription;
  selectedGraphObj: GraphObj;
  fontSizes: Array<number> = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
  arrowSizes: Array<number> = [.5, 1, 1.5, 2, 2.5];
  constructor(private visualizeService: VisualizeService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {

    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      this.selectedGraphObj = val;
      this.cd.detectChanges();
    });

    this.annotateDataPointSub = this.visualizeService.annotateDataPoint.subscribe(point => {
      this.annotateDataPoint = point;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.annotateDataPointSub.unsubscribe();
    this.selectedGraphObjSub.unsubscribe();
  }


  setAnnotation() {
    console.log(this.annotateDataPoint);
    if (!this.selectedGraphObj.layout.annotations && this.annotateDataPoint.text) {
      this.selectedGraphObj.layout.annotations = [this.annotateDataPoint];
    } else {
      let testExistIndex: number = this.selectedGraphObj.layout.annotations.findIndex(annotation => { return annotation.annotationId == this.annotateDataPoint.annotationId });
      if (testExistIndex != -1) {
        if (this.annotateDataPoint.text) {
          this.selectedGraphObj.layout.annotations[testExistIndex] = this.annotateDataPoint;
        } else {
          this.deleteAnnotation(this.annotateDataPoint);
        }
      } else if (this.annotateDataPoint.text) {
        this.selectedGraphObj.layout.annotations.push(this.annotateDataPoint);
      }
    }
    this.visualizeService.selectedGraphObj.next(this.selectedGraphObj);
  }

  moveLeft() {
    this.annotateDataPoint.ax = this.annotateDataPoint.ax - 8;
    this.setAnnotation();
  }

  moveRight() {
    this.annotateDataPoint.ax = this.annotateDataPoint.ax + 8;
    this.setAnnotation();
  }

  moveDown() {
    this.annotateDataPoint.ay = this.annotateDataPoint.ay + 8;
    this.setAnnotation();
  }

  moveUp() {
    this.annotateDataPoint.ay = this.annotateDataPoint.ay - 8;
    this.setAnnotation();
  }

  selectAnnotation(annotation: AnnotationData) {
    this.visualizeService.annotateDataPoint.next(annotation);
  }

  deleteAnnotation(annotation: AnnotationData) {
    _.remove(this.selectedGraphObj.layout.annotations, (currentAnnotation) => { return currentAnnotation.annotationId == annotation.annotationId });
    this.visualizeService.selectedGraphObj.next(this.selectedGraphObj);
  }
}
