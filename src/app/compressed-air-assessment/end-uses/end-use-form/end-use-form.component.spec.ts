import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndUseFormComponent } from './end-use-form.component';

describe('EndUseFormComponent', () => {
  let component: EndUseFormComponent;
  let fixture: ComponentFixture<EndUseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndUseFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndUseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
