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
  sortBy: { value: string, direction: string };
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
    this.sortBy.value = str;
    this.setSortByLabel();
    this.directoryDashboardService.sortBy.next(this.sortBy)
  }

  setSortByLabel() {
    if (this.sortBy.value == 'name') {
      this.sortByLabel = 'Name';
    } else if (this.sortBy.value == 'createdDate') {
      this.sortByLabel = 'Created';
    } else if (this.sortBy.value == 'modifiedDate') {
      this.sortByLabel = 'Last Updated';
    } else if (this.sortBy.value == 'type') {
      this.sortByLabel = 'Type';
    } else {
      this.sortByLabel = undefined;
    }
  }

  toggleSortDirection() {
    if (this.sortBy.direction == 'asc') {
      this.sortBy.direction = 'desc';
    } else if (this.sortBy.direction == 'desc') {
      this.sortBy.direction = 'asc';
    }
    this.directoryDashboardService.sortBy.next(this.sortBy)
  }

  setShowAll() {
    this.filterDashboardBy.showAll = true;
  }

  checkShowAll() {
    this.filterDashboardBy.showAll = (this.filterDashboardBy.showPumps == false &&
      this.filterDashboardBy.showFans == false &&
      this.filterDashboardBy.showSteam == false &&
      this.filterDashboardBy.showTreasureHunt == false &&
      this.filterDashboardBy.showWasteWater == false &&
      // this.filterDashboardBy.showSubFolders == false &&
      this.filterDashboardBy.showPreAssessments == false &&
      this.filterDashboardBy.showPhast == false &&
      this.filterDashboardBy.showMotorInventory == false &&
      this.filterDashboardBy.showCompressedAir == false
    );
  }

  setFilterPump() {
    if (this.filterDashboardBy.showPumps == false || this.filterDashboardBy.showAll == true) {
      if (this.filterDashboardBy.showAll == true) {
        this.filterDashboardBy.showAll = false;
        this.filterDashboardBy.showFans = false;
        this.filterDashboardBy.showSteam = false;
        this.filterDashboardBy.showTreasureHunt = false;
        // this.filterDashboardBy.showSubFolders = false;
        this.filterDashboardBy.showPreAssessments = false;
        this.filterDashboardBy.showPhast = false;
        this.filterDashboardBy.showMotorInventory = false;
        this.filterDashboardBy.showCompressedAir = false;
      }
      this.filterDashboardBy.showPumps = true;
    } else {
      this.filterDashboardBy.showPumps = false;
      this.checkShowAll();
    }
    this.updateFilterBy();
  }

  setFilterFans() {
    if (this.filterDashboardBy.showFans == false || this.filterDashboardBy.showAll == true) {
      if (this.filterDashboardBy.showAll == true) {
        this.filterDashboardBy.showAll = false;
        this.filterDashboardBy.showPumps = false;
        this.filterDashboardBy.showSteam = false;
        this.filterDashboardBy.showTreasureHunt = false;
        // this.filterDashboardBy.showSubFolders = false;
        this.filterDashboardBy.showPreAssessments = false;
        this.filterDashboardBy.showPhast = false;
        this.filterDashboardBy.showMotorInventory = false;
        this.filterDashboardBy.showCompressedAir = false;
      }
      this.filterDashboardBy.showFans = true;
    } else {
      this.filterDashboardBy.showFans = false;
      this.checkShowAll();
    }
    this.updateFilterBy();
  }

  setFilterProcessHeating() {
    if (this.filterDashboardBy.showPhast == false || this.filterDashboardBy.showAll == true) {
      if (this.filterDashboardBy.showAll == true) {
        this.filterDashboardBy.showAll = false;
        this.filterDashboardBy.showPumps = false;
        this.filterDashboardBy.showSteam = false;
        this.filterDashboardBy.showTreasureHunt = false;
        // this.filterDashboardBy.showSubFolders = false;
        this.filterDashboardBy.showPreAssessments = false;
        this.filterDashboardBy.showFans = false;
        this.filterDashboardBy.showMotorInventory = false;
        this.filterDashboardBy.showCompressedAir = false;
      }
      this.filterDashboardBy.showPhast = true;
    } else {
      this.filterDashboardBy.showPhast = false;
      this.checkShowAll();
    }
    this.updateFilterBy();
  }

  setFilterSteam() {
    if (this.filterDashboardBy.showSteam == false || this.filterDashboardBy.showAll == true) {
      if (this.filterDashboardBy.showAll == true) {
        this.filterDashboardBy.showAll = false;
        this.filterDashboardBy.showPumps = false;
        this.filterDashboardBy.showPhast = false;
        // this.filterDashboardBy.showSubFolders = false;
        this.filterDashboardBy.showPreAssessments = false;
        this.filterDashboardBy.showTreasureHunt = false;
        this.filterDashboardBy.showFans = false;
        this.filterDashboardBy.showMotorInventory = false;
        this.filterDashboardBy.showCompressedAir = false;
      }
      this.filterDashboardBy.showSteam = true;
    } else {
      this.filterDashboardBy.showSteam = false;
      this.checkShowAll();
    }
    this.updateFilterBy();
  }

  setFilterTreasureHunt() {
    if (this.filterDashboardBy.showTreasureHunt == false || this.filterDashboardBy.showAll == true) {
      if (this.filterDashboardBy.showAll == true) {
        this.filterDashboardBy.showAll = false;
        this.filterDashboardBy.showPumps = false;
        this.filterDashboardBy.showSteam = false;
        this.filterDashboardBy.showPhast = false;
        // this.filterDashboardBy.showSubFolders = false;
        this.filterDashboardBy.showPreAssessments = false;
        this.filterDashboardBy.showFans = false;
        this.filterDashboardBy.showMotorInventory = false;
        this.filterDashboardBy.showCompressedAir = false;
      }
      this.filterDashboardBy.showTreasureHunt = true;
    } else {
      this.filterDashboardBy.showTreasureHunt = false;
      this.checkShowAll();
    }
    this.updateFilterBy();
  }

  setFilterPreAssessments() {
    if (this.filterDashboardBy.showPreAssessments == false || this.filterDashboardBy.showAll == true) {
      if (this.filterDashboardBy.showAll == true) {
        this.filterDashboardBy.showAll = false;
        this.filterDashboardBy.showPumps = false;
        this.filterDashboardBy.showSteam = false;
        this.filterDashboardBy.showPhast = false;
        // this.filterDashboardBy.showSubFolders = false;
        this.filterDashboardBy.showTreasureHunt = false;
        this.filterDashboardBy.showFans = false;
        this.filterDashboardBy.showMotorInventory = false;
        this.filterDashboardBy.showCompressedAir = false;
      }
      this.filterDashboardBy.showPreAssessments = true;
    } else {
      this.filterDashboardBy.showPreAssessments = false;
      this.checkShowAll();
    }
    this.updateFilterBy();
  }

  setFilterMotorInventory() {
    if (this.filterDashboardBy.showMotorInventory == false || this.filterDashboardBy.showAll == true) {
      if (this.filterDashboardBy.showAll == true) {
        this.filterDashboardBy.showAll = false;
        this.filterDashboardBy.showPumps = false;
        this.filterDashboardBy.showSteam = false;
        this.filterDashboardBy.showPhast = false;
        this.filterDashboardBy.showPreAssessments = false;
        this.filterDashboardBy.showTreasureHunt = false;
        this.filterDashboardBy.showFans = false;
        this.filterDashboardBy.showCompressedAir = false;
      }
      this.filterDashboardBy.showMotorInventory = true;
    } else {
      this.filterDashboardBy.showMotorInventory = false;
      this.checkShowAll();
    }
    this.updateFilterBy();
  }

  setFilterWasteWater() {
    if (this.filterDashboardBy.showWasteWater == false || this.filterDashboardBy.showAll == true) {
      if (this.filterDashboardBy.showAll == true) {
        this.filterDashboardBy.showAll = false;
        this.filterDashboardBy.showPumps = false;
        this.filterDashboardBy.showPhast = false;
        this.filterDashboardBy.showSteam = false;
        this.filterDashboardBy.showPreAssessments = false;
        this.filterDashboardBy.showTreasureHunt = false;
        this.filterDashboardBy.showFans = false;
        this.filterDashboardBy.showMotorInventory = false;
        this.filterDashboardBy.showCompressedAir = false;
      }
      this.filterDashboardBy.showWasteWater = true;
    } else {
      this.filterDashboardBy.showWasteWater = false;
      this.checkShowAll();
    }
    this.updateFilterBy();
  }
}
