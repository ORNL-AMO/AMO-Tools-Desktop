import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderFormComponent } from './header-form/header-form.component';
import { HeaderHelpComponent } from './header-help/header-help.component';
import { HeaderResultsComponent } from './header-results/header-results.component';
import { HeaderComponent } from './header.component';
import { HeaderService } from './header.service';
import { ReactiveFormsModule, FormsModule } from '../../../../../node_modules/@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [HeaderFormComponent, HeaderHelpComponent, HeaderResultsComponent, HeaderComponent],
  providers: [HeaderService],
  exports: [HeaderComponent]
})
export class HeaderModule { }
