import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';
const swal: SweetAlert = _swal as any;
import 'rxjs/add/operator/map';
import * as _ from 'lodash';

import { utils, write, WorkBook } from 'xlsx';
import { saveAs } from 'file-saver';
// import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { store } from '../service/reducer.service';

@Injectable()
export class MainService {
	// ============================================================================== //
	// Host API
	// ============================================================================== //
	//private baseUrl = 'http://omni-production.azurewebsites.net/apps';
	// private baseUrl = "http://reservation.trac.astra.co.id/apps";
	private baseUrl = 'http://omni-dev.azurewebsites.net';
	//private baseUrl = 'https://omni-staging.azurewebsites.net/apps';

	private host: String = 'http://omni-service-authorization.azurewebsites.net/api';
	private hostOrg: String = 'http://omni-service-organization.azurewebsites.net/api';
	private hostCon: String = 'http://omni-service-configuration.azurewebsites.net/api';
	private hostCostumer: String = 'http://omni-service-customer.azurewebsites.net/api';
	private hostBilling: string = 'http://omni-service-billing.azurewebsites.net/api';
	private hostPrice: string = 'http://omni-service-price.azurewebsites.net/api';
	private hostNotif: string = 'http://omni-service-notification.azurewebsites.net/api';
	private urlRefreshToken = this.host + '/authorization/refresh-token';
	private urlCheckToken = this.host + '/authorization/check-token/';
	private hostOrder: string = 'http://omni-service-order.azurewebsites.net/api';
	private hostProduct: string = 'http://omni-service-product.azurewebsites.net/api';

	// private host: String =
	//   'http://omni-service-authorization-staging.azurewebsites.net/api';
	// private hostOrg: String =
	//   'http://omni-service-organization-staging.azurewebsites.net/api';
	// private hostCon: String =
	//   'http://omni-service-configuration-staging.azurewebsites.net/api';
	// private hostCostumer: String =
	//   'http://omni-service-customer-staging.azurewebsites.net/api';
	// private hostBilling: string =
	//   'http://omni-service-billing-staging.azurewebsites.net/api';
	// private hostPrice: string =
	//   'http://omni-service-price-staging.azurewebsites.net/api';
	// private hostNotif: string =
	//   'http://omni-service-notification-staging.azurewebsites.net/api';
	// private urlRefreshToken = this.host + '/authorization/refresh-token';
	// private urlCheckToken = this.host + '/authorization/check-token/';
	// private hostOrder: string =
	//   'http://omni-service-order-staging.azurewebsites.net/api';
	// private hostProduct: string =
	//   'http://omni-service-product-staging.azurewebsites.net/api';

	// private host: String = 'https://omni-service-authorization-production.azurewebsites.net/api';
	// private hostOrg: String = 'https://omni-service-organization-production.azurewebsites.net/api';
	// private hostCon: String = 'https://omni-service-configuration-production.azurewebsites.net/api';
	// private hostCostumer: String = 'https://omni-service-customer-production.azurewebsites.net/api';
	// private hostBilling: string = 'http://omni-service-billing-production.azurewebsites.net/api';
	// private hostPrice: string = 'https://omni-service-price-production.azurewebsites.net/api';
	// private hostNotif: string = 'https://omni-service-notification-production.azurewebsites.net/api';
	// private urlRefreshToken = this.host + '/authorization/refresh-token';
	// private urlCheckToken = this.host + '/authorization/check-token/';
	// private hostOrder: string = 'https://omni-service-order-production.azurewebsites.net/api';
	// private hostProduct: string = 'https://omni-service-product-production.azurewebsites.net/api';

	// ============================================================================== //
	// Global Setting
	// ============================================================================== //
	private timeOut = 8000;
	private activeMenu = [];

	constructor(private router: Router, private http: Http) {
		this.updateLocalStorage();
		let story = this.token + this.dataUser + this.order + this.CostCenterId + this.CostCenterName;
		// console.log("Space : " + this.formatFileSize(story,3));

		store.subscribe(() => {
			let sidebarReduce = store.getState().sidebar;
			this.activeMenu = sidebarReduce.menus;
		});
	}
	formatFileSize(text, decimalPoint) {
		var bytes = encodeURIComponent(text).split(/%..|./).length - 1;
		if (bytes == 0) return '0 Bytes';
		var k = 1000,
			dm = decimalPoint || 2,
			sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
			i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

	// ============================================================================== //
	// Layout
	// ============================================================================== //
	private activeLayout: boolean = false;
	updateLayout(val: boolean) {
		this.activeLayout = val;
	}

	// ============================================================================== //
	// Refresh Token
	// ============================================================================== //
	refreshToken() {
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.token
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlRefreshToken, options).map((res: Response) => res.json());
	}
	updateToken(run) {
		if (this.dataLogin != null) {
			this.refreshToken().subscribe(
				res => {
					localStorage.setItem('token', res['Data'].token);
					this.updateLocalStorage();
					store.dispatch({ type: 'SET_LOGIN' });
					run();
				},
				err => {
					this.updateToken(run);
					// this.removeAllLocalStorage();
					// this.updateLocalStorage();
					// setTimeout(()=>{
					//     location.reload();
					// }, 500);
				}
			);
		} else {
			store.dispatch({ type: 'SET_LOGOUT' });
			this.removeAllLocalStorage();
			this.updateLocalStorage();
			setTimeout(() => {
				location.reload();
			}, 500);
		}
	}
	checkToken() {
		this.updateLocalStorage();
		let headers = new Headers({
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + this.token
		});
		let options = new RequestOptions({ headers: headers });
		return this.http.get(this.urlCheckToken, options).map((res: Response) => res.json());
	}

	// ============================================================================== //
	// Local Storage
	// ============================================================================== //
	private token: String = null;
	private dataUser: any = null;
	private dataLogin: any = null;
	private order: any = null;
	private CostCenterId: String = null;
	private CostCenterName: String = null;
	removeAllLocalStorage() {
		localStorage.removeItem('token');
		localStorage.removeItem('dataUser');
		localStorage.removeItem('CostCenterId');
		localStorage.removeItem('CostCenterName');
	}
	updateLocalStorage() {
		this.token = localStorage.getItem('token');
		this.dataUser = localStorage.getItem('dataUser');
		this.dataLogin = localStorage.getItem('dataLogin');
		this.order = localStorage.getItem('order');
		this.CostCenterId = localStorage.getItem('CostCenterId');
		this.CostCenterName = localStorage.getItem('CostCenterName');
	}

	// Export Data
	// =========================== //
	exportDataCsv(data, title) {
		if (data != undefined && data[0] != undefined) {
			var options = {
				headers: Object.keys(data[0]),
				fieldSeparator: ',',
				quoteStrings: '"',
				decimalseparator: '.',
				showLabels: true,
				showTitle: true,
				useBom: true
			};
			// new Angular2Csv(data, title, options);
			new Angular5Csv(data, title, options);
		} else {
			swal({ title: 'Data is empty', icon: 'error' });
		}
	}
	exportDataXls(data, title) {
		function s2ab(s) {
			const buf = new ArrayBuffer(s.length);
			const view = new Uint8Array(buf);
			_.map(s, (x, i) => {
				view[i] = s.charCodeAt(i) & 0xff;
			});
			return buf;
		}

		if (data.length === 0 || data === undefined) {
			swal({ title: 'Data is empty', icon: 'error' });
		} else {
			const ws_name = title;
			const wb: WorkBook = { SheetNames: [], Sheets: {} };
			const ws: any = utils.json_to_sheet(data);
			wb.SheetNames.push(ws_name);
			wb.Sheets[ws_name] = ws;
			const wbout = write(wb, {
				bookType: 'xlsx',
				bookSST: true,
				type: 'binary'
			});

			saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), title + '.xlsx');
		}
	}

	// ============================================================================== //
	// List Company
	// ============================================================================== //
	private seraGroups = [
		{ label: 'PT Serasi Autoraya', value: '0100' },
		{ label: 'PT United Automobil90', value: '0200' }
	];
	private businessUnits = [
		{ label: 'TRAC Rental', value: '0104' },
		{ label: 'TRAC TMS', value: '0102' },
		{ label: 'UAS Bus', value: '0201' }
	];
}
