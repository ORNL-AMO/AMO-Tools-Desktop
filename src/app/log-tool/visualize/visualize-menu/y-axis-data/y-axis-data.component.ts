import { Component, OnInit } from '@angular/core';
import { GraphObj } from '../../../log-tool-models';
import { Subscription } from 'rxjs';
import { VisualizeService } from '../../visualize.service';
import { VisualizeMenuService } from '../visualize-menu.service';
import { LogToolDataService } from '../../../log-tool-data.service';

@Component({
  selector: 'app-y-axis-data',
  templateUrl: './y-axis-data.component.html',
  styleUrls: ['./y-axis-data.component.css']
})
export class YAxisDataComponent implements OnInit {

  selectedGraphObj: GraphObj;
  selectedGraphObjSub: Subscription;
  isFormChangeEvent: boolean;

  yAxisOptions: Array<{ axis: string, label: string }> = [{ axis: 'y', label: 'Left' }, { axis: 'y2', label: 'Right' }];
  constructor(private visualizeService: VisualizeService, 
    private logToolDataService: LogToolDataService, private visualizeMenuService: VisualizeMenuService) { }
  ngOnInit(): void {
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      if (this.isFormChangeEvent) {
        this.isFormChangeEvent = false;
      } else {
        this.selectedGraphObj = val;
      }
    });
  }

  ngOnDestroy() {
    this.selectedGraphObjSub.unsubscribe();
  }

  saveChanges() {
    this.visualizeMenuService.saveExistingPlotChange(this.selectedGraphObj);
  }
  
  saveUserInput() {
    this.visualizeMenuService.saveUserInputChange(this.selectedGraphObj);
  }

  addAxis() {
    this.visualizeMenuService.saveExistingPlotChange(this.selectedGraphObj);

  }

  removeAxis() {
    this.visualizeMenuService.removeAxis(this.selectedGraphObj);
  }

  setSeriesColor(index: number, seriesColor: string) {
    this.selectedGraphObj.data[index].marker.color = seriesColor;
    this.selectedGraphObj.data[index].line.color = seriesColor;
    this.isFormChangeEvent = true;
    this.visualizeMenuService.saveUserInputChange(this.selectedGraphObj);
  }
  
  setYAxisData() {
    if (this.selectedGraphObj.data[0].type == 'time-series' || this.selectedGraphObj.data[0].type == 'scattergl')  {
      this.visualizeMenuService.resetLayoutRelatedData(this.selectedGraphObj)
    }
    this.visualizeMenuService.setGraphYAxisData(this.selectedGraphObj);
  }
  
  removeYAxisData(index: number) {
    this.visualizeMenuService.removeYAxisData(index, this.selectedGraphObj);
  }

  addDataSeries(){
    this.visualizeMenuService.addDataSeries(this.selectedGraphObj);
  }

  focusField(){
    this.visualizeService.focusedPanel.next('yAxis');
  }

  focusOut(){
    this.visualizeService.focusedPanel.next('default');
  }
}
