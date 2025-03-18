import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';

@Component({
    selector: 'app-system-basics-help',
    templateUrl: './system-basics-help.component.html',
    styleUrls: ['./system-basics-help.component.css'],
    standalone: false
})
export class SystemBasicsHelpComponent implements OnInit {

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
