import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as _ from 'lodash';
import * as moment from "moment";
import { SelectItem } from 'primeng/primeng';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';

import { UserManagemenetService } from '../user-managemenet.service';
import { MasterService } from '../../master/master.service';
import { MainService } from '../../lib/service/main.service';

import { SidebarComponent } from '../../layout/sidebar/sidebar.component';

@Component({
	selector: 'app-role-permission',
	templateUrl: './role-permission.component.html',
	styleUrls: ['./role-permission.component.scss'],
	providers: [SidebarComponent]
})
export class RolePermissionComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public listRole = [];
	public roles : SelectItem[];
	private listDropdownRole = [];
	public data = [];
	public cols: any[];
	public loading: boolean;
	private selectedValues: string[];
	private selectedData: String[];
	private selectAll: boolean = false;
	public display: boolean = false;
	
	// Notification
	// =========================== //
	public msgs: Message[] = [];
	public msgsError: Message[] = [];

	@ViewChild('filterSearch') filterSearch;

	constructor(
		private sidebarComponent: SidebarComponent,
		private masterService: MasterService,
		private mainService: MainService,
		private messageService: MessageService,
		private userManagemenetService: UserManagemenetService
	){}

	ngOnInit(){
		this.cols = [
			{
				field: 'MenuName', 
				header: 'Menu Name',
				filter: false, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: true,
				styleClass: 'label-content'
			},
			{
				field: 'IsRead', 
				header: 'Read',
				filter: false, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'IsCreate', 
				header: 'Create',
				filter: false, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{	
				field: 'IsUpdate', 
				header: 'Update',
				filter: false, 
				filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{	
				field: 'IsDelete', 
				header: 'Delete',
				filter: false, 
				filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{	
				field: 'IsCorporate', 
				header: 'Corporate',
				filter: false, 
				filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{	
				field: 'IsPersonal', 
				header: 'Personal',
				filter: false, 
				filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{	
				field: 'IsFunctionExport', 
				header: 'Export',
				filter: false, 
				filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{	
				field: 'IsFunctionBrowse', 
				header: 'Browse',
				filter: false, 
				filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{	
				field: 'IsFunctionUpload', 
				header: 'Upload',
				filter: false, 
				filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: false,
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
		this.fetchDataRole();
		this.fetchMenu();
	}

	// Toggle Checkbox Columns
	// ====================== //
	checkBox(e){
		if(e.checked){
            e.checked = false;
        } else {
            e.checked = true;
        }  
	}

	// Fetch Menu
	// ====================== //
	public menus = [];
	private filtermenus = [];
	fetchMenu(){
		this.masterService.getMenu().subscribe(res =>{
			this.menus = [];
			_.map(res.Data, (x)=>{
				let obj = {
					value: x.Id,
					label: x.MenuName
				};
				this.menus.push(obj);
			});
		}, err =>{
			if(err.status == 401){
				this.mainService.updateToken(() =>{
                    this.fetchMenu();
                });
            }
		})
	}

	// ============================================================================== //
	// Menu Role
	// ============================================================================== //

	// Role fields
	// ====================== //
	public Id: String;
	public RoleId: String;
	public MenuId: String;
	public IsRead: Boolean = false;
	public IsCreate: Boolean = false;
	public IsUpdate: Boolean = false;
	public IsDelete: Boolean = false;
	public IsCorporate: Boolean = false;
	public IsPersonal: Boolean = false;
	public IsFunctionExport: Boolean = false;
	public IsFunctionBrowse: Boolean = false;
	public IsFunctionUpload: Boolean = false;
	private selectedRole = null;

	// Fetch data menu role
	// ====================== //
	fetchData(id){
		this.loading = true;
		this.userManagemenetService.getMenuRole(id).subscribe(res =>{
			this.data = [];
			_.map(res.Data, (item)=>{
				Object.keys(item).forEach((key) => {
					if(item[key] == '1') {
						item[key] = true;
					}else if(item[key] == '0'){
						item[key] = false;
					}
				});
				this.data.push(item);
			});
			this.data = res.Data;
			this.loading = false;
		});
	}

	// Close Dialog
	// ====================== //
	closeDialog(){
		this.display = false;
		this.Id = null;
		setTimeout(()=>{
			var elem = document.getElementById("body").classList.remove("on");
		}, 500);
	}

	// Update Data Menu
	// ====================== //
	selectUpdate(e){
		this.titleSubmit = "Update";
		this.display = true;
		this.Id = e.Id;
		this.RoleId = e.RoleId;
		this.MenuId = e.MenuId;
		this.IsRead = e.IsRead == '1';
		this.IsCreate = e.IsCreate == '1';
		this.IsUpdate = e.IsUpdate == '1';
		this.IsDelete = e.IsDelete == '1';
		this.IsCorporate = e.IsCorporate == '1';
		this.IsPersonal = e.IsPersonal == '1';
		this.IsFunctionExport = e.IsFunctionExport == '1';
		this.IsFunctionBrowse = e.IsFunctionBrowse == '1';
		this.IsFunctionUpload = e.IsFunctionUpload == '1';
		var elem = document.getElementById("body").setAttribute( 'class', 'on' );
	}

	// Add Data Menu
	// ====================== //
	newMenuRole(){
		this.titleSubmit = "Add";
		this.display = true;
		var elem = document.getElementById("body").setAttribute( 'class', 'on' );
	}

	// Submit
	// ====================== //
	public submitButton = false;
	public titleSubmit = null;
	onSubmit(e){

		this.submitButton = true;
		delete e['Id'];
		e['IsRead'] = e['IsRead'] ? 1 : 0;
		e['IsCreate'] = e['IsCreate'] ? 1 : 0;
		e['IsUpdate'] = e['IsUpdate'] ? 1 : 0;
		e['IsDelete'] = e['IsDelete'] ? 1 : 0;
		e['IsCorporate'] = e['IsCorporate'] ? 1 : 0;
		e['IsPersonal'] = e['IsPersonal'] ? 1 : 0;
		e['IsFunctionExport'] = e['IsFunctionExport'] ? 1 : 0;
		e['IsFunctionBrowse'] = e['IsFunctionBrowse'] ? 1 : 0;
		e['IsFunctionUpload'] = e['IsFunctionUpload'] ? 1 : 0;

		if(this.Id == null){
			this.userManagemenetService.postMenuRole(e).subscribe(res =>{
				this.submitButton = false;
				this.closeDialog();
				this.fetchData(this.selectedListRole);
				setTimeout(()=>{
					this.msgs = [];
					this.msgs.push({severity:'success', summary: 'Success', detail: 'Success add menu to role'});
				}, 500);
			}, err =>{
				if(err.status == 401){
					this.mainService.updateToken(() =>{
						this.onSubmit(e);
					});
				}else{
					this.submitButton = false;
					this.msgsError = [];
					this.msgsError.push({severity:'error', summary: 'Failed', detail: 'Failed add menu'});
				}
				
				this.fetchData(this.selectedListRole);
			});
		}else{
			this.userManagemenetService.updateMenuRole(e,this.Id).subscribe(res =>{
				this.submitButton = false;
				this.closeDialog();
				this.fetchData(this.selectedListRole);
				setTimeout(()=>{
					this.msgs = [];
					this.msgs.push({severity:'success', summary: 'Success', detail: 'Menu role has been updated'});
				}, 500);
			}, err =>{
				if(err.status == 401){
					this.mainService.updateToken(() =>{
						this.onSubmit(e);
					});
				}else{
					this.submitButton = false;
					this.msgsError = [];
					this.msgsError.push({severity:'error', summary: err.statusText, detail: err.statusText});
				}
				
				this.fetchData(this.selectedListRole);
			});
		}
	}

	// ============================================================================== //
	// Menu Role
	// ============================================================================== //

	// Properties 
	// ====================== //
	public isNewRole: boolean = false;
	private RoleIdTemplate = null;
	private selectedListRole: null;

	// Fetch data role
	// ====================== //
	fetchDataRole(){
		this.userManagemenetService.getRole().subscribe(res =>{
			this.roles = [];
			this.listRole = res.Data;
			this.fetchData(res.Data[0].Id);
			this.selectedListRole = this.listRole[0].Id;
			this.selectedRole = this.listRole[0];
			_.map(res.Data, (x)=>{
				let obj = {label: x.RoleName, value: x.Id};
				this.roles.push(obj);
			});
		});
	}
	selectListRole(e){
		this.fetchData(e.value);
	}

	// View List
	// ====================== //
	viewList(e){
		this.fetchData(e.Id);
		this.selectedRole = e;
	}

	// Selected Template Role
	selectedTemplateRole(e){
		this.data = [];
		this.loading = true;
		this.fetchData(e.value);
	}
	
	// New Role Name
	newRole(){
		this.isNewRole = true;
		this.data = [];
		this.roles.unshift({label: "None", value: null});
	}
	cancelNewRole(){
		this.isNewRole = false;
		this.fetchData(this.listRole[0].Id);
		_.remove(this.roles, {value: null});
	}
	resetNewRole(){
		this.RoleIdTemplate = null;
		let emptyData = [];
		_.map(this.data, (item)=>{
			Object.keys(item).forEach((key) => {
				if(item[key] == '1' || item[key] == '0') {
					item[key] = false;
				}
			});
			emptyData.push(item);
		});
		this.data = emptyData;
	}

	// Hande Change New Role
	handleChange(e){}

	// Submit Role
	private submitButtonRole = false;
	onSubmitRole(e){
		const objData = this.data;
		_.map(objData, (item)=>{
			Object.keys(item).forEach((key) => {
				if(key != "MenuId"){
					if(item[key] == null) {
						item[key] = 0;
					}
				}
			});
		});
		
		let arrRole = [];
		_.map(objData, (x)=>{

			let objRole = {
				IsCorporate: x.IsCorporate ? 1 : 0,
				IsCreate: x.IsCreate ? 1 : 0,
				IsDelete: x.IsDelete ? 1 : 0,
				IsFunctionBrowse: x.IsFunctionBrowse ? 1 : 0,
				IsFunctionExport: x.IsFunctionExport ? 1 : 0,
				IsFunctionUpload: x.IsFunctionUpload ? 1 : 0,
				IsPersonal: x.IsPersonal ? 1 : 0,
				IsRead: x.IsRead ? 1 : 0,
				IsUpdate: x.IsUpdate ? 1 : 0,
				MenuId: x.MenuId
			};
			arrRole.push(objRole);
		});
		let obj = {
			RoleName: e.RoleName,
			menu_role: arrRole
		}
		this.submitButtonRole = true;

		this.userManagemenetService.postRole(obj).subscribe(res =>{
			this.submitButtonRole = false;
			this.isNewRole = false;
			this.resetNewRole();
			this.fetchDataRole();
			this.fetchData(this.selectedListRole);
			setTimeout(()=>{
				this.msgs = [];
				this.msgs.push({severity:'success', summary: 'Success', detail: 'Role has been add'});
			}, 500);
		}, err =>{
			if(err.status == 401){
				this.mainService.updateToken(() =>{
					this.onSubmitRole(e);
				});
			}

			this.submitButtonRole = false;
			this.msgs = [];
			this.msgs.push({severity:'error', summary: 'Failed', detail: 'Failed add role'});
		});
	}

	// Delete Role
	// =========================== //
	public displayConfirm: boolean = false;
	public titleRemove = null;
	selectRemove(e){
		this.displayConfirm = true;
		this.Id = e.Id;
		this.titleRemove = "Remove " + e.MenuName;
	}
	closeDialogConfirm(){
		this.displayConfirm = false;
		this.Id = null;
	}
	public submitButtonRemove: boolean = false;
	removeData(){
		this.submitButtonRemove = true;
		this.userManagemenetService.deleteMenuRole(this.Id).subscribe(res =>{
			this.submitButtonRemove = false;
			this.closeDialogConfirm();
			this.fetchData(this.selectedListRole);
			this.msgs = [];
			this.msgs.push({severity:'success', summary: 'Success', detail: 'Success delete menu role'});
		}, err =>{
			this.submitButtonRemove = false;
			this.msgsError = [];
			this.msgsError.push({severity:'error', summary: 'Failed', detail: 'Failed delete menu role'});
		});
	}
}
