import { Component, OnInit, Input } from '@angular/core';
import { Directory } from '../../../shared/models/directory';
import { DirectoryDashboardService } from '../../directory-dashboard/directory-dashboard.service';
import { DirectoryItem, FilterDashboardBy } from '../../../shared/models/directory-dashboard';
import { firstValueFrom, Subscription } from 'rxjs';
import { DashboardService } from '../../dashboard.service';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

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
  selectedDirectoryId: number;
  selectedDirectoryIdSub: Subscription;
  constructor(private directoryDashboardService: DirectoryDashboardService, private dashboardService: DashboardService, private directoryDbService: DirectoryDbService,
    private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      if(this.directory){
        this.directory = this.directoryDbService.getById(this.directory.id);
        this.directoryItems = this.directoryDashboardService.getDirectoryItems(this.directory);

      }
    });
    this.filterDashboardBySub = this.directoryDashboardService.filterDashboardBy.subscribe(val => {
      this.filterDashboardBy = val;
    });
    this.sortBySub = this.directoryDashboardService.sortBy.subscribe(val => {
      this.sortBy = val;
    });
    this.selectedDirectoryIdSub = this.directoryDashboardService.selectedDirectoryId.subscribe(val => {
      this.selectedDirectoryId = val;
      this.checkSubDirectorySelected();
    })
  }

  ngOnDestroy() {
    this.sortBySub.unsubscribe();
    this.filterDashboardBySub.unsubscribe();
    this.updateDashboardDataSub.unsubscribe();
    this.selectedDirectoryIdSub.unsubscribe();
  }

  async toggleDirectoryCollapse(directory: Directory) {
    directory.collapsed = !directory.collapsed;
    let updatedDirectories: Directory[] = await firstValueFrom(this.directoryDbService.updateWithObservable(this.directory));
    this.directoryDbService.setAll(updatedDirectories);
  }

  checkSubDirectorySelected() {
    if(this.directory.collapsed == true && this.directory.id == this.selectedDirectoryId){
      this.toggleDirectoryCollapse(this.directory);
    }else if (this.directory.collapsed == true && this.directory.subDirectory) {
      this.checkSubDirectories(this.directory);
    }
  }

  checkSubDirectories(directory: Directory) {
    directory.subDirectory.forEach(directory => {
      if (directory.id == this.selectedDirectoryId) {
        this.toggleDirectoryCollapse(this.directory);
      } else {
        directory = this.directoryDbService.getById(directory.id);
        if (directory.subDirectory) {
          this.checkSubDirectories(directory);
        }
      }
    });
  }
}
