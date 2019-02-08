import { Component, OnInit, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { ReplaceRewindResults } from '../replace-rewind.component';

@Component({
  selector: 'app-replace-rewind-results',
  templateUrl: './replace-rewind-results.component.html',
  styleUrls: ['./replace-rewind-results.component.css']
})
export class ReplaceRewindResultsComponent implements OnInit {
  @Input()
  results: ReplaceRewindResults;

  @ViewChild('copyTable') copyTable: ElementRef;
  tableString: any;

  constructor() { }

  ngOnInit() {
    this.updateTableString();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.results) {
      this.updateTableString();
    }
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

}
