import { Component, OnInit } from '@angular/core';
import { DirectoryDashboardService } from '../../directory-dashboard.service';
import { Subscription } from 'rxjs';

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
  constructor(private directoryDashboardService: DirectoryDashboardService) { }

  ngOnInit() {
    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });
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
}
