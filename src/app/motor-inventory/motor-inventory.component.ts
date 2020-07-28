import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { MotorInventoryService } from './motor-inventory.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-motor-inventory',
  templateUrl: './motor-inventory.component.html',
  styleUrls: ['./motor-inventory.component.css']
})
export class MotorInventoryComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  containerHeight: number;

  setupTabSub: Subscription;
  mainTab: string;
  mainTabSub: Subscription;

  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit() {
    this.setupTabSub = this.motorInventoryService.setupTab.subscribe(val => {
      this.getContainerHeight();
    });

    this.mainTabSub = this.motorInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    });
  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.mainTabSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.getContainerHeight();
  }

  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = this.header.nativeElement.clientHeight;
        let footerHeight = this.footer.nativeElement.clientHeight;
        this.containerHeight = contentHeight - headerHeight - footerHeight;
      }, 100);
    }
  }
}
