import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireAuth } from '@angular/fire/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';
import { AngularFireAuthMock } from '../testutils/firebaseMocks';
import { AuthPageRoutingModule } from './auth-routing.module';
import { AuthPage } from './auth.page';


describe('AuthPage', () => {
  let component: AuthPage;
  let fixture: ComponentFixture<AuthPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthPage ],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        AuthPageRoutingModule,
        IonicModule,
        RouterTestingModule],
      providers: [
        { provide: AngularFireAuth, useValue: AngularFireAuthMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reject invalid logins', () => {

  });
});
