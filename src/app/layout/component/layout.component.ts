import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { MenuItem } from 'primeng/primeng';

// import * as isOnline from 'is-online';
import * as _ from 'lodash';

// Service
import { MainService } from '../../lib/service/main.service';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';

@Component({
	selector: 'app-layout',
	templateUrl: './layout.component.html',
	styleUrls: ['./layout.component.scss'],
	providers: [MessageService]
})
export class LayoutComponent implements OnInit {
	public onLayout: boolean = false;
	public toggle: boolean = false;
	public togglemobile: boolean = false;
	private loged: boolean = false;
	public arrNavigate: MenuItem[];
	public stateLayout: String;
	public loadingPage: boolean = false;
	public isOnline: boolean = true;
	public onlineOffline: boolean = navigator.onLine;

	public msgs: Message[] = [];

	ngOnInit() {
		if (this.mainService['token'] == null) {
			this.router.navigate(['/user/login']);
		}
		this.loged = this.mainService['token'] != null;
		this.mainService.updateLocalStorage();

		setInterval(() => {
			if (navigator.onLine) {
				if (!this.isOnline) {
					this.isOnline = true;
					this.msgs = [];
					this.msgs.push({
						severity: 'success',
						summary: 'Connected',
						detail: 'Internet connected'
					});
				}
			} else {
				if (this.isOnline) {
					this.isOnline = false;
					this.msgs = [];
					this.msgs.push({
						severity: 'warn',
						summary: 'Warning',
						detail: 'No internet connection...'
					});
				}
			}
		}, 100);
	}

	// Loading Menu
	public loadingMenu: boolean = true;
	onLoadMenu() {
		this.loadingMenu = false;
	}

	constructor(private router: Router, private mainService: MainService) {
		// Navigate End
		this.router.events.subscribe(evt => {
			window.scrollTo(0, 0);
			if (evt instanceof NavigationStart) {
				this.loadingPage = true;
			}

			if (evt instanceof NavigationEnd) {
				this.onLayout = false;
				this.toggle = false;
				this.togglemobile = false;
				this.mainService.updateLayout(this.toggle);

				setTimeout(() => {
					this.loadingPage = false;
				}, 500);
			}
			this.initBreadcumb(evt);
		});
	}

	@HostListener('window:resize', ['$event']) onResize(event) {
		this.onLayout = false;
		this.toggle = false;
		this.mainService.updateLayout(this.toggle);
	}

	// Toggle Hover Sidebar
	onSidebar(e) {
		if (!this.mainService['activeLayout']) {
			this.onLayout = e;
		}
	}

	// Hold Sidebar
	toggleOn() {
		this.toggle = !this.toggle;
		this.mainService.updateLayout(this.toggle);
	}

	// Toggle Mobile
	toggleMobile(e) {
		this.togglemobile = e;
	}

	// Init Breadcumb
	initBreadcumb(event) {
		if (event instanceof NavigationEnd) {
			this.arrNavigate = [];
			this.removeURLParameter(event.urlAfterRedirects, 'BusinessUnitId');
			let url = event.urlAfterRedirects.split('?')[0].split('/');
			for (let i = 0; i < url.length; i++) {
				if (url[i] == '') {
					url.splice(i, 1);
				}

				// Remove Undefined
				if (url[i - 1] == undefined) {
					url[i - 1] = '';
				} else {
					url[i - 1] = '/' + url[i - 1];
				}

				let link;
				if (i >= 2) {
					link = '/p' + url[i - 1] + '/' + url[i];
				} else {
					link = url[i - 1] + '/' + url[i];
				}

				this.arrNavigate.push({
					label: url[i].replace(/-/g, ' '),
					routerLink: link
				});
			}
			_.remove(this.arrNavigate, { label: 'p' });
			this.stateLayout = _.last(this.arrNavigate).label;
		}
	}

	removeURLParameter(url, parameter) {
		//prefer to use l.search if you have a location/link object
		var urlparts = url.split('?');
		if (urlparts.length >= 2) {
			var prefix = encodeURIComponent(parameter) + '=';
			var pars = urlparts[1].split(/[&;]/g);

			//reverse iteration as may be destructive
			for (var i = pars.length; i-- > 0; ) {
				//idiom for string.startsWith
				if (pars[i].lastIndexOf(prefix, 0) !== -1) {
					pars.splice(i, 1);
				}
			}

			url = urlparts[0] + '?' + pars.join('&');
			return url;
		} else {
			return url;
		}
	}
}
