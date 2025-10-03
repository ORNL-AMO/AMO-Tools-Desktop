import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment.service';

@Component({
    selector: 'app-reduce-system-air-pressure-help',
    templateUrl: './reduce-system-air-pressure-help.component.html',
    styleUrls: ['./reduce-system-air-pressure-help.component.css'],
    standalone: false
})
export class ReduceSystemAirPressureHelpComponent implements OnInit {

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
