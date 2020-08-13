import { Component, OnInit } from '@angular/core';
import { GraphObj } from '../../../log-tool-models';
import { Subscription } from 'rxjs';
import { VisualizeService } from '../../visualize.service';
import { VisualizeMenuService } from '../visualize-menu.service';

@Component({
  selector: 'app-x-axis-data',
  templateUrl: './x-axis-data.component.html',
  styleUrls: ['./x-axis-data.component.css']
})
export class XAxisDataComponent implements OnInit {

  selectedGraphObj: GraphObj;
  selectedGraphObjSub: Subscription;

  constructor(private visualizeService: VisualizeService, private visualizeMenuService: VisualizeMenuService) { }
  ngOnInit(): void {
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      this.selectedGraphObj = val;
    });
  }

  ngOnDestroy() {
    this.selectedGraphObjSub.unsubscribe();
  }

  saveChanges() {
    this.visualizeService.plotFunctionType = 'update';
    this.visualizeMenuService.save(this.selectedGraphObj);
  }

  setXAxisDataOption() {
    this.visualizeService.plotFunctionType = 'update';
    this.visualizeMenuService.setXAxisDataOption(this.selectedGraphObj);
  }

  focusField() {
    this.visualizeService.focusedPanel.next('xAxis');
  }

  focusOut() {
    this.visualizeService.focusedPanel.next('default');
  }
}
