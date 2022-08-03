import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MidTurndownComponent } from './mid-turndown.component';

describe('MidTurndownComponent', () => {
  let component: MidTurndownComponent;
  let fixture: ComponentFixture<MidTurndownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MidTurndownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MidTurndownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
