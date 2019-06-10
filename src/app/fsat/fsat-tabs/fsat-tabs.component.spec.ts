import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatTabsComponent } from './fsat-tabs.component';

describe('FsatTabsComponent', () => {
  let component: FsatTabsComponent;
  let fixture: ComponentFixture<FsatTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
