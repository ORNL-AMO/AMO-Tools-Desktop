import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';

@Component({
  selector: 'app-input-summary',
  templateUrl: './input-summary.component.html',
  styleUrls: ['./input-summary.component.css']
})
export class InputSummaryComponent implements OnInit {
  @Input()
  baseline: PSAT;
  constructor() { }

  ngOnInit() {
  }

}
