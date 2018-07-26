import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashTankComponent } from './flash-tank.component';

describe('FlashTankComponent', () => {
  let component: FlashTankComponent;
  let fixture: ComponentFixture<FlashTankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlashTankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashTankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
