import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment.service';

@Component({
  selector: 'app-use-automatic-sequencer-help',
  templateUrl: './use-automatic-sequencer-help.component.html',
  styleUrls: ['./use-automatic-sequencer-help.component.css']
})
export class UseAutomaticSequencerHelpComponent implements OnInit {

  
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
