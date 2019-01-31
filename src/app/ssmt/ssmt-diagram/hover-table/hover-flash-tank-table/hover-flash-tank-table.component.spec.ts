import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverFlashTankTableComponent } from './hover-flash-tank-table.component';

describe('HoverFlashTankTableComponent', () => {
  let component: HoverFlashTankTableComponent;
  let fixture: ComponentFixture<HoverFlashTankTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoverFlashTankTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverFlashTankTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
