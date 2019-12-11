import { Component, OnInit, Input } from '@angular/core';
import { Directory } from '../../../shared/models/directory';
import { DirectoryDashboardService } from '../../directory-dashboard/directory-dashboard.service';
import { DirectoryItem, FilterDashboardBy } from '../../../shared/models/directory-dashboard';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../dashboard.service';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';

@Component({
  selector: 'app-directory-item',
  templateUrl: './directory-item.component.html',
  styleUrls: ['./directory-item.component.css']
})
export class DirectoryItemComponent implements OnInit {
  @Input()
  directory: Directory;

  directoryItems: Array<DirectoryItem>;
  filterDashboardBySub: Subscription;
  filterDashboardBy: FilterDashboardBy;
  sortBySub: Subscription;
  sortBy: { value: string, direction: string };
  updateDashboardDataSub: Subscription;
  constructor(private directoryDashboardService: DirectoryDashboardService, private dashboardService: DashboardService, private directoryDbService: DirectoryDbService) { }

  ngOnInit() {
    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      this.directory = this.directoryDbService.getById(this.directory.id);
      this.directoryItems = this.directoryDashboardService.getDirectoryItems(this.directory);
    });
    this.filterDashboardBySub = this.directoryDashboardService.filterDashboardBy.subscribe(val => {
      this.filterDashboardBy = val;
    });
    this.sortBySub = this.directoryDashboardService.sortBy.subscribe(val => {
      this.sortBy = val;
    });
  }

  ngOnDestroy() {
    this.sortBySub.unsubscribe();
    this.filterDashboardBySub.unsubscribe();
    this.updateDashboardDataSub.unsubscribe();
  }

  toggleDirectoryCollapse(directory: Directory) {
    directory.collapsed = !directory.collapsed;
  }
}
