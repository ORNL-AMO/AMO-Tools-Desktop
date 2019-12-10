import { Component, OnInit } from '@angular/core';
import { DirectoryDashboardService } from '../../directory-dashboard.service';
import { Subscription } from 'rxjs';
import { FilterDashboardBy } from '../../../../shared/models/directory-dashboard';

@Component({
  selector: 'app-content-controls',
  templateUrl: './content-controls.component.html',
  styleUrls: ['./content-controls.component.css']
})
export class ContentControlsComponent implements OnInit {

  dashboardView: string;
  dashboardViewSub: Subscription;
  sortByDropdown: boolean = false;
  filterDropdown: boolean = false;
  filterDashboardBy: FilterDashboardBy;
  filterDashboardBySub: Subscription;
  sortBy: string;
  sortByLabel: string;
  constructor(private directoryDashboardService: DirectoryDashboardService) { }

  ngOnInit() {
    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });

    this.filterDashboardBy = this.directoryDashboardService.filterDashboardBy.getValue();
    this.sortBy = this.directoryDashboardService.sortBy.getValue();
    this.setSortByLabel();
  }

  ngOnDestroy() {
    this.dashboardViewSub.unsubscribe();
  }


  toggleSortDropdown() {
    this.sortByDropdown = !this.sortByDropdown;
    if (this.filterDropdown == true && this.sortByDropdown == true) {
      this.filterDropdown = false;
    }
  }

  toggleFilterDropdown() {
    this.filterDropdown = !this.filterDropdown;
    if (this.filterDropdown == true && this.sortByDropdown == true) {
      this.sortByDropdown = false;
    }
  }

  setView(str: string) {
    this.directoryDashboardService.dashboardView.next(str);
  }

  updateFilterBy() {
    this.directoryDashboardService.filterDashboardBy.next(this.filterDashboardBy);
  }

  setSortBy(str: string) {
    this.sortBy = str;
    this.setSortByLabel();
    this.directoryDashboardService.sortBy.next(this.sortBy)
  }

  setSortByLabel() {
    if (this.sortBy == 'name') {
      this.sortByLabel = 'Name';
    } else if (this.sortBy == 'createdDate') {
      this.sortByLabel = 'Created Date';
    } else if (this.sortBy == 'modifiedDate') {
      this.sortByLabel = 'Last Updated';
    } else {
      this.sortByLabel = undefined;
    }
  }
}
