import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { FanSystemChecklistOutput } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
import { FanSystemChecklistService } from '../fan-system-checklist.service';

@Component({
  selector: 'app-fan-system-checklist-results',
  templateUrl: './fan-system-checklist-results.component.html',
  styleUrls: ['./fan-system-checklist-results.component.css']
})
export class FanSystemChecklistResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  
  fanSystemChecklistOutput: FanSystemChecklistOutput;
  fanSystemChecklistOutputSub: Subscription;
  
  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  
  table0String: any;
  
  constructor(private fanSystemChecklistService: FanSystemChecklistService) { }
  
  ngOnInit() {
    this.fanSystemChecklistOutputSub = this.fanSystemChecklistService.fanSystemChecklistOutput.subscribe(value => {
      this.fanSystemChecklistOutput = value;
    })
  }
  
  ngOnDestroy() {
    this.fanSystemChecklistOutputSub.unsubscribe();
  }
  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }
}
