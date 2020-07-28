import { Component, OnInit } from '@angular/core';
import { GraphObj } from '../../../log-tool-models';
import { Subscription } from 'rxjs';
import { VisualizeService } from '../../visualize.service';
import { VisualizeMenuService } from '../visualize-menu.service';

@Component({
  selector: 'app-bin-data',
  templateUrl: './bin-data.component.html',
  styleUrls: ['./bin-data.component.css']
})
export class BinDataComponent implements OnInit {

  selectedGraphObjSub: Subscription;
  selectedGraphObj: GraphObj;
  calculatingData: any;
  constructor(private visualizeService: VisualizeService, private visualizeMenuService: VisualizeMenuService) { }

  ngOnInit(): void {
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      this.selectedGraphObj = val;
    });
  }

  ngOnDestroy() {
    this.selectedGraphObjSub.unsubscribe();
  }

  focusField() {
    this.visualizeService.focusedPanel.next('histogramBins');
  }

  focusOut() {
    this.visualizeService.focusedPanel.next('default');
  }

  setNumberOfBins() {
    if (this.calculatingData) {
      clearTimeout(this.calculatingData);
    }
    this.calculatingData = setTimeout(() => {
      this.selectedGraphObj = this.visualizeMenuService.setNumberOfBins(this.selectedGraphObj);
      this.save();
    }, 500);
  }

  setBinSize() {
    if (this.calculatingData) {
      clearTimeout(this.calculatingData);
    }
    this.calculatingData = setTimeout(() => {
      this.selectedGraphObj = this.visualizeMenuService.setBins(this.selectedGraphObj);
      this.save();
    }, 500);
  }

  setMinBin() {
    if (this.calculatingData) {
      clearTimeout(this.calculatingData);
    }
    this.calculatingData = setTimeout(() => {
      this.selectedGraphObj = this.visualizeMenuService.setBins(this.selectedGraphObj, this.selectedGraphObj.bins[0].min);
      this.save();
    }, 500);
  }

  save() {
    this.visualizeService.plotFunctionType = 'react';
    this.visualizeMenuService.setBarHistogramData(this.selectedGraphObj);
  }
}
