import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateApplicationToastComponent } from './update-application-toast.component';

describe('UpdateApplicationToastComponent', () => {
  let component: UpdateApplicationToastComponent;
  let fixture: ComponentFixture<UpdateApplicationToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateApplicationToastComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateApplicationToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
