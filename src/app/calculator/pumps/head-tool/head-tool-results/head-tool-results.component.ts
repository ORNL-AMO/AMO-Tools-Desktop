import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { HeadToolResults } from '../head-tool.component';
@Component({
  selector: 'app-head-tool-results',
  templateUrl: './head-tool-results.component.html',
  styleUrls: ['./head-tool-results.component.css']
})
export class HeadToolResultsComponent implements OnInit {
  @Input()
  results: HeadToolResults;
  @Input()
  settings: Settings;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  constructor() { }

  ngOnInit() {
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
