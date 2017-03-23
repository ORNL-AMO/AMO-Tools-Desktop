import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { AppComponent } from './app.component';

import { SharedModule } from './shared/shared.module';
import { routing, appRoutingProviders } from './app.routing';
import { CoreModule } from './core/core.module';
import { SankeyModalComponent } from './sankey-modal/sankey-modal.component';


@NgModule({
  declarations: [
    AppComponent,
    SankeyModalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    SharedModule,
    CoreModule,
    routing,
  ],
  providers: [
    appRoutingProviders
  ],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
