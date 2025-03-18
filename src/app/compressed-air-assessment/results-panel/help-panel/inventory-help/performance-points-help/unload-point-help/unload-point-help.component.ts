import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../../../compressed-air-assessment.service';

@Component({
    selector: 'app-unload-point-help',
    templateUrl: './unload-point-help.component.html',
    styleUrls: ['./unload-point-help.component.css'],
    standalone: false
})
export class UnloadPointHelpComponent implements OnInit {

  helpTextField: string;
  helpTextFieldSub: Subscription;

  focusedField: string;
  focusedFieldSub: Subscription;
  constructor(private compressedAirService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.focusedFieldSub = this.compressedAirService.focusedField.subscribe(val => {
      this.focusedField = val;
    });

    this.helpTextFieldSub = this.compressedAirService.helpTextField.subscribe(val => {
      this.helpTextField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
    this.helpTextFieldSub.unsubscribe();
  }

}
