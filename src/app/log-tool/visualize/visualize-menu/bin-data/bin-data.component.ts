import { Component, OnInit } from '@angular/core';
import { GraphObj } from '../../../log-tool-models';
import { Subscription } from 'rxjs';
import { VisualizeService } from '../../visualize.service';
import { VisualizeMenuService } from '../visualize-menu.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-bin-data',
  templateUrl: './bin-data.component.html',
  styleUrls: ['./bin-data.component.css']
})
export class BinDataComponent implements OnInit {

  selectedGraphObjSub: Subscription;
  selectedGraphObj: GraphObj;
  calculatingData: any;
  binError: string;
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
    if (this.selectedGraphObj.numberOfBins != 0 || this.selectedGraphObj.numberOfBins != undefined) {
      this.checkBinError();
      if (this.binError == undefined) {
        this.calculatingData = setTimeout(() => {
          this.selectedGraphObj = this.visualizeMenuService.setNumberOfBins(this.selectedGraphObj);
          this.save();
        }, 500);
      }
    }
  }

  setBinSize() {
    if (this.calculatingData) {
      clearTimeout(this.calculatingData);
    }
    if (this.selectedGraphObj.binSize != 0 && this.selectedGraphObj.binSize != undefined) {
      this.checkBinError();
      if (this.binError == undefined) {
        this.calculatingData = setTimeout(() => {
          this.selectedGraphObj = this.visualizeMenuService.setBins(this.selectedGraphObj);
          this.save();
        }, 500);
      }
    }
  }

  setMinBin() {
    if (this.calculatingData) {
      clearTimeout(this.calculatingData);
    }
    if (this.selectedGraphObj.binSize != 0 && this.selectedGraphObj.binSize != undefined &&
      this.selectedGraphObj.numberOfBins != 0 || this.selectedGraphObj.numberOfBins != undefined) {
      this.checkBinError();
      if (this.binError == undefined) {
        this.calculatingData = setTimeout(() => {
          this.selectedGraphObj = this.visualizeMenuService.setBins(this.selectedGraphObj, this.selectedGraphObj.bins[0].min);
          this.save();
        }, 500);
      }
    }
  }

  save() {
    this.visualizeService.plotFunctionType = 'react';
    this.visualizeMenuService.setBarHistogramData(this.selectedGraphObj);
  }

  checkBinError() {
    if (this.selectedGraphObj.binningMethod == 'numBins' && this.selectedGraphObj.numberOfBins > 500) {
      this.binError = 'Too Many Bins';
    } else if (this.selectedGraphObj.binningMethod == 'binSize') {
      let lowerBound = Number(_.min(this.selectedGraphObj.selectedXAxisDataOption.data));
      if (this.selectedGraphObj.bins[0].min != undefined) {
        lowerBound = this.selectedGraphObj.bins[0].min;
      }
      let maxValue = Number(_.max(this.selectedGraphObj.selectedXAxisDataOption.data));
      let range: number = maxValue - lowerBound;
      let numberOfBins: number = range / this.selectedGraphObj.binSize;
      if (numberOfBins > 500) {
        this.binError = 'Too Many Bins';
      } else {
        this.binError = undefined;
      }
    } else {
      this.binError = undefined;
    }
  }
}
