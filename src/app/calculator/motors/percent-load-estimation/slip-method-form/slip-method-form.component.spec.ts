import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlipMethodFormComponent } from './slip-method-form.component';

describe('SlipMethodFormComponent', () => {
  let component: SlipMethodFormComponent;
  let fixture: ComponentFixture<SlipMethodFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlipMethodFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlipMethodFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
