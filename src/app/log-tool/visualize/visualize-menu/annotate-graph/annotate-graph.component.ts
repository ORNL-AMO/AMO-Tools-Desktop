import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { VisualizeService } from '../../visualize.service';
import { GraphObj, AnnotationData } from '../../../log-tool-models';
import * as _ from 'lodash';
import { VisualizeMenuService } from '../visualize-menu.service';

@Component({
  selector: 'app-annotate-graph',
  templateUrl: './annotate-graph.component.html',
  styleUrls: ['./annotate-graph.component.css']
})
export class AnnotateGraphComponent implements OnInit {
  annotatedPointsSub: Subscription;
  annotatedPoints: Array<AnnotationData>;//an array of all entered annotations 
  annotateDataPointSub: Subscription;
  annotateDataPoint: AnnotationData;
  selectedGraphObjSub: Subscription;
  selectedGraphObj: GraphObj;
  fontSizes: Array<number> = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
  arrowSizes: Array<number> = [.5, 1, 1.5, 2, 2.5];
  constructor(private visualizeService: VisualizeService, private cd: ChangeDetectorRef, private visualizeMenuService: VisualizeMenuService) { }

  ngOnInit(): void {
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      this.selectedGraphObj = val;
      if(this.selectedGraphObj.layout.annotations.length == 0 && this.annotateDataPoint){
        this.annotateDataPoint = undefined;
      }
      this.cd.detectChanges();
    });

    this.annotatedPointsSub = this.visualizeService.annotatedDataPoints.subscribe(val => {
      this.annotatedPoints = val;
    })

    // if(this.selectedGraphObj.layout.annotations.length != 0){  
    //   console.log('there are annototaions');    
    //   this.selectedGraphObj.layout.annotations.forEach(point =>{
    //     this.annotateDataPoint = point;
    //     this.visualizeService.plotFunctionType = 'update';
    //     this.selectAnnotation(point);
    //   });
    // }

    //trying to loop through all saved annotations and display them in the graph 
    //not working 
    if(this.annotatedPoints){  
      console.log('there are annototaions');    
      this.annotatedPoints.forEach(point =>{
        console.log('annotation'); 
        this.annotateDataPoint = point;
        this.visualizeService.plotFunctionType = 'update';
        this.visualizeMenuService.setAnnotation(this.annotateDataPoint, this.selectedGraphObj);
        this.selectAnnotation(point);
        this.setAnnotation();
      });
    }

    this.annotateDataPointSub = this.visualizeService.annotateDataPoint.subscribe(point => {
      this.annotateDataPoint = point;      
      this.cd.detectChanges();
    });  
    this.selectAnnotation(this.annotateDataPoint);
    
    this.setAnnotation();
  }

  ngOnDestroy() {
    this.visualizeService.selectedGraphObj.next(this.selectedGraphObj);
    this.annotateDataPointSub.unsubscribe();
    this.selectedGraphObjSub.unsubscribe();
    this.annotatedPointsSub.unsubscribe();
  }

  setAnnotation() {
    this.visualizeService.plotFunctionType = 'update';
    this.visualizeMenuService.setAnnotation(this.annotateDataPoint, this.selectedGraphObj);
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
    this.visualizeService.plotFunctionType = 'update';
    this.visualizeService.annotateDataPoint.next(annotation);
  }

  deleteAnnotation(annotation: AnnotationData) {
    this.visualizeService.plotFunctionType = 'update';
    this.visualizeMenuService.deleteAnnotation(annotation, this.selectedGraphObj);
  }

  focusField(){
    this.visualizeService.focusedPanel.next('annotation');
  }

  focusOut(){
    this.visualizeService.focusedPanel.next('default');
  }
}
