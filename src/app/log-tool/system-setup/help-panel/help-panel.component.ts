import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-help-panel',
  templateUrl: './help-panel.component.html',
  styleUrls: ['./help-panel.component.css']
})
export class HelpPanelComponent implements OnInit {

  activeHelpPanel: string;
  displayTimeDetails: boolean;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.url.subscribe(url => {
      this.activeHelpPanel = this.activatedRoute.firstChild.routeConfig.path
    });
  }

  toggleTimeDetails() {
    this.displayTimeDetails = !this.displayTimeDetails;
  }

}
