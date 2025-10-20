import { Component } from '@angular/core';

@Component({
  selector: 'inventory-summary-filter',
  templateUrl: './summary-filter.component.html',
  styleUrls: ['./summary-filter.component.css'],
  standalone: false
})
export class SummaryFilterComponent {
  filtersCollapsed: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

  collapseFilters() {
    this.filtersCollapsed = !this.filtersCollapsed;
    window.dispatchEvent(new Event("resize"));
  }

}