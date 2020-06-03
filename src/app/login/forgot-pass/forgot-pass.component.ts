import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-forgot-pass',
  templateUrl: './forgot-pass.component.html',
  styleUrls: ['./forgot-pass.component.scss']
})
export class ForgotPassComponent implements OnInit {
    // Propertis
    private password: String;
    private submitButton: boolean = false;
    public notsubmit: boolean = true;
    private emailNotFound: boolean = false;
    
    constructor(
        private loginService: LoginService,
    ) { }

    ngOnInit() {
    }

    onSubmit(e){
        this.emailNotFound = false;
        this.submitButton = true;
        this.loginService.postForgotPass(e).subscribe(res => {
            this.submitButton = false;
            this.notsubmit = false;
        }, err =>{
            this.submitButton = false;
            this.emailNotFound = true;
        });
    }

}
