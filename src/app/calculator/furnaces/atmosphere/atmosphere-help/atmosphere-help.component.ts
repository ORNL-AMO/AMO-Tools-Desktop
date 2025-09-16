import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { AtmosphereService } from '../atmosphere.service';
import { environment } from '../../../../../environments/environment';

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

  docsLink: string = environment.measurDocsUrl;
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
