import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';

@Component({
    selector: 'app-system-information-help',
    templateUrl: './system-information-help.component.html',
    styleUrls: ['./system-information-help.component.css'],
    standalone: false
})
export class SystemInformationHelpComponent implements OnInit {

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
