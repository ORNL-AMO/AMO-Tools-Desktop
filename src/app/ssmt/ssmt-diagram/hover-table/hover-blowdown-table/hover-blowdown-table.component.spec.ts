import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverBlowdownTableComponent } from './hover-blowdown-table.component';

describe('HoverBlowdownTableComponent', () => {
  let component: HoverBlowdownTableComponent;
  let fixture: ComponentFixture<HoverBlowdownTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverBlowdownTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverBlowdownTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
