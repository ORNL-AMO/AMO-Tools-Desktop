import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment.service';

@Component({
    selector: 'app-improve-end-use-efficiency-help',
    templateUrl: './improve-end-use-efficiency-help.component.html',
    styleUrls: ['./improve-end-use-efficiency-help.component.css'],
    standalone: false
})
export class ImproveEndUseEfficiencyHelpComponent implements OnInit {

  helpTextField: string;
  helpTextFieldSub: Subscription;
  constructor(private compressedAirService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.helpTextFieldSub = this.compressedAirService.helpTextField.subscribe(val => {
      this.helpTextField = val;
    });
  }

  ngOnDestroy(){
    this.helpTextFieldSub.unsubscribe();
  }
}
