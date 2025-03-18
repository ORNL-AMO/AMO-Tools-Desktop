import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { AtmosphereService } from '../atmosphere.service';

@Component({
    selector: 'app-atmosphere-help',
    templateUrl: './atmosphere-help.component.html',
    styleUrls: ['./atmosphere-help.component.css'],
    standalone: false
})
export class AtmosphereHelpComponent implements OnInit {
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
