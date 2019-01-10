import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashTankTableComponent } from './flash-tank-table.component';

describe('FlashTankTableComponent', () => {
  let component: FlashTankTableComponent;
  let fixture: ComponentFixture<FlashTankTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlashTankTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashTankTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
