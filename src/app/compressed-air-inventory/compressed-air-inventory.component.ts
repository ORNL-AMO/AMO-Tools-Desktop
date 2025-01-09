import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Co2SavingsData } from '../calculator/utilities/co2-savings/co2-savings.service';
import { Subscription } from 'rxjs';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { CompressedAirInventoryService } from './compressed-air-inventory.service';

@Component({
  selector: 'app-compressed-air-inventory',
  templateUrl: './compressed-air-inventory.component.html',
  styleUrl: './compressed-air-inventory.component.css'
})
export class CompressedAirInventoryComponent implements OnInit {

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  containerHeight: number;

  setupTabSub: Subscription;
  setupTab: string;
  mainTab: string;
  mainTabSub: Subscription;

  modalOpenSub: Subscription;
  isModalOpen: boolean;

  compressedAirInventoryDataSub: Subscription;
  compressedAirInventoryItem: InventoryItem;
  integrationStateSub: Subscription;
  showExportModal: boolean = false;
  showExportModalSub: Subscription;

  constructor(private compressedAirInventoryService: CompressedAirInventoryService) { }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }



  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = this.header.nativeElement.clientHeight;
        let footerHeight = 0;
        if (this.footer) {
          footerHeight = this.footer.nativeElement.clientHeight;
        }
        this.containerHeight = contentHeight - headerHeight - footerHeight;
      }, 100);
    }
  }


  continue() {
    if (this.setupTab == 'plant-setup') {
      this.compressedAirInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'department-setup') {
      this.compressedAirInventoryService.setupTab.next('pump-properties');
    } else if (this.setupTab == 'pump-properties') {
      this.compressedAirInventoryService.setupTab.next('pump-catalog');
    } else if (this.setupTab == 'pump-catalog') {
      this.compressedAirInventoryService.mainTab.next('summary');
    }
  }

  back(){
    if (this.setupTab == 'department-setup') {
      this.compressedAirInventoryService.setupTab.next('plant-setup');
    } else if (this.setupTab == 'pump-properties') {
      this.compressedAirInventoryService.setupTab.next('department-setup');
    } else if (this.setupTab == 'pump-catalog') {
      this.compressedAirInventoryService.setupTab.next('pump-properties');
    }
  }

}
