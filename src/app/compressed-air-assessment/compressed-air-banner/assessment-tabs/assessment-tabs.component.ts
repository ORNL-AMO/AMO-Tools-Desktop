import { Component } from '@angular/core';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { Modification } from '../../../shared/models/compressed-air-assessment';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-assessment-tabs',
  standalone: false,
  templateUrl: './assessment-tabs.component.html',
  styleUrl: './assessment-tabs.component.css'
})
export class AssessmentTabsComponent {
  /*
  TABS:
  explore-opportunities
  profile-summary-table
  profile-summary-graphs
  */

  selectedModification: Modification;
  selectedModificationSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      this.selectedModification = val;
    });
  }

  ngOnDestroy() {
    this.selectedModificationSub.unsubscribe();
  }

  selectModification() {
    this.compressedAirAssessmentService.showModificationListModal.next(true);
  }

  back() {
    if(this.router.url.includes('explore-opportunities')){
      //back to end uses
      this.router.navigate(['baseline/end-uses'], { relativeTo: this.route });
    }else if(this.router.url.includes('profile-summary-table')){
      this.router.navigate(['assessment/explore-opportunities'], { relativeTo: this.route });
    }else if(this.router.url.includes('profile-summary-graphs')){
      this.router.navigate(['assessment/profile-summary-table'], { relativeTo: this.route });
    }
  }

  continue() {
    if(this.router.url.includes('explore-opportunities')){
      this.router.navigate(['assessment/profile-summary-table'], { relativeTo: this.route });
    }else if(this.router.url.includes('profile-summary-table')){
      this.router.navigate(['assessment/profile-summary-graphs'], { relativeTo: this.route });
    }else if(this.router.url.includes('profile-summary-graphs')){
      //report
      this.router.navigate(['diagram'], { relativeTo: this.route });
    }

  }

}
