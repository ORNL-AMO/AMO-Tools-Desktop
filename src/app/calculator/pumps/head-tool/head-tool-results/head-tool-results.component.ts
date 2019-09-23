import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-head-tool-results',
  templateUrl: './head-tool-results.component.html',
  styleUrls: ['./head-tool-results.component.css']
})
export class HeadToolResultsComponent implements OnInit {
  @Input()
  results: any;
  @Input()
  settings: Settings;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.updateTableString();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.results && changes.results.isFirstChange() == false) {
      this.updateTableString();
    }
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
