import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribeToastComponent } from './subscribe-toast.component';

describe('SubscribeToastComponent', () => {
  let component: SubscribeToastComponent;
  let fixture: ComponentFixture<SubscribeToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscribeToastComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscribeToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
