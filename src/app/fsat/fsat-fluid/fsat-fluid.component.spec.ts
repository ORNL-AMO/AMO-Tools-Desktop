import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatFluidComponent } from './fsat-fluid.component';

describe('FsatFluidComponent', () => {
  let component: FsatFluidComponent;
  let fixture: ComponentFixture<FsatFluidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatFluidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatFluidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
