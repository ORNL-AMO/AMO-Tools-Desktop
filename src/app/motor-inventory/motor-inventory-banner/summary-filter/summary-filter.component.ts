import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-summary-filter',
  templateUrl: './summary-filter.component.html',
  styleUrls: ['./summary-filter.component.css']
})
export class SummaryFilterComponent implements OnInit {
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit(): void {
  }
}
