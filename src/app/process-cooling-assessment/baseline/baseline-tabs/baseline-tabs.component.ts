import { Component, effect, ElementRef, inject, Signal, ViewChild } from '@angular/core';
import { ProcessCoolingUiService, SETUP_VIEW_LINKS } from '../../services/process-cooling-ui.service';

@Component({
  selector: 'app-baseline-tabs',
  standalone: false,
  templateUrl: './baseline-tabs.component.html',
  styleUrl: './baseline-tabs.component.css'
})
export class BaselineTabsComponent {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  smallScreenPanelTab: string = 'help';
  canContinue: boolean = true;

  readonly SETUP_VIEW_LINKS = SETUP_VIEW_LINKS;

  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  containerHeight: number;
  mainView: Signal<string> = this.processCoolingUiService.mainView;
  setupView: Signal<string> = this.processCoolingUiService.childView;

  constructor() {
    effect(() => {

      console.log('Main View:', this.mainView());
      console.log('Setup View:', this.setupView());
    });
  }

  continue() {
    this.processCoolingUiService.continue();
  }

  back() {
    this.processCoolingUiService.back();
  }


  setSmallScreenPanelTab(tab: string) {
    this.smallScreenPanelTab = tab;
  }

  //   showTooltip(badge: { display: boolean, hover: boolean }) {
  //   badge.hover = true;
  //   setTimeout(() => {
  //     this.checkHover(badge);
  //   }, 1000);
  // }

  // hideTooltip(badge: { display: boolean, hover: boolean }) {
  //   badge.hover = false;
  //   badge.display = false;
  // }

  // checkHover(badge: { display: boolean, hover: boolean }) {
  //   if (badge.hover) {
  //     badge.display = true;
  //   } else {
  //     badge.display = false;
  //   }
  // }


}
