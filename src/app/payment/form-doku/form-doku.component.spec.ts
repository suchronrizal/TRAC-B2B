import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDokuComponent } from './form-doku.component';

describe('FormDokuComponent', () => {
  let component: FormDokuComponent;
  let fixture: ComponentFixture<FormDokuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormDokuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDokuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
