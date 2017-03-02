import { Component, OnInit, Input, SimpleChange, Output, EventEmitter } from '@angular/core';
import { Adjustment } from '../../shared/models/psat';
//import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-data-panel',
  templateUrl: './data-panel.component.html',
  styleUrls: ['./data-panel.component.css']
})
export class DataPanelComponent implements OnInit {
  @Input()
  adjustment: Adjustment;
  @Output('showReport')
  showReport = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  goToReport(){
    this.showReport.emit(true);
  }

}
