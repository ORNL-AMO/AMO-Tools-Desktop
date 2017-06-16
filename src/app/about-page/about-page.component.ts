import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.css']
})
export class AboutPageComponent implements OnInit {

  showSystemRequirements: boolean = false;

  constructor() { }

  ngOnInit() {
  }


  toggleShowSystemRequirements() {
    this.showSystemRequirements = !this.showSystemRequirements;
  }

}
