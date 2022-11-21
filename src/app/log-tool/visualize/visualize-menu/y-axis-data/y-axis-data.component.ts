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

  yAxisOptions: Array<{ axis: string, label: string }> = [{ axis: 'y', label: 'Left' }, { axis: 'y2', label: 'Right' }];
  constructor(private visualizeService: VisualizeService, 
    private logToolDataService: LogToolDataService, private visualizeMenuService: VisualizeMenuService) { }
  ngOnInit(): void {
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      this.selectedGraphObj = val;
    });
  }

  ngOnDestroy() {
    this.selectedGraphObjSub.unsubscribe();
  }

  saveChanges() {
    this.visualizeMenuService.saveUserGraphOptionsChange(this.selectedGraphObj);
  }

  addAxis() {
    this.visualizeMenuService.addAxis(this.selectedGraphObj);
  }

  removeAxis() {
    this.logToolDataService.loadingSpinner.next({show: true, msg: `Graphing Data...`})
    this.visualizeMenuService.removeAxis(this.selectedGraphObj);
  }


  setYAxisData() {
    this.logToolDataService.loadingSpinner.next({show: true, msg: `Graphing Data...`})
    this.visualizeMenuService.setGraphYAxisData(this.selectedGraphObj);
  }

  removeYAxisData(index: number) {
    this.logToolDataService.loadingSpinner.next({show: true, msg: `Graphing Data...`})
    this.visualizeMenuService.removeYAxisData(index, this.selectedGraphObj);
  }

  addData(){
    this.logToolDataService.loadingSpinner.next({show: true, msg: `Adding Data Series...`});
    this.visualizeMenuService.addData(this.selectedGraphObj);
  }

  focusField(){
    this.visualizeService.focusedPanel.next('yAxis');
  }

  focusOut(){
    this.visualizeService.focusedPanel.next('default');
  }
}
