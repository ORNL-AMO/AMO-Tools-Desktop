import { Component, OnInit, Input } from '@angular/core';
import { Directory } from '../../../shared/models/directory';

@Component({
  selector: 'app-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.css', '../assessment-grid-view.component.css']
})
export class SummaryCardComponent implements OnInit {
  @Input()
  directory: Directory;

  constructor() { }

  ngOnInit() {
  }

}
