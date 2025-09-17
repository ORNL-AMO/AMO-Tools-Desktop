import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { WallService } from '../wall.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-wall-help',
    templateUrl: './wall-help.component.html',
    styleUrls: ['./wall-help.component.css'],
    standalone: false
})
export class WallHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;
  displaySuggestions: boolean;

  docsLink: string = environment.measurDocsUrl;
  constructor(private wallService: WallService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.wallService.currentField.subscribe(val => {
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
