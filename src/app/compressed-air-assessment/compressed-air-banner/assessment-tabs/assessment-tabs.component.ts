import { Component } from '@angular/core';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { Modification } from '../../../shared/models/compressed-air-assessment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-assessment-tabs',
  standalone: false,
  templateUrl: './assessment-tabs.component.html',
  styleUrl: './assessment-tabs.component.css'
})
export class AssessmentTabsComponent {

  selectedModification: Modification;
  selectedModificationSub: Subscription;

  showModificationList: boolean = false;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void { 
    this.selectedModificationSub = this.compressedAirAssessmentService.selectedModification.subscribe(val => {
      this.selectedModification = val;
    });
  }

  ngOnDestroy(){
    this.selectedModificationSub.unsubscribe();
  }

  selectModification() {
   this.showModificationList = true;
  }

}
