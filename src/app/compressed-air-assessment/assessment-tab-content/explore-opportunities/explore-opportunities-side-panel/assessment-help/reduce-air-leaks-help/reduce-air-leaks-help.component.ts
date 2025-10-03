import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment.service';

@Component({
    selector: 'app-reduce-air-leaks-help',
    templateUrl: './reduce-air-leaks-help.component.html',
    styleUrls: ['./reduce-air-leaks-help.component.css'],
    standalone: false
})
export class ReduceAirLeaksHelpComponent implements OnInit {

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
