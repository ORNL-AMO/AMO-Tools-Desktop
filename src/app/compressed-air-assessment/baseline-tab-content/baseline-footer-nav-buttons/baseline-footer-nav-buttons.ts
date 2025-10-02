import { Component } from '@angular/core';

@Component({
  selector: 'app-baseline-footer-nav-buttons',
  templateUrl: './baseline-footer-nav-buttons.html',
  styleUrl: './baseline-footer-nav-buttons.css',
  standalone: false
})
export class BaselineFooterNavButtonsComponent {

  setupTab: string;
  disableNext: boolean = false;
  constructor() { }

  next() {

  }

  back() {

  }
}
