import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { MainService } from '../../lib/service/main.service';
import { Message } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';

@Component({
	selector: 'app-new-password',
	templateUrl: './new-password.component.html',
	styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit {
	// Propertis
	private email: String;
	public password: String;
	public submitButton: boolean = false;
	private notsubmit: boolean = true;
	private code: string;
	public msgs: Message[] = [];
	public repassword: String;

	constructor(
		private messageService: MessageService,
		private loginService: LoginService,
		private activeRoute: ActivatedRoute,
		private router: Router,
		private mainService: MainService
	){
		this.messageService.add({severity:'success', summary:'Service Message', detail:'Via MessageService'});		
	}

	ngOnInit() {
		// subscribe to router event
		this.activeRoute.queryParams.subscribe((params: Params) => {
			this.code = params['code'];
			if(this.code == undefined){
				this.router.navigate(['/user/forgot-pass']);   
			}
		});		
	}

	onSubmit(e){
		this.submitButton = true;
		e['code'] = this.code;
		delete e['repassword'];
		this.messageService.clear();

		this.loginService.postNewPass(e).subscribe(res =>{
			localStorage.setItem("token",res.token);
			localStorage.setItem("dataUser",JSON.stringify(res.Data[0]));
			this.mainService.updateLocalStorage();
			this.submitButton = false;
			this.router.navigate(['/p']);   

			this.submitButton = false;
			this.messageService.add({severity:'success', summary:'Service Message', detail:'Via MessageService'});
		}, err =>{
			this.submitButton = false;
		});
	}
}
