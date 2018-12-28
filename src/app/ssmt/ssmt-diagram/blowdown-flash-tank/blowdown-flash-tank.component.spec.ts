import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlowdownFlashTankComponent } from './blowdown-flash-tank.component';

describe('BlowdownFlashTankComponent', () => {
  let component: BlowdownFlashTankComponent;
  let fixture: ComponentFixture<BlowdownFlashTankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlowdownFlashTankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlowdownFlashTankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
