import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { HeaderOutput, SteamPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';

@Component({
    selector: 'app-header-results',
    templateUrl: './header-results.component.html',
    styleUrls: ['./header-results.component.css'],
    standalone: false
})
export class HeaderResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: HeaderOutput;
  @Input()
  numberOfInlets: number;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  resultsArray: Array<SteamPropertiesOutput>;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.getResultsData();
  }

  getResultsData() {
    this.resultsArray = new Array<SteamPropertiesOutput>();
    let index: number = 0;
    for (let key in this.results) {
      if (index <= this.numberOfInlets) {
        if (key == 'header') {
          this.resultsArray.unshift(this.results[key]);
        } else {
          this.resultsArray.push(this.results[key]);
        }
      }
      index++;
    }
  }

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }
}
