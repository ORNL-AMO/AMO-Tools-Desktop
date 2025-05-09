import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribeModalComponent } from './subscribe-modal.component';

describe('SubscribeModalComponent', () => {
  let component: SubscribeModalComponent;
  let fixture: ComponentFixture<SubscribeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscribeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscribeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
