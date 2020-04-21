import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { VisualizeService } from '../visualize.service';
import { GraphObj } from '../../log-tool-models';

@Component({
  selector: 'app-annotate-graph',
  templateUrl: './annotate-graph.component.html',
  styleUrls: ['./annotate-graph.component.css']
})
export class AnnotateGraphComponent implements OnInit {

  annotateDataPointSub: Subscription;
  annotateDataPoint: {
    x: number | string,
    y: number | string,
    text: string,
    showarrow: boolean,
    font: {
      //  family: undefined,
      size: number,
      color: string
    },
    ax: number,
    ay: number,
  };
  selectedGraphObjSub: Subscription;
  selectedGraphObj: GraphObj;
  fontSizes: Array<number> = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
  constructor(private visualizeService: VisualizeService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.annotateDataPointSub = this.visualizeService.annotateDataPoint.subscribe(point => {
      this.annotateDataPoint = {
        x: point.x,
        y: point.y,
        text: point.annotation,
        showarrow: true,
        font: {
          // family: undefined,
          size: 18,
          color: undefined
        },
        ax: 0,
        ay: -100,
      };
      this.cd.detectChanges();
    });

    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      this.selectedGraphObj = val;
    });
  }

  ngOnDestroy() {
    this.annotateDataPointSub.unsubscribe();
    this.selectedGraphObjSub.unsubscribe();
  }


  setAnnotation() {
    // let newAnnotation = {
    //   x: this.annotateDataPoint.x,
    //   y: this.annotateDataPoint.y,
    //   text: this.annotateDataPoint.te,
    //   showarrow: true,
    //   font: {
    //     // family: undefined,
    //     size: 18,
    //     color: undefined
    //   },
    //   ax: 0,
    //   ay: -100,
    // }
    // if (!this.selectedGraphObj.layout.annotations) {
    this.selectedGraphObj.layout.annotations = [this.annotateDataPoint];
    // } else {
    //   this.selectedGraphObj.layout.annotations.push(newAnnotation);
    // }
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
}
