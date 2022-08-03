import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurndownComponent } from './turndown.component';

describe('TurndownComponent', () => {
  let component: TurndownComponent;
  let fixture: ComponentFixture<TurndownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TurndownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TurndownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
