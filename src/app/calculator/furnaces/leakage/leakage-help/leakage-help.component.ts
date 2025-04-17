import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { LeakageService } from '../leakage.service';

@Component({
    selector: 'app-leakage-help',
    templateUrl: './leakage-help.component.html',
    styleUrls: ['./leakage-help.component.css'],
    standalone: false
})
export class LeakageHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;
  displaySuggestions: boolean;
  displayDescription: boolean = true;


  constructor(private leakageService: LeakageService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.leakageService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }
  
  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

  toggleSuggestions() {
    this.displaySuggestions = !this.displaySuggestions;
  }
  toggleDescription() {
    this.displayDescription = !this.displayDescription;
  }
}
