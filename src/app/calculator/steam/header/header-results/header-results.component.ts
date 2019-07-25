import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { HeaderOutput, HeaderOutputObj } from '../../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-header-results',
  templateUrl: './header-results.component.html',
  styleUrls: ['./header-results.component.css']
})
export class HeaderResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: HeaderOutput;
  @Input()
  numberOfInlets: number;

  @ViewChild('copyTable') copyTable: ElementRef;
  tableString: any;

  resultsArray: Array<HeaderOutputObj>;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.getResultsData();
  }

  getResultsData() {
    this.resultsArray = new Array<HeaderOutputObj>();
    let index: number = 0;
    for (let key in this.results) {
      if(key == 'header'){
        this.resultsArray.unshift(this.results[key]);
      }else if (index <= this.numberOfInlets) {
        this.resultsArray.push(this.results[key]);
      }
      index++;
    }
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
