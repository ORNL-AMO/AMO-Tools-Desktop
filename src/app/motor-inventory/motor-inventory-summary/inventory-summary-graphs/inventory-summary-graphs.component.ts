import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-inventory-summary-graphs',
  templateUrl: './inventory-summary-graphs.component.html',
  styleUrls: ['./inventory-summary-graphs.component.css']
})
export class InventorySummaryGraphsComponent implements OnInit {
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit(): void {
  }

}
