import { Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import { GraphDataObj, LogToolField } from '../../log-tool-models';

@Component({
  selector: 'app-visualize-menu',
  templateUrl: './visualize-menu.component.html',
  styleUrls: ['./visualize-menu.component.css']
})
export class VisualizeMenuComponent implements OnInit {

  graphDataSubscription: Subscription;
  graphData: Array<GraphDataObj>;
  selectedGraphDataSub: Subscription;
  selectedGraphData: GraphDataObj;
  xDataFieldDropdown: boolean = false;
  yDataFieldDropdown: boolean = false;
  graphTypeDropdown: boolean = false;
  histogramDataFieldDropdown: boolean = false;
  dataFields: Array<LogToolField>;

  graphTypes: Array<{ label: string, value: string }> = [{ value: 'scattergl', label: 'Scatter Plot' }, { value: 'bar', label: 'Histogram' }]
  showScatterLines: boolean = false;
  showScatterMarkers: boolean = true;
  constructor(private visualizeService: VisualizeService, private logToolDataService: LogToolDataService) { }


  ngOnInit() {
    this.dataFields = this.logToolDataService.getDataFieldOptionsWithDate();
    this.graphDataSubscription = this.visualizeService.graphData.subscribe(graphData => {
      this.graphData = graphData;
    });
    this.selectedGraphDataSub = this.visualizeService.selectedGraphData.subscribe(selectedGraphData => {
      this.selectedGraphData = selectedGraphData;
    });
  }

  ngOnDestroy() {
    this.selectedGraphDataSub.unsubscribe()
    this.graphDataSubscription.unsubscribe();
  }

  toggleXDataFieldDropdown() {
    this.xDataFieldDropdown = !this.xDataFieldDropdown;
  }

  toggleYDataFieldDropdown() {
    this.yDataFieldDropdown = !this.yDataFieldDropdown;
  }

  setXDataField(dataField: LogToolField) {
    this.visualizeService.updateSelectedXDataField(dataField);
    this.xDataFieldDropdown = false;
  }

  setYDataField(dataField: LogToolField) {
    this.visualizeService.updateSelectedYDataField(dataField);
    this.yDataFieldDropdown = false;
  }

  setGraphType(newGraphType: { label: string, value: string }) {
    this.visualizeService.updateGraphType(newGraphType);
    this.graphTypeDropdown = false;
  }

  toggleGraphType() {
    this.graphTypeDropdown = !this.graphTypeDropdown;
  }

  setUseStandardDeviation() {
    if (this.selectedGraphData.useStandardDeviation == false) {
      this.visualizeService.updateUseStandardDeviation(true);
    }
  }

  setUseBins() {
    if (this.selectedGraphData.useStandardDeviation == true) {
      this.visualizeService.updateUseStandardDeviation(false);
    }
  }

  decreaseNumberOfBins() {
    this.selectedGraphData.numberOfBins--;
    this.updateNumberOfBins();
  }

  increaseNumberOfBins() {
    this.selectedGraphData.numberOfBins++;
    this.updateNumberOfBins();
  }

  updateNumberOfBins() {
    this.visualizeService.updateNumberOfBins(this.selectedGraphData.numberOfBins);
  }

  toggleHistogramDataFieldDropdown() {
    this.histogramDataFieldDropdown = !this.histogramDataFieldDropdown;
  }

  setHistogramDataField(dataField: LogToolField) {
    this.visualizeService.updateSelectedHistogramDataField(dataField);
    this.histogramDataFieldDropdown = false;
  }
}
