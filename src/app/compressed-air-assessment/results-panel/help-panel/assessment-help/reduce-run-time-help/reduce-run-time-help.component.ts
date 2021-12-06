import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';

@Component({
  selector: 'app-reduce-run-time-help',
  templateUrl: './reduce-run-time-help.component.html',
  styleUrls: ['./reduce-run-time-help.component.css']
})
export class ReduceRunTimeHelpComponent implements OnInit {

  
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
