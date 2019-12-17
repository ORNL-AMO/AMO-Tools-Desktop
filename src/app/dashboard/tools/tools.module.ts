import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsComponent } from './tools.component';
import { ToolsMenuComponent } from './tools-menu/tools-menu.component';
import { AddDataSetComponent } from './add-data-set/add-data-set.component';
import { ToolsService } from './tools.service';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  declarations: [ToolsComponent, ToolsMenuComponent, AddDataSetComponent],
  imports: [
    CommonModule,
    ModalModule
  ],
  providers: [
    ToolsService
  ]
})
export class ToolsModule { }
