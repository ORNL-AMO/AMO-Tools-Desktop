import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { AirLeakService } from '../air-leak.service';
import { AirLeakSurveyOutput } from '../../../../shared/models/standalone';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-air-leak-copy-table',
    templateUrl: './air-leak-copy-table.component.html',
    styleUrls: ['./air-leak-copy-table.component.css'],
    standalone: false
})
export class AirLeakCopyTableComponent implements OnInit {
  
  @ViewChild('leaksTable', { static: false }) leaksTable: ElementRef;
  @Input()
  settings: Settings;

  airLeakOutput: AirLeakSurveyOutput;
  airLeakOutputSub: Subscription;

  leaksTableString: any;

  constructor(private airLeakService: AirLeakService) { }

  ngOnInit(): void {
    this.airLeakOutputSub = this.airLeakService.airLeakOutput.subscribe(value => {
      this.airLeakOutput = value;
    })
  }

  ngOnDestroy() {
    this.airLeakOutputSub.unsubscribe();
  }
  updateLeaksTableString() {
    this.leaksTableString = this.leaksTable.nativeElement.innerText;
  }

}
