import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.url.subscribe(url => {
      this.getContainerHeight();
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
}
