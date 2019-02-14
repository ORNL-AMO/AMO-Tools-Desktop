import { Component, OnInit, Input } from '@angular/core';
import { LightingReplacementTreasureHunt } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-lighting-replacement-card',
  templateUrl: './lighting-replacement-card.component.html',
  styleUrls: ['./lighting-replacement-card.component.css']
})
export class LightingReplacementCardComponent implements OnInit {
  @Input()
  replacement: LightingReplacementTreasureHunt;
  @Input()
  settings: Settings;

  dropdownOpen: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  showDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
}
