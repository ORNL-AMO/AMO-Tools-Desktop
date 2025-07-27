import { Component, effect, ElementRef, HostListener, inject, Signal, ViewChild } from '@angular/core';
import { ProcessCoolingUiService } from '../services/process-cooling-ui.service';

@Component({
  selector: 'app-baseline',
  standalone: false,
  templateUrl: './baseline.component.html',
  styleUrl: './baseline.component.css'
})
export class BaselineComponent {
  showWelcomeScreen: boolean = false;
  smallScreenTab: string = 'form';
  showUpdateUnitsModal: boolean = false;

  private readonly processCoolingUiService = inject(ProcessCoolingUiService);


  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  containerHeight: number;
  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   this.setContainerHeight();
  // }

  mainView: Signal<string>;
  setupView: Signal<string>;
  constructor() {
    this.mainView = this.processCoolingUiService.mainView;
    this.setupView = this.processCoolingUiService.setupView;

    effect(() => {

      console.log('Main View:', this.mainView());
      console.log('Setup View:', this.setupView());
    });
  }

}
