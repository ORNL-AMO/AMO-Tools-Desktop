import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-summary-filter',
    templateUrl: './summary-filter.component.html',
    styleUrls: ['./summary-filter.component.css'],
    standalone: false
})
export class SummaryFilterComponent implements OnInit {

  filtersCollaped: boolean = true;
  
  constructor() { }

  ngOnInit(): void {
  }

  collapseFilters(){
    this.filtersCollaped = !this.filtersCollaped;
    window.dispatchEvent(new Event("resize"));
  }
}
