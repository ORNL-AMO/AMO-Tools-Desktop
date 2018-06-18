import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatInfoComponent } from './fsat-info.component';

describe('FsatInfoComponent', () => {
  let component: FsatInfoComponent;
  let fixture: ComponentFixture<FsatInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
