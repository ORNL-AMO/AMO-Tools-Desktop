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
