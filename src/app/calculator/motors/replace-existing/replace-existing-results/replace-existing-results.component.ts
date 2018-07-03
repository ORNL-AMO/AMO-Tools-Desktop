import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-replace-existing-results',
  templateUrl: './replace-existing-results.component.html',
  styleUrls: ['./replace-existing-results.component.css']
})
export class ReplaceExistingResultsComponent implements OnInit {
  @Input()
  results: {annualEnergySavings: number, costSavings: number};
  
  constructor() { }

  ngOnInit() {
  }

}
