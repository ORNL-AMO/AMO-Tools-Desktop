import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatFluidHelpComponent } from './fsat-fluid-help.component';

describe('FsatFluidHelpComponent', () => {
  let component: FsatFluidHelpComponent;
  let fixture: ComponentFixture<FsatFluidHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatFluidHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatFluidHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
