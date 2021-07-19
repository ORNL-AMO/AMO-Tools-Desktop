import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-system-profile-setup',
  templateUrl: './system-profile-setup.component.html',
  styleUrls: ['./system-profile-setup.component.css']
})
export class SystemProfileSetupComponent implements OnInit {

  displayCompressorOrdering: boolean;
  compressedAirAssessmentSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.compressedAirAssessmentSub = this.compressedAirAssessmentService.compressedAirAssessment.subscribe(val => {
      if(val){
        this.displayCompressorOrdering = val.compressorInventoryItems.length > 1;
      }
    });
  }

  ngOnDestroy(){
    this.compressedAirAssessmentSub.unsubscribe();
  }

}
