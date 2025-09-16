import { Component, Input } from '@angular/core';
import { Calculator } from '../../../shared/models/calculators';
import { DashboardService } from '../../dashboard.service';
import { DirectoryDashboardService } from '../../directory-dashboard/directory-dashboard.service';
import { DirectoryItem } from '../../../shared/models/directory-dashboard';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-pre-assessment-item',
    templateUrl: './pre-assessment-item.component.html',
    styleUrls: ['./pre-assessment-item.component.css'],
    standalone: false
})
export class PreAssessmentItemComponent {
  @Input()
  directoryItem: DirectoryItem;
  currentRoute: string;
  routeSub: Subscription
  
  constructor(private directoryDashboardService: DirectoryDashboardService, 
    private router: Router,
    private dashboardService: DashboardService) { }

  ngOnInit() {}

  goToPreAssessment() {
    let queryParams = { showPreAssessmentIndex: this.directoryItem.calculatorIndex };
    let url = '/directory-dashboard/';
    if (this.router.url && !this.router.url.includes(url)) {
      this.dashboardService.navigateWithSidebarOptions(url + this.directoryItem.calculator.directoryId, {shouldCollapse: true}, queryParams);
    } else {
      this.directoryDashboardService.showPreAssessmentModalIndex.next({ index: this.directoryItem.calculatorIndex, isNew: false });
    }
  }
}
