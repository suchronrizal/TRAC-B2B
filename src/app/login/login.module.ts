import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { MainLoginComponent } from './main-login/main-login.component';
import { RouterModule } from '@angular/router';

import { CustomFormsModule } from 'ng2-validation';


// Component
import { ForgotPassComponent } from './forgot-pass/forgot-pass.component';
import { FormLoginComponent } from './form-login/form-login.component';
import { NewPasswordComponent } from './new-password/new-password.component';


// PrimeNG
import {
    CheckboxModule,
    ProgressSpinnerModule,
    PasswordModule,
    GrowlModule,
    ProgressBarModule
} from 'primeng/primeng';

import { MessageService } from 'primeng/components/common/messageservice';
import { LoginService } from './login.service';
import { ConfirmationComponent } from './confirmation/confirmation.component';

@NgModule({
    imports: [
        CommonModule,
        CheckboxModule,
        RouterModule,
        FormsModule,

        // PrimeNG
        CustomFormsModule,
        ProgressSpinnerModule,
        PasswordModule,
        GrowlModule,
        ProgressBarModule
    ],
    exports: [
        MainLoginComponent
    ],
    providers : [MessageService, LoginService],
    declarations: [
        MainLoginComponent, 
        ForgotPassComponent, 
        FormLoginComponent, 
        NewPasswordComponent, 
        ConfirmationComponent
    ]
})
export class LoginModule { }
