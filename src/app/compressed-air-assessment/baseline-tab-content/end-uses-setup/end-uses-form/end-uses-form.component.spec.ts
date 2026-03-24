import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndUsesFormComponent } from './end-uses-form.component';

describe('EndUsesFormComponent', () => {
  let component: EndUsesFormComponent;
  let fixture: ComponentFixture<EndUsesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EndUsesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndUsesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
