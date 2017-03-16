import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-head-tool-results',
  templateUrl: './head-tool-results.component.html',
  styleUrls: ['./head-tool-results.component.css']
})
export class HeadToolResultsComponent implements OnInit {
  @Input()
  results: any;
  constructor() { }

  ngOnInit() {
  }

}
