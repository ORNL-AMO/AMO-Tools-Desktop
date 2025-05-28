import { Component, Input, SimpleChanges } from '@angular/core';
import { VisualizeService } from '../../visualize.service';
import { GraphObj, YAxisDataOption } from '../../../log-tool-models';
import { VisualizeSidebarService } from '../visualize-sidebar.service';

@Component({
    selector: 'app-graph-series',
    templateUrl: './graph-series.component.html',
    styleUrls: ['./graph-series.component.css'],
    standalone: false
})
export class GraphSeriesComponent {
  @Input()
  selectedGraphObj: GraphObj;
  @Input()
  selectedYAxisDataOptions: YAxisDataOption[];
  @Input()
  yAxisOptionIndex: number;
  
  currentYAxisOption: YAxisDataOption;
  yAxisOptions: Array<{ axis: string, label: string }> = [{ axis: 'y', label: 'Left' }, { axis: 'y2', label: 'Right' }];
  
  constructor(private visualizeService: VisualizeService,
    private visualizeSidebarService: VisualizeSidebarService
    ) { }

  ngOnInit(): void {}
  
  ngOnChanges(changes: SimpleChanges) {
    if (this.selectedYAxisDataOptions) {
      this.currentYAxisOption = this.selectedYAxisDataOptions.find((option, index) => index === this.yAxisOptionIndex);
    }
  }

  saveChanges() {
    this.visualizeSidebarService.saveExistingPlotChange(this.selectedGraphObj);
  }
  
  saveSeriesNameChange() {
    // * if we trust visualizeSidebarService.setGraphYAxisData, indexes of selectedYAxisDataOptions and selectedGraphObj.data are always aligned
    this.selectedGraphObj.data[this.yAxisOptionIndex].name = this.currentYAxisOption.seriesName;
    this.visualizeSidebarService.saveUserInputChange(this.selectedGraphObj);
  }

  setSeriesColor() {
    this.selectedGraphObj.data[this.currentYAxisOption.index].marker.color = this.currentYAxisOption.seriesColor;
    this.selectedGraphObj.data[this.currentYAxisOption.index].line.color = this.currentYAxisOption.seriesColor;
    this.visualizeSidebarService.saveExistingPlotChange(this.selectedGraphObj);
  }
  
  setYAxisData() {
    if (this.selectedGraphObj.data[0].type == 'time-series' || this.selectedGraphObj.data[0].type == 'scattergl')  {
      this.visualizeSidebarService.resetLayoutRelatedData(this.selectedGraphObj)
    }
    this.visualizeSidebarService.setGraphYAxisData(this.selectedGraphObj);
  }

  
  setXAxisDataOption() {
    this.visualizeSidebarService.resetLayoutRelatedData(this.selectedGraphObj)
    this.visualizeSidebarService.setSelectedXAxisDataOption(this.selectedGraphObj);
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
    this.visualizeSidebarService.setBarHistogramData(this.selectedGraphObj);
  }


  removeYAxisData() {
    this.visualizeSidebarService.removeYAxisData(this.yAxisOptionIndex, this.selectedGraphObj);
  }

  focusField(){
    let seriesField: string = this.yAxisOptionIndex === 0? 'primary-series' : 'other-series';
    this.visualizeService.focusedPanel.next(seriesField);
  }

  focusOut(){
    this.visualizeService.focusedPanel.next('default');
  }
}
