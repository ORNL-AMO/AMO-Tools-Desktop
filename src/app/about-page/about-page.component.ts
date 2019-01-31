import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: ['./about-page.component.css']
})
export class AboutPageComponent implements OnInit {

  showSystemRequirements: boolean = false;
  showPSAT: boolean = false;
  showPHAST: boolean = false;
  showUser: boolean = false;
  showFAST: boolean = false;
  constructor() { }

  ngOnInit() {
  }


  toggleShowSystemRequirements() {
    this.showSystemRequirements = !this.showSystemRequirements;
  }
  toggleShowPSAT() {
    this.showPSAT = !this.showPSAT;
  }
  toggleShowPHAST() {
    this.showPHAST = !this.showPHAST;
  }
  toggleShowUser() {
    this.showUser = !this.showUser;
  }
  toggleShowFAST() {
    this.showFAST = !this.showFAST;
  }
}
