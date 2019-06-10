import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
@Component({
  selector: 'app-exportable-results-table',
  templateUrl: './exportable-results-table.component.html',
  styleUrls: ['./exportable-results-table.component.css']
})
export class ExportableResultsTableComponent implements OnInit {
  @Input()
  columnTitles: Array<string>;
  @Input()
  rowData: Array<Array<string>>;
  @Input()
  tableString: any;
  @Output('updateTableString')
  updateTableString = new EventEmitter<boolean>();

  @ViewChild('copyTable') copyTable: ElementRef;
  showNotification: boolean = false;
  activateCheckmark: boolean = false;

  constructor() { }

  ngOnInit() {
  }


  copySuccess() {
    this.showNotification = true;
    this.activateCheckmark = true;

    setTimeout(() => {
      this.showNotification = false;
      this.activateCheckmark = false;
    }, 5000);
  }

  emitUpdateTableString() {
    this.updateTableString.emit();
  }

}
