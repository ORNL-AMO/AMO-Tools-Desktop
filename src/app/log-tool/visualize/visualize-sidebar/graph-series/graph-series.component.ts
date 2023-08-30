import { Component, Input, SimpleChanges } from '@angular/core';
import { VisualizeService } from '../../visualize.service';
import { VisualizeMenuService } from '../../visualize-menu/visualize-menu.service';
import { GraphObj, YAxisDataOption } from '../../../log-tool-models';

@Component({
  selector: 'app-graph-series',
  templateUrl: './graph-series.component.html',
  styleUrls: ['./graph-series.component.css']
})
export class GraphSeriesComponent {
  @Input()
  selectedGraphObj: GraphObj;
  @Input()
  yAxisOptionIndex: number;
  
  currentYAxisOption: YAxisDataOption
  yAxisOptions: Array<{ axis: string, label: string }> = [{ axis: 'y', label: 'Left' }, { axis: 'y2', label: 'Right' }];
  
  constructor(private visualizeService: VisualizeService,
    private visualizeMenuService: VisualizeMenuService) { }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    debugger;
    this.currentYAxisOption = this.selectedGraphObj.selectedYAxisDataOptions.find((option, index) => index === this.yAxisOptionIndex);
  }

  saveChanges() {
    this.visualizeMenuService.saveExistingPlotChange(this.selectedGraphObj);
  }
  
  saveUserInput() {
    this.visualizeMenuService.saveUserInputChange(this.selectedGraphObj);
  }

  setSeriesColor() {
    this.selectedGraphObj.data[this.currentYAxisOption.index].marker.color = this.currentYAxisOption.seriesColor;
    this.selectedGraphObj.data[this.currentYAxisOption.index].line.color = this.currentYAxisOption.seriesColor;
    this.visualizeMenuService.saveExistingPlotChange(this.selectedGraphObj);
  }
  
  setYAxisData() {
    if (this.selectedGraphObj.data[0].type == 'time-series' || this.selectedGraphObj.data[0].type == 'scattergl')  {
      this.visualizeMenuService.resetLayoutRelatedData(this.selectedGraphObj)
    }
    this.visualizeMenuService.setGraphYAxisData(this.selectedGraphObj);
  }

  
  setXAxisDataOption() {
    this.visualizeMenuService.resetLayoutRelatedData(this.selectedGraphObj)
    this.visualizeMenuService.setSelectedXAxisDataOption(this.selectedGraphObj);
  }

  setHistogramStdDeviation(bool: boolean) {
    this.selectedGraphObj.useStandardDeviation = bool;
    this.setBarHistogramData();
  }

  setHistogramUsePercent(bool: boolean) {
    this.selectedGraphObj.usePercentForBins = bool;
    if (this.selectedGraphObj.usePercentForBins) {
      this.selectedGraphObj.layout.yaxis.ticksuffix = '%';
    } else {
      this.selectedGraphObj.layout.yaxis.ticksuffix = '';
    }
    this.setBarHistogramData();
  }

  setBarHistogramData() {
    this.visualizeMenuService.setBarHistogramData(this.selectedGraphObj);
  }


  removeYAxisData() {
    this.visualizeMenuService.removeYAxisData(this.yAxisOptionIndex, this.selectedGraphObj);
  }

  focusField(){
    let seriesField: string = this.yAxisOptionIndex === 0? 'primary-series' : 'other-series';
    this.visualizeService.focusedPanel.next(seriesField);
  }

  focusOut(){
    this.visualizeService.focusedPanel.next('default');
  }
}
