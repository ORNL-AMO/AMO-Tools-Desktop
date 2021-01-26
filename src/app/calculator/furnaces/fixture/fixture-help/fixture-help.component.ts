import { Component, OnInit } from '@angular/core';

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


  constructor(private atmosphereService: AtmosphereService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.atmosphereService.currentField.subscribe(val => {
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
