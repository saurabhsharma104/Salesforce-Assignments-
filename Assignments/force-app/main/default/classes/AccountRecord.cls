public with sharing class AccountRecord {
    
    public AccountRecord(){

    }

// Apex update result: The following exception has occurred: Update failed. 
// First exception on row 0 with id row-4; first error: MALFORMED_ID, Account
//  ID: id value of incorrect type: row-4: [Id]"
    @AuraEnabled
    public static string updateAccounts(Object data) {
        List<Account> accountsForUpdate = (List<Account>) JSON.deserialize(
            JSON.serialize(data),
            List<Account>.class
        );
        return accountsForUpdate[0].Id;
        // try {
        //     update accountsForUpdate;
        //     return 'Success: contacts updated successfully';
        // }
        // catch (Exception e) {
        //     return 'The following exception has occurred: ' + e.getMessage();
        // }
    }

    // Apex method for fatching account record from the salesforce account...
    @AuraEnabled(cacheable=true)
    public static List<Account> fatchAccounts(string searchKey){
        try {
            String query = 'SELECT Id,Name,Phone,Website,NumberOfEmployees FROM Account';
            // if search input is doesn't empty i.e you are searching something
            if ( searchKey != null && searchKey != '' ) {
                String key = '%' + searchKey + '%';
                query += ' WHERE Name LIKE :key';
            }
            // execute database query...
            return Database.query( query );
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
