import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css']
})

export class CoreComponent implements OnInit {
  updateAvailable: boolean;

  constructor(private ElectronService: ElectronService) { }

  ngOnInit() {
    console.log("here");
    this.updateAvailable = false;
    this.ElectronService.ipcRenderer.send('ready', null);
    this.ElectronService.ipcRenderer.on('available', (event, arg) => {
      console.log("true");
      this.updateAvailable = arg;
    });
    console.log(this.updateAvailable);
  }
}
