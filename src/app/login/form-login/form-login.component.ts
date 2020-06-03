import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LoginService } from '../login.service';
import { MainService } from '../../lib/service/main.service';
import { store } from '../../lib/service/reducer.service';

@Component({
  selector: 'app-form-login',
  templateUrl: './form-login.component.html',
  styleUrls: ['./form-login.component.scss']
})
export class FormLoginComponent implements OnInit {
	// Propertis
	public email: String;
	public password: String;
	public submitButton: boolean = false;
	public userError: boolean = false;
	public keepSigin: boolean = false;
	private dataLogin = null;
	private onPayment = null;
	private amount = null;
	private invoiceId = null;
	public showPassword: boolean = false;

    constructor(
		private router: Router,
		private activeRoute: ActivatedRoute,
		private loginService: LoginService,
		private mainService: MainService
	){}

    ngOnInit() {
		this.activeRoute.queryParams.subscribe((params: Params) => {
			this.onPayment = Number(params['onpayment']);
			this.amount = Number(params['amount']);
			this.invoiceId = params['invoiceId'];
		});
	}
	
	onSubmit(e){
		this.userError = false;
		this.submitButton = true;
		delete e['checklogin'];
		this.loginService.postLogin(e).subscribe(res => {
			localStorage.setItem("token",res.token);
			localStorage.setItem("dataUser",JSON.stringify(res.Data[0]));
			
			if(this.keepSigin){
				localStorage.setItem("dataLogin",JSON.stringify(e));
			}else{
				localStorage.removeItem("dataLogin");
			}

			this.mainService.updateLocalStorage();
			this.submitButton = false;

			if(this.onPayment == 1){
				this.router.navigate(['/payment'],{ queryParams: { amount: this.amount, invoiceId: this.invoiceId } });   
			}else{
				this.router.navigate(['/p']);   
			}

			store.dispatch({ type: 'SET_LOGIN' });
		}, err =>{
			this.submitButton = false;
			this.userError = true;
		});
	}

}
