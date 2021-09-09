import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';

@Component({
  selector: 'app-use-unloading-controls-help',
  templateUrl: './use-unloading-controls-help.component.html',
  styleUrls: ['./use-unloading-controls-help.component.css']
})
export class UseUnloadingControlsHelpComponent implements OnInit {

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
