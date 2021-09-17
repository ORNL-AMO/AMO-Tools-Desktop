import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { LogToolDbService } from './log-tool-db.service';
import { LogToolService } from './log-tool.service';

@Component({
  selector: 'app-log-tool',
  templateUrl: './log-tool.component.html',
  styleUrls: ['./log-tool.component.css']
})
export class LogToolComponent implements OnInit {
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  containerHeight: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  openExportDataSub: Subscription;
  openExportData: boolean;

  constructor(private activatedRoute: ActivatedRoute, private logToolDbService: LogToolDbService, private logToolService: LogToolService) { }

  ngOnInit() {
    this.logToolDbService.initLogToolData();
    this.activatedRoute.url.subscribe(url => {
      this.getContainerHeight();
    });

    this.openExportDataSub = this.logToolService.openExportData.subscribe(val => {
      this.openExportData = val;
    });

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = this.header.nativeElement.clientHeight;
        this.containerHeight = contentHeight - headerHeight;
      }, 100);
    }
  }

  ngOnDestroy(){
    this.openExportDataSub.unsubscribe();
  }
  
}
