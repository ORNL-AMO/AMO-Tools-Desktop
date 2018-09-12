import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatSystemSetupComponent } from './fsat-system-setup.component';

describe('FsatSystemSetupComponent', () => {
  let component: FsatSystemSetupComponent;
  let fixture: ComponentFixture<FsatSystemSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatSystemSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatSystemSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
