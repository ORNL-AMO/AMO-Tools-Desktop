import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { FixtureService } from '../fixture.service';

@Component({
  selector: 'app-fixture-help',
  templateUrl: './fixture-help.component.html',
  styleUrls: ['./fixture-help.component.css']
})
export class FixtureHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;
  displaySuggestions: boolean;


  constructor(private fixtureService: FixtureService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.fixtureService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }
  
  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

  toggleSuggestions() {
    this.displaySuggestions = !this.displaySuggestions;
  }
}
