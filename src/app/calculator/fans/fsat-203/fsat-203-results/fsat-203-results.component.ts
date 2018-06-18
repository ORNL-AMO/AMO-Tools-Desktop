import { Component, OnInit, Input } from '@angular/core';
import { Fan203Results } from '../../../../shared/models/fans';

@Component({
  selector: 'app-fsat-203-results',
  templateUrl: './fsat-203-results.component.html',
  styleUrls: ['./fsat-203-results.component.css']
})
export class Fsat203ResultsComponent implements OnInit {
  @Input()
  results: Fan203Results;
  
  constructor() { }

  ngOnInit() {
  }

}
