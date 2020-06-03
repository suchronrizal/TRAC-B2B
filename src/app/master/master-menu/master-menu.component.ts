import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { MainService } from '../../lib/service/main.service';
import { MasterService } from '../master.service';
import { Message } from 'primeng/components/common/api';

@Component({
  selector: 'app-master-menu',
  templateUrl: './master-menu.component.html',
  styleUrls: ['./master-menu.component.scss']
})
export class MasterMenuComponent implements OnInit {

	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public data = [];
	public cols: any[];
	public loading: boolean;
	private selectedValues: string[];
	private paginateTable: boolean = true;

	// Notification
	// =========================== //
	public msgs: Message[] = [];

	@ViewChild('filterSearch') filterSearch;

	constructor(
		private mainService: MainService,
		private masterService: MasterService,
	) { }

	ngOnInit(){
		this.cols = [
			{
				field: 'Id', 
				header: 'Id',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'MenuName', 
				header: 'Menu Name',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'MenuLink', 
				header: 'Menu Link',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			}
		];

		
		let filterChecked = [];
		_.map(this.cols, (x)=>{
			if(x.checked){
				filterChecked.push(x.field);
			}
		});
		this.selectedValues = filterChecked;

		this.fetchMenu();
	}

	// Toggle Checkbox Columns
	// =========================== //
	checkBox(e){
		if(e.checked){
            e.checked = false;
        } else {
            e.checked = true;
        }  
	}

	// ============================================================================== //
	// Fetch Menu
	// ============================================================================== //
	public MenuParents = [];
	fetchMenu(){
		this.loading = true;	
		let dataUser = JSON.parse(this.mainService['dataUser']);
		if(dataUser != null){
			this.masterService.getMenu().subscribe(res =>{
				this.MenuParents = [];
				this.data = res.Data;
				_.map(this.data, (x)=>{
					if(x.MenuStatus == '1'){
						x.MenuStatus = true;
					}else{
						x.MenuStatus = false;
					}
	
					if(x.MenuParent == null){
						let obj = {label: x.MenuName, value: x.Id};
						this.MenuParents.push(obj);
					}
				});
				
				this.MenuParents = _.orderBy(this.MenuParents, ['label'], ['asc']);
				this.loading = false;
			}, err =>{
				if(err.status == 401){
					this.mainService.updateToken(() =>{
						this.fetchMenu();
					});
				}
	
				if(err.name == "TimeoutError"){
					this.fetchMenu();
				}
			});
		}
	}

	handleChange(e,obj){}

	// Export All Data
	// =========================== //
	downloadCSV(){
		this.mainService.exportDataCsv(this.data,'Report Master Menu');
	}
	downloadXLS(){
		this.mainService.exportDataXls(this.data,'Report Master Menu');
	}

	// Submit Menu
	// =========================== //
	public displayMenu: boolean = false;
	public MenuName = null;
	public MenuLink = null;
	public selectedMenuParent = null;
	public MenuStatus: boolean;
	public selectedMenu = null;
	public onSubmitBtn: boolean = false;
	onSubmit(e){
		e['MenuStatus'] = e['MenuStatus'] ? 1 : 0;
		e['MenuLink'] = _.kebabCase(e['MenuLink']);
		this.onSubmitBtn = true;

		if(this.selectedMenu == null){
			this.masterService.postMenu(e).subscribe(res =>{
				this.fetchMenu();
				this.closeDisplayMenu();
				this.onSubmitBtn = false;
				this.msgs = [];
				this.msgs.push({severity:'success', summary: 'Success', detail: 'Save menu'});
			}, err =>{
				this.onSubmitBtn = false;
				this.msgs = [];
				this.msgs.push({severity:'error', summary: 'Failed', detail: 'Save menu'});
			});
		}else{
			this.masterService.putMenu(e,this.selectedMenu.Id).subscribe(res =>{
				this.fetchMenu();
				this.closeDisplayMenu();
				this.onSubmitBtn = false;
				this.msgs = [];
				this.msgs.push({severity:'success', summary: 'Success', detail: 'Update menu'});
			}, err =>{
				this.onSubmitBtn = false;
				this.msgs = [];
				this.msgs.push({severity:'error', summary: 'Failed', detail: 'Update menu'});
			});
		}
	}
	showDialog(){
		this.displayMenu = true;
		var elem = document.getElementById("body").setAttribute( 'class', 'on' );
	}
	selectUpdate(e){
		this.displayMenu = true;
		this.selectedMenu = e;
		this.MenuName = e.MenuName;
		this.MenuLink = e.MenuLink;
		this.selectedMenuParent = e.MenuParent;
		this.MenuStatus = e.MenuStatus ==  1 ? true : false;
		var elem = document.getElementById("body").setAttribute( 'class', 'on' );
	}
	closeDisplayMenu(){
		this.selectedMenu = null;
		this.displayMenu = false;
		setTimeout(()=>{
			var elem = document.getElementById("body").classList.remove("on");
		}, 500);
	}

	// Delete Menu
	// =========================== //
	public titleRemove = null;
	public displayConfirm: boolean = false;	
	public submitButtonRemove: boolean = false;
	removeData(){
		this.submitButtonRemove = true;
		this.masterService.deleteAccount(this.selectedMenu.Id).subscribe(res =>{
			this.fetchMenu();
			this.closeDialogConfirm();
			this.submitButtonRemove = false;
			this.msgs = [];
			this.msgs.push({severity:'success', summary: 'Success', detail: 'Delete menu'});
		}, err =>{
			this.submitButtonRemove = false;
			this.msgs = [];
			this.msgs.push({severity:'error', summary: 'Failed', detail: 'Delete menu'});
		});
	}
	selectRemove(e){
		this.selectedMenu = e;
		this.displayConfirm = true;
		this.titleRemove = 'Remove ' + e.MenuName;
	}
	closeDialogConfirm(){
		this.selectedMenu = null;
		this.displayConfirm = false;
	}
}
