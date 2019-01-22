import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../models/settings';

@Component({
  selector: 'app-exportable-table',
  templateUrl: './exportable-table.component.html',
  styleUrls: ['./exportable-table.component.css']
})
export class ExportableTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  columnTitles: Array<string>;
  @Input()
  rowData: Array<Array<string>>;
  @Input()
  keyColors: Array<{ borderColor: string, fillColor: string }>;
  //use output for hover index
  @Output('highlightPoint')
  highlightPoint = new EventEmitter<number>();
  @Output('unhighlightPoint')
  unhighlightPoint = new EventEmitter<number>();
  @Output('deleteFromTable')
  deleteFromTable = new EventEmitter<number>();

  @ViewChild('copyTable') copyTable: ElementRef;

  exportColumnTitles: Array<string>;
  exportRowData: Array<Array<string>>;
  tableString: any;
  isCopied1: boolean = false;
  showNotification: boolean = false;
  activateCheckmark: boolean = false;

  constructor() { }

  ngOnInit() {
    this.updateTableString();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.rowData) {
      this.updateTableString();
    }
  }

  updateExportData() {
    this.exportColumnTitles = new Array<string>();
    this.exportRowData = new Array<Array<string>>();
    for (let i = 0; i < this.columnTitles.length; i++) {
      this.exportColumnTitles.push(this.columnTitles[i]);
    }
    this.exportColumnTitles.unshift("Point");

    for (let i = 0; i < this.rowData.length; i++) {
      let tmpArray = new Array<string>();
      tmpArray.push((i + 1).toString());
      for (let j = 0; j < this.rowData[i].length; j++) {
        tmpArray.push(this.rowData[i][j]);
      }
      this.exportRowData.push(tmpArray);
    }
  }


  emitHighlightPoint(i: number) {
    this.updateTableString();
    this.highlightPoint.emit(i);
  }

  emitUnhighlightPoint(i: number) {
    this.unhighlightPoint.emit(i);
  }

  emitDeleteFromTable(i: number) {
    this.deleteFromTable.emit(i);
    this.updateTableString();
  }


  updateTableString() {
    this.updateExportData();
    this.tableString = this.copyTable.nativeElement.innerText;
  }

  copySuccess() {
    this.showNotification = true;
    this.activateCheckmark = true;

    setTimeout(() => {
      this.showNotification = false;
      this.activateCheckmark = false;
    }, 5000);
  }

}
