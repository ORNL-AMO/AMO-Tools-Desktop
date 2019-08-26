import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SteamReductionResults } from '../../../../shared/models/standalone';

@Component({
  selector: 'app-steam-reduction-results',
  templateUrl: './steam-reduction-results.component.html',
  styleUrls: ['./steam-reduction-results.component.css']
})
export class SteamReductionResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  results: SteamReductionResults;
  @Input()
  modificationExists: boolean;

  @ViewChild('copyTable0') copyTable0: ElementRef;
  table0String: any;


  constructor() { }

  ngOnInit() {
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }

}
