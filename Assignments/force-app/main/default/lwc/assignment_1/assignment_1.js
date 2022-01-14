import { LightningElement , wire , track ,api } from 'lwc';
import { deleteRecord } from 'lightning/uiRecordApi';
import {refreshApex} from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import fatchAccounts from '@salesforce/apex/AccountRecord.fatchAccounts';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import WEBSITE_FIELD from '@salesforce/schema/Account.Website';
import updateAccounts from '@salesforce/apex/AccountRecord.updateAccounts';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';


//some operation for row action...
const actions = [
    { label: 'Delete', name: 'delete' },
];

//all columns name what you want to display in the lightning data table...
const columns = [
    { label: 'Name', fieldName: 'Name' , editable: true },
    { label: 'Website', fieldName: 'Website', type: 'url' , editable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true  },
    { label: 'Employees', fieldName: 'NumberOfEmployees', type: 'Number', editable: true},
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];

export default class Assignment_1 extends LightningElement {

    //pagination variables...
    @track visibleAccounts;
    @track rowOffset = 0;

    //search variables...
    @api searchKey = "";

    //create a account...
    accountObject = ACCOUNT_OBJECT;
    myFields = [NAME_FIELD, WEBSITE_FIELD];
    columns = columns;

    @track draftValues = [];

    /*
        Accourding to searchKey, fatch account list 
        from the apex class using wire decorator...
    */
    _wiredResult;
   @track accountList;
   @wire (fatchAccounts,{searchKey: '$searchKey'}) 
    wiredCallback(result) {
        this._wiredResult = result;
        if (result.data) {
            this.accountList = result.data;
            console.log(result.data); 
        } else if (result.error) {
            this.accountList = undefined;
            console.log(result.error);
        }
    }

    // Handle row action event 
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            // if row action is delete then deleate a account record & row...
            case 'delete':
                const { Id } = row
                deleteRecord(Id)
                .then(() => {
                    // console.log('Account record delete successfully...')
                    this.showToast("Deleted", "Accounts Deleted successfully", "success");
                    return refreshApex(this._wiredResult);
                })
                .catch(error=>{console.log('Unable to delete record due to '+ error.body.message)});
            default:
        }
    }

    // Display the account record creation layout after clicking on New button... 
    @track shownewlayout = false;
    handleClick(event){
        this.shownewlayout = true;
    }

    // refresh the components, After creating the Account record successfully....
    handleAccountCreated(event){
        this.shownewlayout = false;
        //console.log(event);
        this.showToast("Success", "Accounts Created successfully", "success");
        return refreshApex(this._wiredResult);
    }

    //Update data of the lightning data table ...
    updateAccountHandler(event){
        this.visibleAccounts = [...event.detail.records];
        this.rowOffset = event.detail.offset;
        //console.log(this.visibleAccounts);
    }

    // searchkey value update whenever you will be searching...
    handleKeyChange(event){
        this.searchKey = event.target.value;
    }

    // In order to refresh your data, execute this function:
    refreshData() {
        return refreshApex(this._wiredResult);
    }
    
    //view some message for user...
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant
        });
        this.dispatchEvent(evt);
    }

    // update account record...
    handleSave(event) {
        const recordInputs =  event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
    
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(accounts => {
            this.showToast('Success','Account updated', 'success');
             // Clear all draft values
             this.draftValues = [];
             // Display fresh data in the datatable
             return refreshApex(this._wiredResult);
        }).catch(error => {
            // Handle error
        });
    }
}

