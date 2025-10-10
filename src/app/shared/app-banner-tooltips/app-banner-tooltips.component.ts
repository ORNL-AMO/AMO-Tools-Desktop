import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-banner-tooltips',
  templateUrl: './app-banner-tooltips.component.html',
  styleUrls: ['./app-banner-tooltips.component.css'],
  standalone: false
})
export class BannerTooltipsComponent implements OnInit {
  @Input() message: string;
  @Input() adjustLeft: number = 0;
  @Input() adjustPercent: boolean = false;


  hover = false;
  display = false;

  showTooltip() {
    this.hover = true;
    this.display = true;
  }

  hideTooltip() {
    this.hover = false;
    this.display = false;
  }

  constructor() { }

  ngOnInit(): void {

  }
}