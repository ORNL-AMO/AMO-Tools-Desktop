import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LightingListComponent } from './lighting-list.component';

describe('LightingListComponent', () => {
  let component: LightingListComponent;
  let fixture: ComponentFixture<LightingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LightingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LightingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
