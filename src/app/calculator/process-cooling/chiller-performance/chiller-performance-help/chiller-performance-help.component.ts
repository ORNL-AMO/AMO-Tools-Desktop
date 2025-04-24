import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { ChillerPerformanceService } from '../chiller-performance.service';

@Component({
    selector: 'app-chiller-performance-help',
    templateUrl: './chiller-performance-help.component.html',
    styleUrls: ['./chiller-performance-help.component.css'],
    standalone: false
})
export class ChillerPerformanceHelpComponent implements OnInit {

  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;

  constructor(private chillerPerformanceService: ChillerPerformanceService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.chillerPerformanceService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }
  
  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

}
