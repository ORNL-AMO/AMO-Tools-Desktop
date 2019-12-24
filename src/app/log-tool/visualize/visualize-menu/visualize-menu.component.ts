import { Component, OnInit } from '@angular/core';
import { VisualizeService, GraphDataObj } from '../visualize.service';
import { Subscription } from 'rxjs';
import { LogToolService, LogToolField } from '../../log-tool.service';

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
  dataFields: Array<LogToolField>;
  constructor(private visualizeService: VisualizeService, private logToolService: LogToolService) { }


  ngOnInit() {
    this.dataFields = this.logToolService.fields.filter((field) => { return field.useField == true });
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
  }

  setYDataField(dataField: LogToolField) {
    this.visualizeService.updateSelectedYDataField(dataField);
  }
}
