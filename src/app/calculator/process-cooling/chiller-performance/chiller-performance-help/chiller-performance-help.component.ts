import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chiller-performance-help',
  templateUrl: './chiller-performance-help.component.html',
  styleUrls: ['./chiller-performance-help.component.css']
})
export class ChillerPerformanceHelpComponent implements OnInit {

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
