import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';

@Component({
  selector: 'app-end-use-help',
  templateUrl: './end-use-help.component.html',
  styleUrls: ['./end-use-help.component.css']
})
export class EndUseHelpComponent implements OnInit {

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
