import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';

@Component({
    selector: 'app-design-details-help',
    templateUrl: './design-details-help.component.html',
    styleUrls: ['./design-details-help.component.css'],
    standalone: false
})
export class DesignDetailsHelpComponent implements OnInit {

  
  focusedField: string;
  focusedFieldSub: Subscription;
  constructor(private compressedAirService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.focusedFieldSub = this.compressedAirService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }

}
