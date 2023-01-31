import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMessageOverlayComponent } from './user-message-overlay.component';

describe('UserMessageOverlayComponent', () => {
  let component: UserMessageOverlayComponent;
  let fixture: ComponentFixture<UserMessageOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserMessageOverlayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMessageOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
