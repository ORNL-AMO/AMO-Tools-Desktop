import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../electron/electron.service';


@Component({
    selector: 'app-about-page',
    templateUrl: './about-page.component.html',
    styleUrls: ['./about-page.component.css'],
    standalone: false
})
export class AboutPageComponent implements OnInit {

  showSteam: boolean = false;
  showPSAT: boolean = false;
  showPHAST: boolean = false;
  showUser: boolean = false;
  showFAST: boolean = false;
  showDisclosure: boolean = false;
  showTreasureHunt: boolean = false;
  showDataExplorer: boolean = false;
  showInventory: boolean = false;
  showCompressedAir: boolean = false;  
  showWasteWater: boolean = false;    
  showWater: boolean = false;
  isElectronApp: boolean;
  constructor(private electronService: ElectronService) { }

  ngOnInit() {
    this.isElectronApp = this.electronService.isElectron;
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
  toggleDisclosure() {
    this.showDisclosure = !this.showDisclosure;
  }
  toggleSteam() {
    this.showSteam = !this.showSteam;
  }
  toggleTreasureHunt() {
    this.showTreasureHunt = !this.showTreasureHunt;
  }
  toggleDataExplorer() {
    this.showDataExplorer = !this.showDataExplorer;
  }
  toggleInventory() {
    this.showInventory = !this.showInventory;
  }
  toggleCompressedAir() {
    this.showCompressedAir = !this.showCompressedAir;
  }
  toggleWater() {
    this.showWater = !this.showWater;
  }
  toggleWasteWater() {
    this.showWasteWater = !this.showWasteWater;
  }
}
