import { Component, OnInit, Input } from '@angular/core';
import { ReplaceRewindResults } from '../replace-rewind.component';

@Component({
  selector: 'app-replace-rewind-results',
  templateUrl: './replace-rewind-results.component.html',
  styleUrls: ['./replace-rewind-results.component.css']
})
export class ReplaceRewindResultsComponent implements OnInit {
  @Input()
  results: ReplaceRewindResults;

  constructor() { }

  ngOnInit() {
  }

}
