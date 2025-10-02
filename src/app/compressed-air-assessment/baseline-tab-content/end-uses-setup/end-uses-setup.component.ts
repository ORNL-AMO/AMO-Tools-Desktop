import { Component } from '@angular/core';

@Component({
  selector: 'app-end-uses-setup',
  standalone: false,
  templateUrl: './end-uses-setup.component.html',
  styleUrl: './end-uses-setup.component.css'
})
export class EndUsesSetupComponent {

  tabSelect: 'end-uses' | 'help' = 'end-uses';
  setTab(str: 'end-uses' | 'help') {
    this.tabSelect = str;
  }
}
