import { Component, Input, Output, OnInit, EventEmitter, ViewChild, HostListener, ElementRef } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';


@Component({
    selector: 'app-flue-gas-moisture-modal',
    templateUrl: './flue-gas-moisture-modal.component.html',
    styleUrls: ['./flue-gas-moisture-modal.component.css']
  })
  
  export class FlueGasMoistureModalComponent implements OnInit {
    @Input()
    settings: Settings;
    @Output('hideModal')
    hideModal = new EventEmitter<number>();
    containerHeight: number;

    @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.resizeTabs();
    }

    constructor() {
    }
    
    ngOnInit() {}

    ngAfterViewInit() {
      setTimeout(() => {
        this.resizeTabs();
      }, 100);
    }

    hideMoistureModal(event: number) {
      this.hideModal.emit(event);
    }

    resizeTabs() {
      if (this.contentContainer) {
        this.containerHeight = this.contentContainer.nativeElement.offsetHeight;
      }
    }

  }