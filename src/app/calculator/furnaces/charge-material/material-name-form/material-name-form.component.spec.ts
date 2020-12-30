import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialNameFormComponent } from './material-name-form.component';

describe('MaterialNameFormComponent', () => {
  let component: MaterialNameFormComponent;
  let fixture: ComponentFixture<MaterialNameFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaterialNameFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialNameFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
