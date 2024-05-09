import { ChangeDetectorRef, Component } from '@angular/core';
import { AnnotationData, GraphInteractivity, GraphObj } from '../../../log-tool-models';
import { VisualizeService } from '../../visualize.service';
import { Subscription } from 'rxjs';
import { VisualizeSidebarService } from '../visualize-sidebar.service';
import { truncate } from '../../../../shared/helperFunctions';

@Component({
  selector: 'app-graph-annotations',
  templateUrl: './graph-annotations.component.html',
  styleUrls: ['./graph-annotations.component.css']
})
export class GraphAnnotationsComponent {
  annotateDataPointSub: Subscription;
  annotateDataPoint: AnnotationData;
  selectedGraphObjSub: Subscription;
  selectedGraphObj: GraphObj;
  fontSizes: Array<number> = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
  arrowSizes: Array<number> = [.5, 1, 1.5, 2, 2.5];


  isGraphInteractive: boolean = false;
  graphInteractivity: GraphInteractivity;
  toolTipHoldTimeout;
  showTooltipHover: boolean = false;
  showTooltipClick: boolean = false;
  showUserGraphOptions: boolean = true;

  constructor(private visualizeService: VisualizeService, private cd: ChangeDetectorRef, private visualizeSidebarService: VisualizeSidebarService) { }

  ngOnInit(): void {
    this.visualizeService.focusedPanel.next('annotations');
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      this.selectedGraphObj = val;
      this.isGraphInteractive = this.selectedGraphObj.graphInteractivity.isGraphInteractive;
      if (this.selectedGraphObj.layout.annotations.length == 0 && this.annotateDataPoint){
        this.annotateDataPoint = undefined;
      }
    });

    this.annotateDataPointSub = this.visualizeService.annotateDataPoint.subscribe(point => {
      this.annotateDataPoint = point;
      if (this.annotateDataPoint) {
        this.annotateDataPoint.seriesName = truncate(this.annotateDataPoint.seriesName, 30);  
      }
      this.cd.detectChanges();
    });  
  }

  ngOnDestroy() {
    this.annotateDataPointSub.unsubscribe();
    this.selectedGraphObjSub.unsubscribe();
  }

  setAnnotation() {
    this.visualizeSidebarService.setAnnotation(this.annotateDataPoint, this.selectedGraphObj);
  }

   dismissPerformanceWarning() {
    this.selectedGraphObj.graphInteractivity.showDefaultPerformanceWarning = false;
  }
  
  dismissUserToggledPerformanceWarning() {
    this.selectedGraphObj.graphInteractivity.showUserToggledPerformanceWarning = false;
  }

  toggleAnnotateGraph() {
    this.selectedGraphObj.graphInteractivity.isGraphInteractive = this.isGraphInteractive;
    setTimeout(() => {
      this.visualizeSidebarService.saveExistingPlotChange(this.selectedGraphObj, true);
      this.visualizeService.focusedPanel.next('annotations');
    }, 10);
  }

    hideTooltipHover() {
    // Allow user to hover on tip text
    this.toolTipHoldTimeout = setTimeout(() => {
      this.showTooltipHover = false;
    }, 200)
  }

  displayTooltipHover(hoverOnInfo: boolean = false) {
    if (hoverOnInfo) {
      clearTimeout(this.toolTipHoldTimeout);
    }
    this.showTooltipHover = true;
  }

  toggleClickTooltip(){
    this.showTooltipClick = !this.showTooltipClick;
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
    this.visualizeSidebarService.deleteAnnotation(annotation, this.selectedGraphObj);
  }


  focusField(){
    this.visualizeService.focusedPanel.next('annotation');
  }

  focusOut(){
    this.visualizeService.focusedPanel.next('default');
  }
}
