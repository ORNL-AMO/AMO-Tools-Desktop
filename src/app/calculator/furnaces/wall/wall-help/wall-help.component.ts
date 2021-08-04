import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { WallService } from '../wall.service';

@Component({
  selector: 'app-wall-help',
  templateUrl: './wall-help.component.html',
  styleUrls: ['./wall-help.component.css']
})
export class WallHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;
  displaySuggestions: boolean;


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
