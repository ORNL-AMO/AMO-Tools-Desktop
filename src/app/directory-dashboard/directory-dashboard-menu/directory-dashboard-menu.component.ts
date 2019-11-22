import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { Directory } from '../../shared/models/directory';
import { DirectoryDashboardService } from '../directory-dashboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-directory-dashboard-menu',
  templateUrl: './directory-dashboard-menu.component.html',
  styleUrls: ['./directory-dashboard-menu.component.css']
})
export class DirectoryDashboardMenuComponent implements OnInit {

  breadCrumbs: Array<Directory>;
  directory: Directory;
  view: string = 'grid';
  isAllSelected: boolean;
  dashboardView: string;
  dashboardViewSub: Subscription;
  constructor(private activatedRoute: ActivatedRoute, private directoryDbService: DirectoryDbService, private directoryDashboardService: DirectoryDashboardService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      let id: number = Number(params['id']);
      this.breadCrumbs = new Array();
      this.directory = this.directoryDbService.getById(id);
      this.getBreadcrumbs(id);
    });

    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    })
  }

  getBreadcrumbs(dirId: number) {
    let resultDir = this.directoryDbService.getById(dirId);
    if (resultDir.id !== this.directory.id) {
      this.breadCrumbs.unshift(resultDir);
    }
    if (resultDir.parentDirectoryId) {
      this.getBreadcrumbs(resultDir.parentDirectoryId);
    }
  }

  toggleSelectAll() {
    this.directoryDashboardService.selectAll.next(this.isAllSelected);
  }

  setView(str: string) {
    this.directoryDashboardService.dashboardView.next(str);
  }
}
