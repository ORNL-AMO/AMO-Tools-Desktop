import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';

@Component({
    selector: 'app-add-receiver-volume-help',
    templateUrl: './add-receiver-volume-help.component.html',
    styleUrls: ['./add-receiver-volume-help.component.css'],
    standalone: false
})
export class AddReceiverVolumeHelpComponent implements OnInit {

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
