Clockify API Documentation                           ![Clockify logo](https://clockify.me/downloads/clockify_logo_primary_black_margin.png)
- Introduction
- Authentication
- Webhooks
- Rate limiting
- API URLs
- Regional Server Prefixes
- Breaking changes
- Experimental APIs
- Clockify API
  - User
    - postAdd photo
    - getGet currently logged-in user's info
    - getGet member's profile
    - patchUpdate member's profile
    - getFind all users on workspace
    - post Filter workspace users
    - putUpdate user's custom field
    - getFind user's team manager
    - delRemove user's manager role
    - postGive user manager role
  - Workspace
    - getGet all my workspaces
    - postAdd workspace
    - getGet workspace info
    - putUpdate workspace cost rate
    - putUpdate workspace billable rate
    - postAdd user
    - putUpdate user's status
    - putUpdate user's cost rate
    - putUpdate user's hourly rate
  - Webhooks
    - getGet all webhooks for addon on workspace
    - getGet all webhooks on workspace
    - postCreate webhooks
    - delDelete webhook
    - getGet a specific webhook by id
    - putUpdate a webhook
    - postGet logs for a webhook
    - patchGenerate new token
  - Approval
    - getGet approval requests
    - postSubmit approval request
    - postRe-submit rejected/withdrawn entries/expenses for approval
    - postSubmit approval request for user
    - postRe-submit rejected/withdrawn entries/expenses for approval for user
    - patchUpdate approval request
  - Client
    - getFind clients on workspace
    - postAdd a new client
    - delDelete client
    - getGet client by ID
    - putUpdate client
  - Custom fields
    - getGet custom fields on workspace
    - postCreate custom fields on workspace
    - delDelete custom field
    - putUpdate custom field on workspace
    - getGet custom fields on project
    - delRemove custom field from project
    - patchUpdate custom field on project
  - Expense
    - getGet all expenses on workspace
    - postCreate expense
    - getGet all expense categories
    - postAdd expense category
    - delDelete expense category
    - putUpdate expense category
    - patchArchive expense category
    - delDelete expense
    - getGet expense by ID
    - putUpdate expense
    - getDownload receipt
  - Holiday
    - getGet holidays on workspace
    - postCreate holiday
    - getGet holiday in specific period
    - delDelete holiday
    - putUpdate holiday
  - Invoice
    - getGet all invoices on workspace
    - postAdd invoice
    - postFilter out invoices
    - getGet invoice in another language
    - putChange invoice language
    - delDelete invoice
    - getGet invoice by ID
    - putSend invoice
    - postDuplicate invoice
    - getExport invoice
    - getGet payments for invoice
    - postAdd payment to invoice
    - delDelete payment from invoice
    - patchChange invoice status
  - Project
    - getGet all projects on workspace
    - postAdd a new project
    - delDelete project from workspace
    - getFind project by ID
    - putUpdate project on workspace
    - patchUpdate project estimate
    - patchUpdate project memberships
    - postAssign/remove users to/from the project
    - patchUpdate project template
    - putUpdate project user cost rate
    - putUpdate project user billable rate
  - Task
    - getFind tasks on project
    - postAdd a new task on project
    - putUpdate task cost rate
    - putUpdate task billable rate
    - delDelete task from project
    - getGet task by id
    - putUpdate task on project
  - Scheduling
    - getGet all assignments
    - postGet all scheduled assignments per project
    - getGet all scheduled assignments on project
    - putPublish assignments
    - postCreate recurring assignment
    - delDelete recurring assignment
    - patchUpdate recurring assignment
    - putChange recurring period
    - postGet total of users' capacity on workspace
    - getGet total capacity of a user
    - postCopy scheduled assignment
  - Tag
    - getFind tags on workspace
    - postAdd a new tag
    - delDelete tag
    - getGet tag by ID
    - putUpdate tag
  - Time entry
    - postAdd a new time entry
    - patchMark time entries as invoiced
    - getGet all in progress time entries on workspace
    - delDelete time entry from workspace
    - getGet a specific time entry on workspace
    - putUpdate time entry on workspace
    - delDelete all time entries for user on workspace
    - getGet time entries for a user on workspace
    - patchStop currently running timer on workspace for user
    - postAdd a new time entry for another user on workspace
    - putBulk edit time entries
    - postDuplicate time entry
  - Balance
    - getGet balance by policy
    - patchUpdate balance
    - getGet balance by user
  - Policy
    - getGet policies on workspace
    - postCreate time off policy
    - delDelete policy
    - getGet time off policy
    - patchChange policy status
    - putUpdate policy
  - Time Off
    - postCreate time off request
    - delDelete request
    - patchChange time off request status
    - postCreate time off request for user
    - postGet all time off requests on workspace
  - Group
    - getFind all groups on workspace
    - postAdd a new group
    - delDelete group
    - putUpdate group
    - postAdd users to group
    - delRemove user from group
- Clockify Reports API
  - Shared Report
    - getGenerate shared report by ID
    - getGet all my shared reports
    - postCreate shared report
    - delDelete shared report
    - putUpdate shared report
  - Team Report
    - postGenerate attendance report
  - Time Entry Report
    - postDetailed report
    - postSummary report
    - postWeekly report
  - Expense Report
    - postGenerate expense report
- Deprecated API
  - Balance (Deprecated)
    - getGet balance by policy
    - patchUpdate balance
    - getGet balance by user
  - Policy (Deprecated)
    - getGet policies on workspace
    - postCreate time off policy
    - delDelete policy
    - getGet time off policy
    - patchChange policy status
    - putUpdate policy
  - Time Off (Deprecated)
    - postCreate time off request
    - delDelete request
    - patchChange time off request status
    - postCreate time off request for user
    - postGet all time off requests on workspace
  - Scheduling (Deprecated)
    - getGet all scheduled assignments per project
  - Workspace (Deprecated)
    - delRemove user from workspace
- Experimental API
  - Entity changes (Experimental)
    - getDeleted entities (Experimental)
    - getUpdated entities (Experimental)
- Guide
  - Entity Changes Use Cases
    - Entity Changes Based on Detailed Report
      - Step 1: Get Initial Data Using the Detailed Report API
      - Step 2: Retrieve Custom Field Value Changes for Subsequent Days
      - Step 3: Retrieve or Identify Deleted Custom Field Values
      - Note
[API docs by Redocly](https://redocly.com/redoc/)

# Clockify API (v1)

## [](#section/Introduction)Introduction

By using this REST API, you can easily integrate Clockify with your own add-ons, push and pull data between Clockify and other tools, and create custom add-ons on [CAKE.com Marketplace](https://marketplace.cake.com). Whether you’re looking to automate time tracking, generate custom reports, or build other custom integrations, our API provides the flexibility and power you need to get the job done. If you have any questions or run into any issues while using our API, don’t hesitate to reach out to us for help. You can also post questions on Stack Overflow with the Clockify tag to get help from the community.


## [](#section/Authentication)Authentication

To authenticate your requests to your API, make sure to include either the ‘X-Api-Key’ or the ‘X-Addon-Token’ in the request header, containing your API or Addon key. If your workspace is on a subdomain (e.g. subdomain.clockify.me), you’ll need to generate a new API key in your Profile Settings that will work specifically for that workspace. This ensures that you’re accessing data from the correct workspace and helps maintain the security of your data.


## [](#section/Webhooks)Webhooks

Webhooks can enhance your workflow by keeping your add-on up-to-date with the latest changes in Clockify. With Clockify’s webhooks you can receive real-time notifications when certain events such as starting timer or deleting time entry occur in Clockify. Workspace admins can create up to 10 webhooks each, with a total of 100 webhooks allowed per workspace.


## [](#section/Rate-limiting)Rate limiting

Our REST API has a specific rate limit of 50 requests per second (by addon on one workspace) when accessed using X-Addon-Token. Exceeding this limit will result in an error message with the description "Too many requests".


## [](#section/API-URLs)API URLs

Refer to the list on what URL to use base on the subdomain and data region settings of your workspace.


- Global - can be used by workspaces with or without subdomain.

  - Regular: [https://api.clockify.me/api/v1/file/image](https://api.clockify.me/api/v1/file/image)

  - PTO: [https://pto.api.clockify.me/v1/workspaces/{workspaceId}/policies](https://pto.api.clockify.me/v1/workspaces/%7BworkspaceId%7D/policies)

  - Reports: [https://reports.api.clockify.me/v1/workspaces/{workspaceId}/reports/detailed](https://reports.api.clockify.me/v1/workspaces/%7BworkspaceId%7D/reports/detailed)


- Regional

  - Non-subdomain

    - Regular: [https://euc1.clockify.me/api/v1/file/image](https://euc1.clockify.me/api/v1/file/image)

    - PTO: [https://use2.api.clockify.me/pto/v1/workspaces/{workspaceId}/policies](https://use2.api.clockify.me/pto/v1/workspaces/%7BworkspaceId%7D/policies)

    - Reports: [https://use2.clockify.me/report/v1/workspaces/{workspaceId}/reports/detailed](https://use2.clockify.me/report/v1/workspaces/%7BworkspaceId%7D/reports/detailed)


  - Subdomain

    - Regular: [https://euc1.clockify.me/api/v1/file/image](https://euc1.clockify.me/api/v1/file/image)

    - PTO: [https://yoursubdomainname.clockify.me/pto/v1/workspaces/{workspaceId}/policies](https://yoursubdomainname.clockify.me/pto/v1/workspaces/%7BworkspaceId%7D/policies)

    - Reports: [https://yoursubdomainname.clockify.me/report/v1/workspaces/{workspaceId}/reports/detailed](https://yoursubdomainname.clockify.me/report/v1/workspaces/%7BworkspaceId%7D/reports/detailed)


## [](#section/Regional-Server-Prefixes)Regional Server Prefixes

If your workspace is in a specific region, you need to change your URL prefix to access v1 API endpoints. For example, this is how **backend** api [v1/file/image](#tag/User/operation/uploadImage) endpoint would look in EU region: [https://euc1.clockify.me/api/v1/file/image](https://euc1.clockify.me)


Below are the available regional server prefixes:


- **EU (Germany)**: euc1

- **USA**: use2

- **UK**: euw2

- **AU**: apse2


## [](#section/Breaking-changes)Breaking changes

Breaking changes in APIs are modifications that disrupt existing integrations, requiring users to update their applications to maintain functionality. These changes can lead to failures or unexpected results if not addressed. See the list of [breaking changes](/breaking-changes).


## [](#section/Experimental-APIs)Experimental APIs

The experimental API has been thoroughly tested and is ready for use in production. However, please note that user feedback may lead to changes in the API’s structure or functionality. If you choose to use the experimental API, be prepared to modify your application code accordingly to accommodate any updates.


## [](#tag/User)User

## [](#tag/User/operation/uploadImage)Add photo

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### Request Body schema: multipart/form-data


| filerequired | string <binary> Image to be uploaded |


### Responses
**200 **

OK

 post/v1/file/imagehttps://api.clockify.me/api/v1/file/image

###  Response samples
- 200
Content typeapplication/jsonCopy`{
- "name": "image-01234567.jpg",
- "url": "[https://clockify.com/image-01234567.jpg](https://clockify.com/image-01234567.jpg)"
}`

## [](#tag/User/operation/getLoggedUser)Get currently logged-in user's info

##### Authorizations:
*MarketplaceKeyAuth**ApiKeyAuth**AddonKeyAuth*

##### query Parameters


| include-memberships | boolean Example: include-memberships=trueIf set to true, memberships will be included. |


### Responses
**200 **

OK

 get/v1/userhttps://api.clockify.me/api/v1/user

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "activeWorkspace": "64a687e29ae1f428e7ebe303",
- "customFields": [
  - {
    - "customFieldId": "5e4117fe8c625f38930d57b7",
    - "customFieldName": "TIN",
    - "customFieldType": "TXT",
    - "userId": "5a0ab5acb07987125438b60f",
    - "value": "20231211-12345"
}
],
- "defaultWorkspace": "64a687e29ae1f428e7ebe303",
- "email": "johndoe@example.com",
- "id": "5a0ab5acb07987125438b60f",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "John Doe",
- "profilePicture": "[https://www.url.com/profile-picture1234567890.png](https://www.url.com/profile-picture1234567890.png)",
- "settings": {
  - "alerts": true,
  - "approval": false,
  - "collapseAllProjectLists": true,
  - "dashboardPinToTop": true,
  - "dashboardSelection": "ME",
  - "dashboardViewType": "BILLABILITY",
  - "dateFormat": "MM/DD/YYYY",
  - "groupSimilarEntriesDisabled": true,
  - "isCompactViewOn": false,
  - "lang": "en",
  - "longRunning": true,
  - "multiFactorEnabled": true,
  - "myStartOfDay": "09:00",
  - "onboarding": false,
  - "projectListCollapse": 15,
  - "projectPickerTaskFilter": false,
  - "pto": true,
  - "reminders": false,
  - "scheduledReports": true,
  - "scheduling": false,
  - "sendNewsletter": false,
  - "showOnlyWorkingDays": false,
  - "summaryReportSettings": {
    - "group": "PROJECT",
    - "subgroup": "CLIENT"
},
  - "theme": "DARK",
  - "timeFormat": "HOUR24",
  - "timeTrackingManual": true,
  - "timeZone": "Asia/Aden",
  - "weekStart": "MONDAY",
  - "weeklyUpdates": false
},
- "status": "ACTIVE"
}`

## [](#tag/User/operation/getMemberProfile)Get member's profile

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/member-profile/{userId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/member-profile/{userId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "email": "johndoe@example.com",
- "hasPassword": true,
- "hasPendingApprovalRequest": true,
- "imageUrl": "[https://www.url.com/imageurl-1234567890.jpg](https://www.url.com/imageurl-1234567890.jpg)",
- "name": "John Doe",
- "userCustomFieldValues": [
  - {
    - "customField": {
      - "allowedValues": [
        - "New York",
        - "London",
        - "Manila",
        - "Sydney",
        - "Belgrade"
],
      - "description": "This field contains a location.",
      - "entityType": "USER",
      - "id": "44a687e29ae1f428e7ebe305",
      - "name": "location",
      - "onlyAdminCanEdit": true,
      - "placeholder": "Location",
      - "projectDefaultValues": [
        - {
          - "projectId": "5b641568b07987035750505e",
          - "status": "VISIBLE",
          - "value": "Manila"
}
],
      - "required": true,
      - "status": "VISIBLE",
      - "type": "DROPDOWN_MULTIPLE",
      - "workspaceDefaultValue": "Manila",
      - "workspaceId": "64a687e29ae1f428e7ebe303"
},
    - "customFieldId": "5e4117fe8c625f38930d57b7",
    - "name": "race",
    - "sourceType": "WORKSPACE",
    - "type": "DROPDOWN_MULTIPLE",
    - "userId": "5a0ab5acb07987125438b60f",
    - "value": "Asian"
}
],
- "weekStart": "MONDAY",
- "workCapacity": "PT7H",
- "workingDays": "[\"MONDAY\",\"TUESDAY\",\"WEDNESDAY\",\"THURSDAY\",\"FRIDAY\"]",
- "workspaceNumber": 3
}`

## [](#tag/User/operation/updateMemberProfileWithAdditionalData)Update member's profile

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### Request Body schema: application/jsonrequired


| imageUrl | string Represents an image url. A field that can only be updated for limited users. |


| name | string [ 1 .. 100 ] characters Deprecated This body field is deprecated and can only be updated for limited users. Represents name of the user and can be changed on the CAKE.com Account profile page. |


| removeProfileImage | boolean Indicates whether to remove profile image or not. A field that can only be updated for limited users. |


| userCustomFields | Array of objects (UpsertUserCustomFieldRequest) Represents a list of upsert user custom field objects. |


| weekStart | string Enum: "MONDAY" "TUESDAY" "WEDNESDAY" "THURSDAY" "FRIDAY" "SATURDAY" "SUNDAY" Represents a day of the week. |


| workCapacity | string Represents work capacity as a time duration in the ISO-8601 format. For example, for a 7hr work day, input should be PT7H. |


| workingDays | string Enum: "MONDAY" "TUESDAY" "WEDNESDAY" "THURSDAY" "FRIDAY" "SATURDAY" "SUNDAY" Represents a list of days of the week. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/member-profile/{userId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/member-profile/{userId}

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "imageUrl": "[https://www.url.com/imageurl-1234567890.jpg](https://www.url.com/imageurl-1234567890.jpg)",
- "name": "John Doe",
- "removeProfileImage": true,
- "userCustomFields": [
  - {
    - "customFieldId": "5e4117fe8c625f38930d57b7",
    - "value": "20231211-12345"
}
],
- "weekStart": "MONDAY",
- "workCapacity": "PT7H",
- "workingDays": "[\"MONDAY\",\"TUESDAY\",\"WEDNESDAY\",\"THURSDAY\",\"FRIDAY\"]"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "email": "johndoe@example.com",
- "hasPassword": true,
- "hasPendingApprovalRequest": true,
- "imageUrl": "[https://www.url.com/imageurl-1234567890.jpg](https://www.url.com/imageurl-1234567890.jpg)",
- "name": "John Doe",
- "userCustomFieldValues": [
  - {
    - "customField": {
      - "allowedValues": [
        - "New York",
        - "London",
        - "Manila",
        - "Sydney",
        - "Belgrade"
],
      - "description": "This field contains a location.",
      - "entityType": "USER",
      - "id": "44a687e29ae1f428e7ebe305",
      - "name": "location",
      - "onlyAdminCanEdit": true,
      - "placeholder": "Location",
      - "projectDefaultValues": [
        - {
          - "projectId": "5b641568b07987035750505e",
          - "status": "VISIBLE",
          - "value": "Manila"
}
],
      - "required": true,
      - "status": "VISIBLE",
      - "type": "DROPDOWN_MULTIPLE",
      - "workspaceDefaultValue": "Manila",
      - "workspaceId": "64a687e29ae1f428e7ebe303"
},
    - "customFieldId": "5e4117fe8c625f38930d57b7",
    - "name": "race",
    - "sourceType": "WORKSPACE",
    - "type": "DROPDOWN_MULTIPLE",
    - "userId": "5a0ab5acb07987125438b60f",
    - "value": "Asian"
}
],
- "weekStart": "MONDAY",
- "workCapacity": "PT7H",
- "workingDays": "[\"MONDAY\",\"TUESDAY\",\"WEDNESDAY\",\"THURSDAY\",\"FRIDAY\"]",
- "workspaceNumber": 3
}`

## [](#tag/User/operation/getUsersOfWorkspace)Find all users on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| email | string Example: email=mail@example.comIf provided, you'll get a filtered list of users that contain the provided string in their email address. |


| project-id | string Example: project-id=21a687e29ae1f428e7ebe606If provided, you'll get a list of users that have access to the project. |


| status | string Enum: "PENDING" "ACTIVE" "DECLINED" "INACTIVE" "ALL" Example: status=ACTIVEIf provided, you'll get a filtered list of users with the corresponding status. |


| account-statuses | string Example: account-statuses=LIMITEDIf provided, you'll get a filtered list of users with the corresponding account status filter. If not, this will only filter ACTIVE, PENDING_EMAIL_VERIFICATION, and NOT_REGISTERED Users. |


| name | string Example: name=JohnIf provided, you'll get a filtered list of users that contain the provided string in their name |


| sort-column | string Enum: "ID" "EMAIL" "NAME" "NAME_LOWERCASE" "ACCESS" "HOURLYRATE" "COSTRATE" Example: sort-column=IDSorting column criteria. Default value: EMAIL |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGSorting mode. Default value: ASCENDING |


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


| memberships | string Enum: "ALL" "NONE" "WORKSPACE" "PROJECT" "USERGROUP" Example: memberships=WORKSPACEIf provided, you'll get all users along with workspaces, groups, or projects they have access to. Default value is NONE. |


| include-rolesrequired | string Default: "false" If you pass along includeRoles=true, you'll get each user's detailed manager role (including projects and members which they manage) |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/usershttps://api.clockify.me/api/v1/workspaces/{workspaceId}/users

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "activeWorkspace": "64a687e29ae1f428e7ebe303",
  - "customFields": [
    - {
      - "customFieldId": "5e4117fe8c625f38930d57b7",
      - "customFieldName": "TIN",
      - "customFieldType": "TXT",
      - "userId": "5a0ab5acb07987125438b60f",
      - "value": "20231211-12345"
}
],
  - "defaultWorkspace": "64a687e29ae1f428e7ebe303",
  - "email": "johndoe@example.com",
  - "id": "5a0ab5acb07987125438b60f",
  - "memberships": [
    - {
      - "costRate": {
        - "amount": 10500,
        - "currency": "USD"
},
      - "hourlyRate": {
        - "amount": 10500,
        - "currency": "USD"
},
      - "membershipStatus": "PENDING",
      - "membershipType": "PROJECT",
      - "targetId": "64c777ddd3fcab07cfbb210c",
      - "userId": "5a0ab5acb07987125438b60f"
}
],
  - "name": "John Doe",
  - "profilePicture": "[https://www.url.com/profile-picture1234567890.png](https://www.url.com/profile-picture1234567890.png)",
  - "settings": {
    - "alerts": true,
    - "approval": false,
    - "collapseAllProjectLists": true,
    - "dashboardPinToTop": true,
    - "dashboardSelection": "ME",
    - "dashboardViewType": "BILLABILITY",
    - "dateFormat": "MM/DD/YYYY",
    - "groupSimilarEntriesDisabled": true,
    - "isCompactViewOn": false,
    - "lang": "en",
    - "longRunning": true,
    - "multiFactorEnabled": true,
    - "myStartOfDay": "09:00",
    - "onboarding": false,
    - "projectListCollapse": 15,
    - "projectPickerTaskFilter": false,
    - "pto": true,
    - "reminders": false,
    - "scheduledReports": true,
    - "scheduling": false,
    - "sendNewsletter": false,
    - "showOnlyWorkingDays": false,
    - "summaryReportSettings": {
      - "group": "PROJECT",
      - "subgroup": "CLIENT"
},
    - "theme": "DARK",
    - "timeFormat": "HOUR24",
    - "timeTrackingManual": true,
    - "timeZone": "Asia/Aden",
    - "weekStart": "MONDAY",
    - "weeklyUpdates": false
},
  - "status": "ACTIVE"
}
]`

## [](#tag/User/operation/filterUsersOfWorkspace) Filter workspace users

##### Authorizations:
*MarketplaceKeyAuth**ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| accountStatuses | Array of strings unique If provided, you'll get a filtered list of users with the corresponding account status filter. If not, this will only filter ACTIVE, PENDING_EMAIL_VERIFICATION, and NOT_REGISTERED Users. |


| email | string If provided, you'll get a filtered list of users that contain the provided string in their email address. |


| includeRoles | boolean If you pass along includeRoles=true, you'll get each user's detailed manager role (including projects and members for whom they're managers) |


| memberships | string Default: "NONE" Enum: "ALL" "NONE" "WORKSPACE" "PROJECT" "USERGROUP" If provided, you'll get all users along with workspaces, groups, or projects they have access to. |


| name | string If provided, you'll get a filtered list of users that contain the provided string in their name. |


| page | integer <int32> Page number. |


| pageSize | integer <int32> Page size. |


| projectId | string If provided, you'll get a list of users that have access to the project. |


| roles | Array of strings unique Items Enum: "WORKSPACE_ADMIN" "OWNER" "TEAM_MANAGER" "PROJECT_MANAGER" If provided, you'll get a filtered list of users that have any of the specified roles. Owners are counted as admins when filtering. |


| sortColumn | string Enum: "ID" "EMAIL" "NAME" "NAME_LOWERCASE" "ACCESS" "HOURLYRATE" "COSTRATE" Sorting criteria |


| sortOrder | string Enum: "ASCENDING" "DESCENDING" Sorting mode |


| status | string Enum: "PENDING" "ACTIVE" "DECLINED" "INACTIVE" "ALL" If provided, you'll get a filtered list of users with the corresponding status. |


| userGroups | Array of strings unique If provided, you'll get a list of users that belong to the specified user group IDs. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/users/infohttps://api.clockify.me/api/v1/workspaces/{workspaceId}/users/info

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "accountStatuses": [
  - "LIMITED",
  - "ACTIVE"
],
- "email": "mail@example.com",
- "includeRoles": true,
- "memberships": "NONE",
- "name": "John",
- "page": 1,
- "pageSize": 50,
- "projectId": "21a687e29ae1f428e7ebe606",
- "roles": [
  - "WORKSPACE_ADMIN",
  - "OWNER"
],
- "sortColumn": "ID",
- "sortOrder": "ASCENDING",
- "status": "ACTIVE",
- "userGroups": [
  - "5a0ab5acb07987125438b60f",
  - "72wab5acb07987125438b564"
]
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "activeWorkspace": "64a687e29ae1f428e7ebe303",
  - "customFields": [
    - {
      - "customFieldId": "5e4117fe8c625f38930d57b7",
      - "customFieldName": "TIN",
      - "customFieldType": "TXT",
      - "userId": "5a0ab5acb07987125438b60f",
      - "value": "20231211-12345"
}
],
  - "defaultWorkspace": "64a687e29ae1f428e7ebe303",
  - "email": "johndoe@example.com",
  - "id": "5a0ab5acb07987125438b60f",
  - "memberships": [
    - {
      - "costRate": {
        - "amount": 10500,
        - "currency": "USD"
},
      - "hourlyRate": {
        - "amount": 10500,
        - "currency": "USD"
},
      - "membershipStatus": "PENDING",
      - "membershipType": "PROJECT",
      - "targetId": "64c777ddd3fcab07cfbb210c",
      - "userId": "5a0ab5acb07987125438b60f"
}
],
  - "name": "John Doe",
  - "profilePicture": "[https://www.url.com/profile-picture1234567890.png](https://www.url.com/profile-picture1234567890.png)",
  - "settings": {
    - "alerts": true,
    - "approval": false,
    - "collapseAllProjectLists": true,
    - "dashboardPinToTop": true,
    - "dashboardSelection": "ME",
    - "dashboardViewType": "BILLABILITY",
    - "dateFormat": "MM/DD/YYYY",
    - "groupSimilarEntriesDisabled": true,
    - "isCompactViewOn": false,
    - "lang": "en",
    - "longRunning": true,
    - "multiFactorEnabled": true,
    - "myStartOfDay": "09:00",
    - "onboarding": false,
    - "projectListCollapse": 15,
    - "projectPickerTaskFilter": false,
    - "pto": true,
    - "reminders": false,
    - "scheduledReports": true,
    - "scheduling": false,
    - "sendNewsletter": false,
    - "showOnlyWorkingDays": false,
    - "summaryReportSettings": {
      - "group": "PROJECT",
      - "subgroup": "CLIENT"
},
    - "theme": "DARK",
    - "timeFormat": "HOUR24",
    - "timeTrackingManual": true,
    - "timeZone": "Asia/Aden",
    - "weekStart": "MONDAY",
    - "weeklyUpdates": false
},
  - "status": "ACTIVE"
}
]`

## [](#tag/User/operation/upsertUserCustomFieldValue)Update user's custom field

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


| customFieldIdrequired | string Example: 5e4117fe8c625f38930d57b7Represents custom field identifier across the system. |


##### Request Body schema: application/jsonrequired


| value | object Represents custom field value. |


### Responses
**201 **

Created

 put/v1/workspaces/{workspaceId}/users/{userId}/custom-field/{customFieldId}/valuehttps://api.clockify.me/api/v1/workspaces/{workspaceId}/users/{userId}/custom-field/{customFieldId}/value

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "value": "20231211-12345"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy`{
- "customFieldId": "5e4117fe8c625f38930d57b7",
- "customFieldName": "TIN",
- "customFieldType": "TXT",
- "userId": "5a0ab5acb07987125438b60f",
- "value": "20231211-12345"
}`

## [](#tag/User/operation/getManagersOfUser)Find user's team manager

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### query Parameters


| sort-column | string Enum: "ID" "EMAIL" "NAME" "NAME_LOWERCASE" "ACCESS" "HOURLYRATE" "COSTRATE" Example: sort-column=IDSorting column criteria |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGSorting mode |


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/users/{userId}/managershttps://api.clockify.me/api/v1/workspaces/{workspaceId}/users/{userId}/managers

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "activeWorkspace": "64a687e29ae1f428e7ebe303",
  - "customFields": [
    - {
      - "customFieldId": "5e4117fe8c625f38930d57b7",
      - "customFieldName": "TIN",
      - "customFieldType": "TXT",
      - "userId": "5a0ab5acb07987125438b60f",
      - "value": "20231211-12345"
}
],
  - "defaultWorkspace": "64a687e29ae1f428e7ebe303",
  - "email": "johndoe@example.com",
  - "id": "5a0ab5acb07987125438b60f",
  - "memberships": [
    - {
      - "costRate": {
        - "amount": 10500,
        - "currency": "USD"
},
      - "hourlyRate": {
        - "amount": 10500,
        - "currency": "USD"
},
      - "membershipStatus": "PENDING",
      - "membershipType": "PROJECT",
      - "targetId": "64c777ddd3fcab07cfbb210c",
      - "userId": "5a0ab5acb07987125438b60f"
}
],
  - "name": "John Doe",
  - "profilePicture": "[https://www.url.com/profile-picture1234567890.png](https://www.url.com/profile-picture1234567890.png)",
  - "settings": {
    - "alerts": true,
    - "approval": false,
    - "collapseAllProjectLists": true,
    - "dashboardPinToTop": true,
    - "dashboardSelection": "ME",
    - "dashboardViewType": "BILLABILITY",
    - "dateFormat": "MM/DD/YYYY",
    - "groupSimilarEntriesDisabled": true,
    - "isCompactViewOn": false,
    - "lang": "en",
    - "longRunning": true,
    - "multiFactorEnabled": true,
    - "myStartOfDay": "09:00",
    - "onboarding": false,
    - "projectListCollapse": 15,
    - "projectPickerTaskFilter": false,
    - "pto": true,
    - "reminders": false,
    - "scheduledReports": true,
    - "scheduling": false,
    - "sendNewsletter": false,
    - "showOnlyWorkingDays": false,
    - "summaryReportSettings": {
      - "group": "PROJECT",
      - "subgroup": "CLIENT"
},
    - "theme": "DARK",
    - "timeFormat": "HOUR24",
    - "timeTrackingManual": true,
    - "timeZone": "Asia/Aden",
    - "weekStart": "MONDAY",
    - "weeklyUpdates": false
},
  - "status": "ACTIVE"
}
]`

## [](#tag/User/operation/deleteUserRole)Remove user's manager role

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### Request Body schema: application/jsonrequired


| entityIdrequired | string Represents entity identifier across the system. |


| rolerequired | string Enum: "WORKSPACE_ADMIN" "TEAM_MANAGER" "PROJECT_MANAGER" Represents valid role. |


| sourceTyperequired | string Value: "USER_GROUP" Represents the source type of this request. This helps the API to determine on where to select this 'entity', and applies a corresponding action base on the endpoint. The entityId should be relative to this source, and can be used whenever the endpoint needs to access a certain resource. e.g. User group (USER_GROUP) |


### Responses
**204 **

No Content

 delete/v1/workspaces/{workspaceId}/users/{userId}/roleshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/users/{userId}/roles

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "entityId": "60f924bafdaf031696ec6218",
- "role": "WORKSPACE_ADMIN",
- "sourceType": "USER_GROUP"
}`

## [](#tag/User/operation/createUserRole)Give user manager role

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### Request Body schema: application/jsonrequired


| entityIdrequired | string Represents entity identifier across the system. |


| rolerequired | string Enum: "WORKSPACE_ADMIN" "TEAM_MANAGER" "PROJECT_MANAGER" Represents valid role. |


| sourceTyperequired | string Value: "USER_GROUP" Represents the source type of this request. This helps the API to determine on where to select this 'entity', and applies a corresponding action base on the endpoint. The entityId should be relative to this source, and can be used whenever the endpoint needs to access a certain resource. e.g. User group (USER_GROUP) |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/users/{userId}/roleshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/users/{userId}/roles

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "entityId": "60f924bafdaf031696ec6218",
- "role": "WORKSPACE_ADMIN",
- "sourceType": "USER_GROUP"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "role": {
    - "id": "60f91b3ffdaf031696ec61a8",
    - "name": "Administrator",
    - "source": {
      - "id": "5b715612b079875110791234",
      - "type": "USER_GROUP"
}
},
  - "userId": "5a0ab5acb07987125438b60f",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Workspace)Workspace

## [](#tag/Workspace/operation/getWorkspacesOfUser)Get all my workspaces

##### Authorizations:
*MarketplaceKeyAuth**ApiKeyAuth*

##### query Parameters


| roles | string Enum: "WORKSPACE_ADMIN" "OWNER" "TEAM_MANAGER" "PROJECT_MANAGER" Example: roles=WORKSPACE_ADMIN&roles=OWNERIf provided, you'll get a filtered list of workspaces where you have any of the specified roles. Owners are not counted as admins when filtering. |


### Responses
**200 **

OK

 get/v1/workspaceshttps://api.clockify.me/api/v1/workspaces

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "cakeOrganizationId": "67d471fb56aa9668b7bfa295",
  - "costRate": {
    - "amount": 10500,
    - "currency": "USD"
},
  - "currencies": [
    - {
      - "code": "USD",
      - "id": "5b641568b07987035750505e",
      - "isDefault": true
}
],
  - "featureSubscriptionType": "PREMIUM",
  - "features": [
    - "ADD_TIME_FOR_OTHERS",
    - "ADMIN_PANEL",
    - "ALERTS",
    - "APPROVAL"
],
  - "hourlyRate": {
    - "amount": 10500,
    - "currency": "USD"
},
  - "id": "64a687e29ae1f428e7ebe303",
  - "imageUrl": "[https://www.url.com/imageurl-1234567890.jpg](https://www.url.com/imageurl-1234567890.jpg)",
  - "memberships": [
    - {
      - "costRate": {
        - "amount": 10500,
        - "currency": "USD"
},
      - "hourlyRate": {
        - "amount": 10500,
        - "currency": "USD"
},
      - "membershipStatus": "PENDING",
      - "membershipType": "PROJECT",
      - "targetId": "64c777ddd3fcab07cfbb210c",
      - "userId": "5a0ab5acb07987125438b60f"
}
],
  - "name": "Cool Company",
  - "subdomain": {
    - "enabled": true,
    - "name": "coolcompany"
},
  - "workspaceSettings": {
    - "activeBillableHours": true,
    - "adminOnlyPages": "[\"PROJECT\",\"TEAM\",\"REPORTS\"]",
    - "automaticLock": {
      - "changeDay": "FRIDAY",
      - "dayOfMonth": 15,
      - "firstDay": "MONDAY",
      - "olderThanPeriod": "DAYS",
      - "olderThanValue": 5,
      - "type": "WEEKLY"
},
    - "canSeeTimeSheet": true,
    - "canSeeTracker": true,
    - "currencyFormat": "CURRENCY_SPACE_VALUE",
    - "defaultBillableProjects": true,
    - "durationFormat": "FULL",
    - "entityCreationPermissions": {
      - "whoCanCreateProjectsAndClients": "EVERYONE",
      - "whoCanCreateTags": "EVERYONE",
      - "whoCanCreateTasks": "EVERYONE"
},
    - "forceDescription": true,
    - "forceProjects": true,
    - "forceTags": true,
    - "forceTasks": true,
    - "isProjectPublicByDefault": true,
    - "lockTimeEntries": "2024-02-25T23:00:00Z",
    - "lockTimeZone": "Europe/Belgrade",
    - "multiFactorEnabled": true,
    - "numberFormat": "COMMA_PERIOD",
    - "onlyAdminsCanChangeBillableStatus": true,
    - "onlyAdminsCreateProject": true,
    - "onlyAdminsCreateTag": true,
    - "onlyAdminsCreateTask": true,
    - "onlyAdminsSeeAllTimeEntries": true,
    - "onlyAdminsSeeBillableRates": true,
    - "onlyAdminsSeeDashboard": true,
    - "onlyAdminsSeePublicProjectsEntries": true,
    - "projectFavorites": true,
    - "projectGroupingLabel": "Project Label",
    - "projectPickerSpecialFilter": true,
    - "round": {
      - "minutes": "15",
      - "round": "Round to nearest"
},
    - "timeRoundingInReports": true,
    - "timeTrackingMode": "DEFAULT",
    - "trackTimeDownToSecond": true
}
}
]`

## [](#tag/Workspace/operation/createWorkspace)Add workspace

##### Authorizations:
*ApiKeyAuth*

##### Request Body schema: application/jsonrequired


| name | string [ 1 .. 50 ] characters Represents a workspace name. |


| organizationId | string Represents the Cake organization identifier across the system. |


### Responses
**201 **

Created

 post/v1/workspaceshttps://api.clockify.me/api/v1/workspaces

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "name": "Cool Company",
- "organizationId": "67d471fb56aa9668b7bfa295"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "cakeOrganizationId": "67d471fb56aa9668b7bfa295",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "currencies": [
  - {
    - "code": "USD",
    - "id": "5b641568b07987035750505e",
    - "isDefault": true
}
],
- "featureSubscriptionType": "PREMIUM",
- "features": [
  - "ADD_TIME_FOR_OTHERS",
  - "ADMIN_PANEL",
  - "ALERTS",
  - "APPROVAL"
],
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "64a687e29ae1f428e7ebe303",
- "imageUrl": "[https://www.url.com/imageurl-1234567890.jpg](https://www.url.com/imageurl-1234567890.jpg)",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Cool Company",
- "subdomain": {
  - "enabled": true,
  - "name": "coolcompany"
},
- "workspaceSettings": {
  - "activeBillableHours": true,
  - "adminOnlyPages": "[\"PROJECT\",\"TEAM\",\"REPORTS\"]",
  - "automaticLock": {
    - "changeDay": "FRIDAY",
    - "dayOfMonth": 15,
    - "firstDay": "MONDAY",
    - "olderThanPeriod": "DAYS",
    - "olderThanValue": 5,
    - "type": "WEEKLY"
},
  - "canSeeTimeSheet": true,
  - "canSeeTracker": true,
  - "currencyFormat": "CURRENCY_SPACE_VALUE",
  - "defaultBillableProjects": true,
  - "durationFormat": "FULL",
  - "entityCreationPermissions": {
    - "whoCanCreateProjectsAndClients": "EVERYONE",
    - "whoCanCreateTags": "EVERYONE",
    - "whoCanCreateTasks": "EVERYONE"
},
  - "forceDescription": true,
  - "forceProjects": true,
  - "forceTags": true,
  - "forceTasks": true,
  - "isProjectPublicByDefault": true,
  - "lockTimeEntries": "2024-02-25T23:00:00Z",
  - "lockTimeZone": "Europe/Belgrade",
  - "multiFactorEnabled": true,
  - "numberFormat": "COMMA_PERIOD",
  - "onlyAdminsCanChangeBillableStatus": true,
  - "onlyAdminsCreateProject": true,
  - "onlyAdminsCreateTag": true,
  - "onlyAdminsCreateTask": true,
  - "onlyAdminsSeeAllTimeEntries": true,
  - "onlyAdminsSeeBillableRates": true,
  - "onlyAdminsSeeDashboard": true,
  - "onlyAdminsSeePublicProjectsEntries": true,
  - "projectFavorites": true,
  - "projectGroupingLabel": "Project Label",
  - "projectPickerSpecialFilter": true,
  - "round": {
    - "minutes": "15",
    - "round": "Round to nearest"
},
  - "timeRoundingInReports": true,
  - "timeTrackingMode": "DEFAULT",
  - "trackTimeDownToSecond": true
}
}`

## [](#tag/Workspace/operation/getWorkspaceOfUser)Get workspace info

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}https://api.clockify.me/api/v1/workspaces/{workspaceId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "cakeOrganizationId": "67d471fb56aa9668b7bfa295",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "currencies": [
  - {
    - "code": "USD",
    - "id": "5b641568b07987035750505e",
    - "isDefault": true
}
],
- "featureSubscriptionType": "PREMIUM",
- "features": [
  - "ADD_TIME_FOR_OTHERS",
  - "ADMIN_PANEL",
  - "ALERTS",
  - "APPROVAL"
],
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "64a687e29ae1f428e7ebe303",
- "imageUrl": "[https://www.url.com/imageurl-1234567890.jpg](https://www.url.com/imageurl-1234567890.jpg)",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Cool Company",
- "subdomain": {
  - "enabled": true,
  - "name": "coolcompany"
},
- "workspaceSettings": {
  - "activeBillableHours": true,
  - "adminOnlyPages": "[\"PROJECT\",\"TEAM\",\"REPORTS\"]",
  - "automaticLock": {
    - "changeDay": "FRIDAY",
    - "dayOfMonth": 15,
    - "firstDay": "MONDAY",
    - "olderThanPeriod": "DAYS",
    - "olderThanValue": 5,
    - "type": "WEEKLY"
},
  - "canSeeTimeSheet": true,
  - "canSeeTracker": true,
  - "currencyFormat": "CURRENCY_SPACE_VALUE",
  - "defaultBillableProjects": true,
  - "durationFormat": "FULL",
  - "entityCreationPermissions": {
    - "whoCanCreateProjectsAndClients": "EVERYONE",
    - "whoCanCreateTags": "EVERYONE",
    - "whoCanCreateTasks": "EVERYONE"
},
  - "forceDescription": true,
  - "forceProjects": true,
  - "forceTags": true,
  - "forceTasks": true,
  - "isProjectPublicByDefault": true,
  - "lockTimeEntries": "2024-02-25T23:00:00Z",
  - "lockTimeZone": "Europe/Belgrade",
  - "multiFactorEnabled": true,
  - "numberFormat": "COMMA_PERIOD",
  - "onlyAdminsCanChangeBillableStatus": true,
  - "onlyAdminsCreateProject": true,
  - "onlyAdminsCreateTag": true,
  - "onlyAdminsCreateTask": true,
  - "onlyAdminsSeeAllTimeEntries": true,
  - "onlyAdminsSeeBillableRates": true,
  - "onlyAdminsSeeDashboard": true,
  - "onlyAdminsSeePublicProjectsEntries": true,
  - "projectFavorites": true,
  - "projectGroupingLabel": "Project Label",
  - "projectPickerSpecialFilter": true,
  - "round": {
    - "minutes": "15",
    - "round": "Round to nearest"
},
  - "timeRoundingInReports": true,
  - "timeTrackingMode": "DEFAULT",
  - "trackTimeDownToSecond": true
}
}`

## [](#tag/Workspace/operation/setWorkspaceCostRate)Update workspace cost rate

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| amountrequired | integer <int32> >= 0 Represents an amount as integer. |


| since | string Represents a date and time in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/cost-ratehttps://api.clockify.me/api/v1/workspaces/{workspaceId}/cost-rate

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "amount": 20000,
- "since": "2020-01-01T00:00:00Z"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "cakeOrganizationId": "67d471fb56aa9668b7bfa295",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "currencies": [
  - {
    - "code": "USD",
    - "id": "5b641568b07987035750505e",
    - "isDefault": true
}
],
- "featureSubscriptionType": "PREMIUM",
- "features": [
  - "ADD_TIME_FOR_OTHERS",
  - "ADMIN_PANEL",
  - "ALERTS",
  - "APPROVAL"
],
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "64a687e29ae1f428e7ebe303",
- "imageUrl": "[https://www.url.com/imageurl-1234567890.jpg](https://www.url.com/imageurl-1234567890.jpg)",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Cool Company",
- "subdomain": {
  - "enabled": true,
  - "name": "coolcompany"
},
- "workspaceSettings": {
  - "activeBillableHours": true,
  - "adminOnlyPages": "[\"PROJECT\",\"TEAM\",\"REPORTS\"]",
  - "automaticLock": {
    - "changeDay": "FRIDAY",
    - "dayOfMonth": 15,
    - "firstDay": "MONDAY",
    - "olderThanPeriod": "DAYS",
    - "olderThanValue": 5,
    - "type": "WEEKLY"
},
  - "canSeeTimeSheet": true,
  - "canSeeTracker": true,
  - "currencyFormat": "CURRENCY_SPACE_VALUE",
  - "defaultBillableProjects": true,
  - "durationFormat": "FULL",
  - "entityCreationPermissions": {
    - "whoCanCreateProjectsAndClients": "EVERYONE",
    - "whoCanCreateTags": "EVERYONE",
    - "whoCanCreateTasks": "EVERYONE"
},
  - "forceDescription": true,
  - "forceProjects": true,
  - "forceTags": true,
  - "forceTasks": true,
  - "isProjectPublicByDefault": true,
  - "lockTimeEntries": "2024-02-25T23:00:00Z",
  - "lockTimeZone": "Europe/Belgrade",
  - "multiFactorEnabled": true,
  - "numberFormat": "COMMA_PERIOD",
  - "onlyAdminsCanChangeBillableStatus": true,
  - "onlyAdminsCreateProject": true,
  - "onlyAdminsCreateTag": true,
  - "onlyAdminsCreateTask": true,
  - "onlyAdminsSeeAllTimeEntries": true,
  - "onlyAdminsSeeBillableRates": true,
  - "onlyAdminsSeeDashboard": true,
  - "onlyAdminsSeePublicProjectsEntries": true,
  - "projectFavorites": true,
  - "projectGroupingLabel": "Project Label",
  - "projectPickerSpecialFilter": true,
  - "round": {
    - "minutes": "15",
    - "round": "Round to nearest"
},
  - "timeRoundingInReports": true,
  - "timeTrackingMode": "DEFAULT",
  - "trackTimeDownToSecond": true
}
}`

## [](#tag/Workspace/operation/setWorkspaceHourlyRate)Update workspace billable rate

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| amountrequired | integer <int32> >= 0 Represents an amount as integer. |


| currencyrequired | string [ 1 .. 100 ] characters Default: "USD" Represents a currency. |


| since | string Represents a date and time in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/hourly-ratehttps://api.clockify.me/api/v1/workspaces/{workspaceId}/hourly-rate

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "amount": 2000,
- "currency": "USD",
- "since": "2020-01-01T00:00:00Z"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "cakeOrganizationId": "67d471fb56aa9668b7bfa295",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "currencies": [
  - {
    - "code": "USD",
    - "id": "5b641568b07987035750505e",
    - "isDefault": true
}
],
- "featureSubscriptionType": "PREMIUM",
- "features": [
  - "ADD_TIME_FOR_OTHERS",
  - "ADMIN_PANEL",
  - "ALERTS",
  - "APPROVAL"
],
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "64a687e29ae1f428e7ebe303",
- "imageUrl": "[https://www.url.com/imageurl-1234567890.jpg](https://www.url.com/imageurl-1234567890.jpg)",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Cool Company",
- "subdomain": {
  - "enabled": true,
  - "name": "coolcompany"
},
- "workspaceSettings": {
  - "activeBillableHours": true,
  - "adminOnlyPages": "[\"PROJECT\",\"TEAM\",\"REPORTS\"]",
  - "automaticLock": {
    - "changeDay": "FRIDAY",
    - "dayOfMonth": 15,
    - "firstDay": "MONDAY",
    - "olderThanPeriod": "DAYS",
    - "olderThanValue": 5,
    - "type": "WEEKLY"
},
  - "canSeeTimeSheet": true,
  - "canSeeTracker": true,
  - "currencyFormat": "CURRENCY_SPACE_VALUE",
  - "defaultBillableProjects": true,
  - "durationFormat": "FULL",
  - "entityCreationPermissions": {
    - "whoCanCreateProjectsAndClients": "EVERYONE",
    - "whoCanCreateTags": "EVERYONE",
    - "whoCanCreateTasks": "EVERYONE"
},
  - "forceDescription": true,
  - "forceProjects": true,
  - "forceTags": true,
  - "forceTasks": true,
  - "isProjectPublicByDefault": true,
  - "lockTimeEntries": "2024-02-25T23:00:00Z",
  - "lockTimeZone": "Europe/Belgrade",
  - "multiFactorEnabled": true,
  - "numberFormat": "COMMA_PERIOD",
  - "onlyAdminsCanChangeBillableStatus": true,
  - "onlyAdminsCreateProject": true,
  - "onlyAdminsCreateTag": true,
  - "onlyAdminsCreateTask": true,
  - "onlyAdminsSeeAllTimeEntries": true,
  - "onlyAdminsSeeBillableRates": true,
  - "onlyAdminsSeeDashboard": true,
  - "onlyAdminsSeePublicProjectsEntries": true,
  - "projectFavorites": true,
  - "projectGroupingLabel": "Project Label",
  - "projectPickerSpecialFilter": true,
  - "round": {
    - "minutes": "15",
    - "round": "Round to nearest"
},
  - "timeRoundingInReports": true,
  - "timeTrackingMode": "DEFAULT",
  - "trackTimeDownToSecond": true
}
}`

## [](#tag/Workspace/operation/addUsers)Add user

You can add users to a workspace via API only if that workspace has a paid subscription. If the workspace has a paid subscription, you can add as many users as you want but you are limited by the number of paid user seats on that workspace.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| send-emailrequired | string Default: "true" Indicates whether to send an email when user is added to the workspace. |


##### Request Body schema: application/jsonrequired


| emailrequired | string Represents email address of the user. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/usershttps://api.clockify.me/api/v1/workspaces/{workspaceId}/users

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "email": "johndoe@example.com"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "cakeOrganizationId": "67d471fb56aa9668b7bfa295",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "currencies": [
  - {
    - "code": "USD",
    - "id": "5b641568b07987035750505e",
    - "isDefault": true
}
],
- "featureSubscriptionType": "PREMIUM",
- "features": [
  - "ADD_TIME_FOR_OTHERS",
  - "ADMIN_PANEL",
  - "ALERTS",
  - "APPROVAL"
],
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "64a687e29ae1f428e7ebe303",
- "imageUrl": "[https://www.url.com/imageurl-1234567890.jpg](https://www.url.com/imageurl-1234567890.jpg)",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Cool Company",
- "subdomain": {
  - "enabled": true,
  - "name": "coolcompany"
},
- "workspaceSettings": {
  - "activeBillableHours": true,
  - "adminOnlyPages": "[\"PROJECT\",\"TEAM\",\"REPORTS\"]",
  - "automaticLock": {
    - "changeDay": "FRIDAY",
    - "dayOfMonth": 15,
    - "firstDay": "MONDAY",
    - "olderThanPeriod": "DAYS",
    - "olderThanValue": 5,
    - "type": "WEEKLY"
},
  - "canSeeTimeSheet": true,
  - "canSeeTracker": true,
  - "currencyFormat": "CURRENCY_SPACE_VALUE",
  - "defaultBillableProjects": true,
  - "durationFormat": "FULL",
  - "entityCreationPermissions": {
    - "whoCanCreateProjectsAndClients": "EVERYONE",
    - "whoCanCreateTags": "EVERYONE",
    - "whoCanCreateTasks": "EVERYONE"
},
  - "forceDescription": true,
  - "forceProjects": true,
  - "forceTags": true,
  - "forceTasks": true,
  - "isProjectPublicByDefault": true,
  - "lockTimeEntries": "2024-02-25T23:00:00Z",
  - "lockTimeZone": "Europe/Belgrade",
  - "multiFactorEnabled": true,
  - "numberFormat": "COMMA_PERIOD",
  - "onlyAdminsCanChangeBillableStatus": true,
  - "onlyAdminsCreateProject": true,
  - "onlyAdminsCreateTag": true,
  - "onlyAdminsCreateTask": true,
  - "onlyAdminsSeeAllTimeEntries": true,
  - "onlyAdminsSeeBillableRates": true,
  - "onlyAdminsSeeDashboard": true,
  - "onlyAdminsSeePublicProjectsEntries": true,
  - "projectFavorites": true,
  - "projectGroupingLabel": "Project Label",
  - "projectPickerSpecialFilter": true,
  - "round": {
    - "minutes": "15",
    - "round": "Round to nearest"
},
  - "timeRoundingInReports": true,
  - "timeTrackingMode": "DEFAULT",
  - "trackTimeDownToSecond": true
}
}`

## [](#tag/Workspace/operation/updateUserStatus)Update user's status

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 89b687e29ae1f428e7ebe912Represents user identifier across the system. |


##### Request Body schema: application/jsonrequired


| statusrequired | string Enum: "ACTIVE" "INACTIVE" Represents membership status. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/users/{userId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/users/{userId}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "status": "ACTIVE"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "cakeOrganizationId": "67d471fb56aa9668b7bfa295",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "currencies": [
  - {
    - "code": "USD",
    - "id": "5b641568b07987035750505e",
    - "isDefault": true
}
],
- "featureSubscriptionType": "PREMIUM",
- "features": [
  - "ADD_TIME_FOR_OTHERS",
  - "ADMIN_PANEL",
  - "ALERTS",
  - "APPROVAL"
],
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "64a687e29ae1f428e7ebe303",
- "imageUrl": "[https://www.url.com/imageurl-1234567890.jpg](https://www.url.com/imageurl-1234567890.jpg)",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Cool Company",
- "subdomain": {
  - "enabled": true,
  - "name": "coolcompany"
},
- "workspaceSettings": {
  - "activeBillableHours": true,
  - "adminOnlyPages": "[\"PROJECT\",\"TEAM\",\"REPORTS\"]",
  - "automaticLock": {
    - "changeDay": "FRIDAY",
    - "dayOfMonth": 15,
    - "firstDay": "MONDAY",
    - "olderThanPeriod": "DAYS",
    - "olderThanValue": 5,
    - "type": "WEEKLY"
},
  - "canSeeTimeSheet": true,
  - "canSeeTracker": true,
  - "currencyFormat": "CURRENCY_SPACE_VALUE",
  - "defaultBillableProjects": true,
  - "durationFormat": "FULL",
  - "entityCreationPermissions": {
    - "whoCanCreateProjectsAndClients": "EVERYONE",
    - "whoCanCreateTags": "EVERYONE",
    - "whoCanCreateTasks": "EVERYONE"
},
  - "forceDescription": true,
  - "forceProjects": true,
  - "forceTags": true,
  - "forceTasks": true,
  - "isProjectPublicByDefault": true,
  - "lockTimeEntries": "2024-02-25T23:00:00Z",
  - "lockTimeZone": "Europe/Belgrade",
  - "multiFactorEnabled": true,
  - "numberFormat": "COMMA_PERIOD",
  - "onlyAdminsCanChangeBillableStatus": true,
  - "onlyAdminsCreateProject": true,
  - "onlyAdminsCreateTag": true,
  - "onlyAdminsCreateTask": true,
  - "onlyAdminsSeeAllTimeEntries": true,
  - "onlyAdminsSeeBillableRates": true,
  - "onlyAdminsSeeDashboard": true,
  - "onlyAdminsSeePublicProjectsEntries": true,
  - "projectFavorites": true,
  - "projectGroupingLabel": "Project Label",
  - "projectPickerSpecialFilter": true,
  - "round": {
    - "minutes": "15",
    - "round": "Round to nearest"
},
  - "timeRoundingInReports": true,
  - "timeTrackingMode": "DEFAULT",
  - "trackTimeDownToSecond": true
}
}`

## [](#tag/Workspace/operation/setCostRateForUser)Update user's cost rate

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 89b687e29ae1f428e7ebe912Represents user identifier across the system. |


##### Request Body schema: application/jsonrequired


| amountrequired | integer <int32> >= 0 Represents an amount as integer. |


| since | string Represents a date and time in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/users/{userId}/cost-ratehttps://api.clockify.me/api/v1/workspaces/{workspaceId}/users/{userId}/cost-rate

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "amount": 20000,
- "since": "2020-01-01T00:00:00Z"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "cakeOrganizationId": "67d471fb56aa9668b7bfa295",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "currencies": [
  - {
    - "code": "USD",
    - "id": "5b641568b07987035750505e",
    - "isDefault": true
}
],
- "featureSubscriptionType": "PREMIUM",
- "features": [
  - "ADD_TIME_FOR_OTHERS",
  - "ADMIN_PANEL",
  - "ALERTS",
  - "APPROVAL"
],
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "64a687e29ae1f428e7ebe303",
- "imageUrl": "[https://www.url.com/imageurl-1234567890.jpg](https://www.url.com/imageurl-1234567890.jpg)",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Cool Company",
- "subdomain": {
  - "enabled": true,
  - "name": "coolcompany"
},
- "workspaceSettings": {
  - "activeBillableHours": true,
  - "adminOnlyPages": "[\"PROJECT\",\"TEAM\",\"REPORTS\"]",
  - "automaticLock": {
    - "changeDay": "FRIDAY",
    - "dayOfMonth": 15,
    - "firstDay": "MONDAY",
    - "olderThanPeriod": "DAYS",
    - "olderThanValue": 5,
    - "type": "WEEKLY"
},
  - "canSeeTimeSheet": true,
  - "canSeeTracker": true,
  - "currencyFormat": "CURRENCY_SPACE_VALUE",
  - "defaultBillableProjects": true,
  - "durationFormat": "FULL",
  - "entityCreationPermissions": {
    - "whoCanCreateProjectsAndClients": "EVERYONE",
    - "whoCanCreateTags": "EVERYONE",
    - "whoCanCreateTasks": "EVERYONE"
},
  - "forceDescription": true,
  - "forceProjects": true,
  - "forceTags": true,
  - "forceTasks": true,
  - "isProjectPublicByDefault": true,
  - "lockTimeEntries": "2024-02-25T23:00:00Z",
  - "lockTimeZone": "Europe/Belgrade",
  - "multiFactorEnabled": true,
  - "numberFormat": "COMMA_PERIOD",
  - "onlyAdminsCanChangeBillableStatus": true,
  - "onlyAdminsCreateProject": true,
  - "onlyAdminsCreateTag": true,
  - "onlyAdminsCreateTask": true,
  - "onlyAdminsSeeAllTimeEntries": true,
  - "onlyAdminsSeeBillableRates": true,
  - "onlyAdminsSeeDashboard": true,
  - "onlyAdminsSeePublicProjectsEntries": true,
  - "projectFavorites": true,
  - "projectGroupingLabel": "Project Label",
  - "projectPickerSpecialFilter": true,
  - "round": {
    - "minutes": "15",
    - "round": "Round to nearest"
},
  - "timeRoundingInReports": true,
  - "timeTrackingMode": "DEFAULT",
  - "trackTimeDownToSecond": true
}
}`

## [](#tag/Workspace/operation/setHourlyRateForUser)Update user's hourly rate

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 89b687e29ae1f428e7ebe912Represents user identifier across the system. |


##### Request Body schema: application/jsonrequired


| amountrequired | integer <int32> >= 0 Represents an hourly rate amount as integer. |


| since | string Represents a date and time in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/users/{userId}/hourly-ratehttps://api.clockify.me/api/v1/workspaces/{workspaceId}/users/{userId}/hourly-rate

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "amount": 20000,
- "since": "2020-01-01T00:00:00Z"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "cakeOrganizationId": "67d471fb56aa9668b7bfa295",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "currencies": [
  - {
    - "code": "USD",
    - "id": "5b641568b07987035750505e",
    - "isDefault": true
}
],
- "featureSubscriptionType": "PREMIUM",
- "features": [
  - "ADD_TIME_FOR_OTHERS",
  - "ADMIN_PANEL",
  - "ALERTS",
  - "APPROVAL"
],
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "64a687e29ae1f428e7ebe303",
- "imageUrl": "[https://www.url.com/imageurl-1234567890.jpg](https://www.url.com/imageurl-1234567890.jpg)",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Cool Company",
- "subdomain": {
  - "enabled": true,
  - "name": "coolcompany"
},
- "workspaceSettings": {
  - "activeBillableHours": true,
  - "adminOnlyPages": "[\"PROJECT\",\"TEAM\",\"REPORTS\"]",
  - "automaticLock": {
    - "changeDay": "FRIDAY",
    - "dayOfMonth": 15,
    - "firstDay": "MONDAY",
    - "olderThanPeriod": "DAYS",
    - "olderThanValue": 5,
    - "type": "WEEKLY"
},
  - "canSeeTimeSheet": true,
  - "canSeeTracker": true,
  - "currencyFormat": "CURRENCY_SPACE_VALUE",
  - "defaultBillableProjects": true,
  - "durationFormat": "FULL",
  - "entityCreationPermissions": {
    - "whoCanCreateProjectsAndClients": "EVERYONE",
    - "whoCanCreateTags": "EVERYONE",
    - "whoCanCreateTasks": "EVERYONE"
},
  - "forceDescription": true,
  - "forceProjects": true,
  - "forceTags": true,
  - "forceTasks": true,
  - "isProjectPublicByDefault": true,
  - "lockTimeEntries": "2024-02-25T23:00:00Z",
  - "lockTimeZone": "Europe/Belgrade",
  - "multiFactorEnabled": true,
  - "numberFormat": "COMMA_PERIOD",
  - "onlyAdminsCanChangeBillableStatus": true,
  - "onlyAdminsCreateProject": true,
  - "onlyAdminsCreateTag": true,
  - "onlyAdminsCreateTask": true,
  - "onlyAdminsSeeAllTimeEntries": true,
  - "onlyAdminsSeeBillableRates": true,
  - "onlyAdminsSeeDashboard": true,
  - "onlyAdminsSeePublicProjectsEntries": true,
  - "projectFavorites": true,
  - "projectGroupingLabel": "Project Label",
  - "projectPickerSpecialFilter": true,
  - "round": {
    - "minutes": "15",
    - "round": "Round to nearest"
},
  - "timeRoundingInReports": true,
  - "timeTrackingMode": "DEFAULT",
  - "trackTimeDownToSecond": true
}
}`

## [](#tag/Webhooks)Webhooks

## [](#tag/Webhooks/operation/getAddonWebhooks)Get all webhooks for addon on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents a workspace identifier across the system. |


| addonIdrequired | string Example: 64c777ddd3fcab07cfbb210cRepresents an addon identifier across the system. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/addons/{addonId}/webhookshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/addons/{addonId}/webhooks

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "webhooks": [
  - {
    - "authToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NGI3YmU3YmUwODM1Yjc2ZDYzOTY5YTciLCJtdWx0aUZhY3RvciI6dHJ1ZSwiaXNzIjoiY2xvY2tpZnkiLCJuYW1lIjoiTWFydGluIExsb3lkIiwiZXhwIjoxNjkzMzY5MzEwLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNjkzMzI2MTEwLCJqdGkiOiJZVGcxT0Raak9XTXRPRGRsWVMwME5qZ3hMVGxpTlRndE5UQmlOVEprTmpOaE",
    - "enabled": true,
    - "id": "76a687e29ae1f428e7ebe101",
    - "name": "stripe",
    - "triggerSource": [
      - "54a687e29ae1f428e7ebe909",
      - "87p187e29ae1f428e7ebej56"
],
    - "triggerSourceType": "PROJECT_ID",
    - "url": "[https://example-clockify.com/stripeEndpoint](https://example-clockify.com/stripeEndpoint)",
    - "userId": "5a0ab5acb07987125438b60f",
    - "webhookEvent": "NEW_PROJECT",
    - "workspaceId": "64a687e29ae1f428e7ebe303"
}
],
- "workspaceWebhookCount": 5
}`

## [](#tag/Webhooks/operation/getWebhooks)Get all webhooks on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents a workspace identifier across the system. |


##### query Parameters


| type | string Enum: "USER_CREATED" "SYSTEM" "ADDON" Example: type=USER_CREATEDRepresents a webhook type. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/webhookshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/webhooks

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "webhooks": [
  - {
    - "authToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NGI3YmU3YmUwODM1Yjc2ZDYzOTY5YTciLCJtdWx0aUZhY3RvciI6dHJ1ZSwiaXNzIjoiY2xvY2tpZnkiLCJuYW1lIjoiTWFydGluIExsb3lkIiwiZXhwIjoxNjkzMzY5MzEwLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNjkzMzI2MTEwLCJqdGkiOiJZVGcxT0Raak9XTXRPRGRsWVMwME5qZ3hMVGxpTlRndE5UQmlOVEprTmpOaE",
    - "enabled": true,
    - "id": "76a687e29ae1f428e7ebe101",
    - "name": "stripe",
    - "triggerSource": [
      - "54a687e29ae1f428e7ebe909",
      - "87p187e29ae1f428e7ebej56"
],
    - "triggerSourceType": "PROJECT_ID",
    - "url": "[https://example-clockify.com/stripeEndpoint](https://example-clockify.com/stripeEndpoint)",
    - "userId": "5a0ab5acb07987125438b60f",
    - "webhookEvent": "NEW_PROJECT",
    - "workspaceId": "64a687e29ae1f428e7ebe303"
}
],
- "workspaceWebhookCount": 5
}`

## [](#tag/Webhooks/operation/createWebhook)Create webhooks

Creating a webhook generates a new token which can be used to verify that the webhook being sent was sent by Clockify, as it will always be present in the header.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents a workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| name | string [ 2 .. 30 ] characters Represents a webhook name. |


| triggerSourcerequired | Array of strings Represents a list of trigger sources. |


| triggerSourceTyperequired | string Enum: "PROJECT_ID" "USER_ID" "TAG_ID" "TASK_ID" "WORKSPACE_ID" "ASSIGNMENT_ID" "EXPENSE_ID" Represents a webhook event trigger source type. |


| urlrequired | string Represents a webhook target url. |


| webhookEventrequired | string Enum: "NEW_PROJECT" "NEW_TASK" "NEW_CLIENT" "NEW_TIMER_STARTED" "TIMER_STOPPED" "TIME_ENTRY_UPDATED" "TIME_ENTRY_DELETED" "TIME_ENTRY_BATCH_DELETED" "TIME_ENTRY_SPLIT" "NEW_TIME_ENTRY" "TIME_ENTRY_RESTORED" "NEW_TAG" "USER_DELETED_FROM_WORKSPACE" "USER_JOINED_WORKSPACE" "USER_DEACTIVATED_ON_WORKSPACE" "USER_ACTIVATED_ON_WORKSPACE" "USER_EMAIL_CHANGED" "USER_UPDATED" "NEW_INVOICE" "INVOICE_UPDATED" "NEW_APPROVAL_REQUEST" "APPROVAL_REQUEST_STATUS_UPDATED" "TIME_OFF_REQUESTED" "TIME_OFF_REQUEST_APPROVED" "TIME_OFF_REQUEST_REJECTED" "TIME_OFF_REQUEST_WITHDRAWN" "BALANCE_UPDATED" "TAG_UPDATED" "TAG_DELETED" "TASK_UPDATED" "CLIENT_UPDATED" "TASK_DELETED" "CLIENT_DELETED" "EXPENSE_RESTORED" "ASSIGNMENT_CREATED" "ASSIGNMENT_DELETED" "ASSIGNMENT_PUBLISHED" "ASSIGNMENT_UPDATED" "EXPENSE_CREATED" "EXPENSE_DELETED" "EXPENSE_UPDATED" "PROJECT_UPDATED" "PROJECT_DELETED" "USER_GROUP_CREATED" "USER_GROUP_UPDATED" "USER_GROUP_DELETED" "USERS_INVITED_TO_WORKSPACE" "LIMITED_USERS_ADDED_TO_WORKSPACE" "COST_RATE_UPDATED" "BILLABLE_RATE_UPDATED" Represents a webhook event type. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/webhookshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/webhooks

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "name": "stripe",
- "triggerSource": [
  - "54a687e29ae1f428e7ebe909",
  - "87p187e29ae1f428e7ebej56"
],
- "triggerSourceType": "PROJECT_ID",
- "url": "[https://example-clockify.com/stripeEndpoint](https://example-clockify.com/stripeEndpoint)",
- "webhookEvent": "NEW_PROJECT"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "authToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NGI3YmU3YmUwODM1Yjc2ZDYzOTY5YTciLCJtdWx0aUZhY3RvciI6dHJ1ZSwiaXNzIjoiY2xvY2tpZnkiLCJuYW1lIjoiTWFydGluIExsb3lkIiwiZXhwIjoxNjkzMzY5MzEwLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNjkzMzI2MTEwLCJqdGkiOiJZVGcxT0Raak9XTXRPRGRsWVMwME5qZ3hMVGxpTlRndE5UQmlOVEprTmpOaE",
- "enabled": true,
- "id": "76a687e29ae1f428e7ebe101",
- "name": "stripe",
- "triggerSource": [
  - "54a687e29ae1f428e7ebe909",
  - "87p187e29ae1f428e7ebej56"
],
- "triggerSourceType": "PROJECT_ID",
- "url": "[https://example-clockify.com/stripeEndpoint](https://example-clockify.com/stripeEndpoint)",
- "userId": "5a0ab5acb07987125438b60f",
- "webhookEvent": "NEW_PROJECT",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Webhooks/operation/deleteWebhook)Delete webhook

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents a workspace identifier across the system. |


| webhookIdrequired | string Example: 5b715448b0798751107918abRepresents a webhook identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/webhooks/{webhookId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/webhooks/{webhookId}

## [](#tag/Webhooks/operation/getWebhook)Get a specific webhook by id

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents a workspace identifier across the system. |


| webhookIdrequired | string Example: 5b715448b0798751107918abRepresents a webhook identifier across the system. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/webhooks/{webhookId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/webhooks/{webhookId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "authToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NGI3YmU3YmUwODM1Yjc2ZDYzOTY5YTciLCJtdWx0aUZhY3RvciI6dHJ1ZSwiaXNzIjoiY2xvY2tpZnkiLCJuYW1lIjoiTWFydGluIExsb3lkIiwiZXhwIjoxNjkzMzY5MzEwLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNjkzMzI2MTEwLCJqdGkiOiJZVGcxT0Raak9XTXRPRGRsWVMwME5qZ3hMVGxpTlRndE5UQmlOVEprTmpOaE",
- "enabled": true,
- "id": "76a687e29ae1f428e7ebe101",
- "name": "stripe",
- "triggerSource": [
  - "54a687e29ae1f428e7ebe909",
  - "87p187e29ae1f428e7ebej56"
],
- "triggerSourceType": "PROJECT_ID",
- "url": "[https://example-clockify.com/stripeEndpoint](https://example-clockify.com/stripeEndpoint)",
- "userId": "5a0ab5acb07987125438b60f",
- "webhookEvent": "NEW_PROJECT",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Webhooks/operation/updateWebhook)Update a webhook

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents a workspace identifier across the system. |


| webhookIdrequired | string Example: 5b715448b0798751107918abRepresents a webhook identifier across the system. |


##### Request Body schema: application/jsonrequired


| name | string [ 2 .. 30 ] characters Represents a webhook name. |


| triggerSourcerequired | Array of strings Represents a list of trigger sources. |


| triggerSourceTyperequired | string Enum: "PROJECT_ID" "USER_ID" "TAG_ID" "TASK_ID" "WORKSPACE_ID" "ASSIGNMENT_ID" "EXPENSE_ID" Represents a webhook event trigger source type. |


| urlrequired | string Represents a workspace identifier across the system. |


| webhookEventrequired | string Enum: "NEW_PROJECT" "NEW_TASK" "NEW_CLIENT" "NEW_TIMER_STARTED" "TIMER_STOPPED" "TIME_ENTRY_UPDATED" "TIME_ENTRY_DELETED" "TIME_ENTRY_BATCH_DELETED" "TIME_ENTRY_SPLIT" "NEW_TIME_ENTRY" "TIME_ENTRY_RESTORED" "NEW_TAG" "USER_DELETED_FROM_WORKSPACE" "USER_JOINED_WORKSPACE" "USER_DEACTIVATED_ON_WORKSPACE" "USER_ACTIVATED_ON_WORKSPACE" "USER_EMAIL_CHANGED" "USER_UPDATED" "NEW_INVOICE" "INVOICE_UPDATED" "NEW_APPROVAL_REQUEST" "APPROVAL_REQUEST_STATUS_UPDATED" "TIME_OFF_REQUESTED" "TIME_OFF_REQUEST_APPROVED" "TIME_OFF_REQUEST_REJECTED" "TIME_OFF_REQUEST_WITHDRAWN" "BALANCE_UPDATED" "TAG_UPDATED" "TAG_DELETED" "TASK_UPDATED" "CLIENT_UPDATED" "TASK_DELETED" "CLIENT_DELETED" "EXPENSE_RESTORED" "ASSIGNMENT_CREATED" "ASSIGNMENT_DELETED" "ASSIGNMENT_PUBLISHED" "ASSIGNMENT_UPDATED" "EXPENSE_CREATED" "EXPENSE_DELETED" "EXPENSE_UPDATED" "PROJECT_UPDATED" "PROJECT_DELETED" "USER_GROUP_CREATED" "USER_GROUP_UPDATED" "USER_GROUP_DELETED" "USERS_INVITED_TO_WORKSPACE" "LIMITED_USERS_ADDED_TO_WORKSPACE" "COST_RATE_UPDATED" "BILLABLE_RATE_UPDATED" Represents a webhook event type. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/webhooks/{webhookId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/webhooks/{webhookId}

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "name": "Stripe",
- "triggerSource": [
  - "54a687e29ae1f428e7ebe909",
  - "87p187e29ae1f428e7ebej56"
],
- "triggerSourceType": "PROJECT_ID",
- "url": "[https://example-clockify.com/stripeEndpoint](https://example-clockify.com/stripeEndpoint)",
- "webhookEvent": "NEW_PROJECT"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "authToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NGI3YmU3YmUwODM1Yjc2ZDYzOTY5YTciLCJtdWx0aUZhY3RvciI6dHJ1ZSwiaXNzIjoiY2xvY2tpZnkiLCJuYW1lIjoiTWFydGluIExsb3lkIiwiZXhwIjoxNjkzMzY5MzEwLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNjkzMzI2MTEwLCJqdGkiOiJZVGcxT0Raak9XTXRPRGRsWVMwME5qZ3hMVGxpTlRndE5UQmlOVEprTmpOaE",
- "enabled": true,
- "id": "76a687e29ae1f428e7ebe101",
- "name": "stripe",
- "triggerSource": [
  - "54a687e29ae1f428e7ebe909",
  - "87p187e29ae1f428e7ebej56"
],
- "triggerSourceType": "PROJECT_ID",
- "url": "[https://example-clockify.com/stripeEndpoint](https://example-clockify.com/stripeEndpoint)",
- "userId": "5a0ab5acb07987125438b60f",
- "webhookEvent": "NEW_PROJECT",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Webhooks/operation/getLogsForWebhook)Get logs for a webhook

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents a workspace identifier across the system. |


| webhookIdrequired | string Represents a webhook identifier across the system. |


##### query Parameters


| page | integer <int32> Default: 0 Example: page=1Page number. |


| size | integer <int32> >= 1 Default: 50 Example: size=50Page size. |


##### Request Body schema: application/jsonrequired


| from | string <date-time> Represents date and time in yyyy-MM-ddThh:mm:ssZ format. If provided, results will include logs which occurred after this value. |


| sortByNewest | boolean If set to true, logs will be sorted with most recent first. |


| status | string Enum: "ALL" "SUCCEEDED" "FAILED" Filters logs by status. |


| to | string <date-time> Represents date and time in yyyy-MM-ddThh:mm:ssZ format. If provided, results will include logs which occurred before this value. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/webhooks/{webhookId}/logshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/webhooks/{webhookId}/logs

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "from": "2023-02-01T13:00:46Z",
- "sortByNewest": true,
- "status": "ALL",
- "to": "2023-02-05T13:00:46Z"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "id": "65e5b854fe0dfa24f1528ef0",
  - "requestBody": "{\"id\":\"65df50f5d2dd8f23a685374e\",\"name\":\"Webhook\"}",
  - "respondedAt": "2024-03-04T12:02:28.125+00:00",
  - "responseBody": "{\"id\":\"h73210f5d2dd8f23685374e\",\"response\":\"Webhook response\"}",
  - "statusCode": 200,
  - "webhookId": "65df5508d2dd8f23a68537af"
}
]`

## [](#tag/Webhooks/operation/generateNewToken)Generate new token

Generates a new webhook token and invalidates previous one


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents a workspace identifier across the system. |


| webhookIdrequired | string Example: 5b715448b0798751107918abRepresents a webhook identifier across the system. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/webhooks/{webhookId}/tokenhttps://api.clockify.me/api/v1/workspaces/{workspaceId}/webhooks/{webhookId}/token

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "authToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2NGI3YmU3YmUwODM1Yjc2ZDYzOTY5YTciLCJtdWx0aUZhY3RvciI6dHJ1ZSwiaXNzIjoiY2xvY2tpZnkiLCJuYW1lIjoiTWFydGluIExsb3lkIiwiZXhwIjoxNjkzMzY5MzEwLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNjkzMzI2MTEwLCJqdGkiOiJZVGcxT0Raak9XTXRPRGRsWVMwME5qZ3hMVGxpTlRndE5UQmlOVEprTmpOaE",
- "enabled": true,
- "id": "76a687e29ae1f428e7ebe101",
- "name": "stripe",
- "triggerSource": [
  - "54a687e29ae1f428e7ebe909",
  - "87p187e29ae1f428e7ebej56"
],
- "triggerSourceType": "PROJECT_ID",
- "url": "[https://example-clockify.com/stripeEndpoint](https://example-clockify.com/stripeEndpoint)",
- "userId": "5a0ab5acb07987125438b60f",
- "webhookEvent": "NEW_PROJECT",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Approval)Approval

## [](#tag/Approval/operation/getApprovalRequests)Get approval requests

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| status | string Enum: "PENDING" "APPROVED" "WITHDRAWN_APPROVAL" Example: status=PENDINGFilters results based from the provided approval state. |


| sort-column | string Enum: "ID" "USER_ID" "START" "UPDATED_AT" Example: sort-column=STARTRepresents the column name to be used as sorting criteria. |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGRepresents the sorting order. |


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/approval-requestshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/approval-requests

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "approvalRequest": {
    - "creator": {
      - "userEmail": "johhndoe@example.com",
      - "userId": "5a0ab5acb07987125438b60f",
      - "userName": "johhndoe"
},
    - "dateRange": {
      - "end": "2019-08-24T14:15:22Z",
      - "start": "2019-08-24T14:15:22Z"
},
    - "id": "567687e29ae1f428e7ebf564",
    - "owner": {
      - "startOfWeek": "MONDAY",
      - "timeZone": "Europe/Budapest",
      - "userId": "5a0ab5acb07987125438b60f",
      - "userName": "johndoe"
},
    - "status": {
      - "note": "This is a sample approval request note.",
      - "state": "APPROVED",
      - "updatedAt": "2020-01-01T08:00:00Z",
      - "updatedBy": "5a0ab5acb07987125438b60f",
      - "updatedByUserName": "juandelacruz"
},
    - "workspaceId": "64a687e29ae1f428e7ebe303"
},
  - "approvedTime": "PT1H30M",
  - "billableAmount": 2500,
  - "billableTime": "PT1H30M",
  - "breakTime": "PT1H30M",
  - "costAmount": 5000,
  - "entries": [
    - {
      - "approvalRequestId": "5e4117fe8c625f38930d57b7",
      - "billable": true,
      - "costRate": {
        - "amount": 10500,
        - "currency": "USD"
},
      - "customFieldValues": [
        - {
          - "customFieldId": "44a687e29ae1f428e7ebe305",
          - "sourceType": "WORKSPACE",
          - "timeEntryId": "64c777ddd3fcab07cfbb210c",
          - "value": "20231211-12345"
}
],
      - "description": "This is a sample time entry description.",
      - "hourlyRate": {
        - "amount": 10500,
        - "currency": "USD"
},
      - "id": "5b715448b0798751107918ab",
      - "isLocked": true,
      - "project": {
        - "clientId": "64c777ddd3fcab07cfbb210c",
        - "clientName": "Client X",
        - "color": "#000000",
        - "id": "5b641568b07987035750505e",
        - "name": "Software Development"
},
      - "tags": [
        - {
          - "archived": true,
          - "id": "64c777ddd3fcab07cfbb210c",
          - "name": "Sprint1",
          - "workspaceId": "64a687e29ae1f428e7ebe303"
}
],
      - "task": {
        - "id": "5b715448b0798751107918ab",
        - "name": "Bugfixing"
},
      - "timeInterval": {
        - "duration": "PT1H30M",
        - "end": "2019-08-24T14:15:22Z",
        - "offsetEnd": 0,
        - "offsetStart": 0,
        - "start": "2019-08-24T14:15:22Z",
        - "timeZone": {
          - "id": "string",
          - "rules": {
            - "fixedOffset": true,
            - "transitionRules": [
              - {
                - "dayOfMonthIndicator": 0,
                - "dayOfWeek": "MONDAY",
                - "localTime": {
                  - "hour": null,
                  - "minute": null,
                  - "nano": null,
                  - "second": null
},
                - "midnightEndOfDay": true,
                - "month": "JANUARY",
                - "offsetAfter": {
                  - "id": null,
                  - "totalSeconds": null
},
                - "offsetBefore": {
                  - "id": null,
                  - "totalSeconds": null
},
                - "standardOffset": {
                  - "id": null,
                  - "totalSeconds": null
},
                - "timeDefinition": "UTC"
}
],
            - "transitions": [
              - {
                - "dateTimeAfter": "2019-08-24T14:15:22Z",
                - "dateTimeBefore": "2019-08-24T14:15:22Z",
                - "duration": {
                  - "nano": null,
                  - "negative": null,
                  - "positive": null,
                  - "seconds": null,
                  - "units": [ ],
                  - "zero": null
},
                - "gap": true,
                - "instant": "2019-08-24T14:15:22Z",
                - "offsetAfter": {
                  - "id": null,
                  - "totalSeconds": null
},
                - "offsetBefore": {
                  - "id": null,
                  - "totalSeconds": null
},
                - "overlap": true
}
]
}
},
        - "zonedEnd": "2019-08-24T14:15:22Z",
        - "zonedStart": "2019-08-24T14:15:22Z"
},
      - "type": "REGULAR"
}
],
  - "expenseTotal": 7500,
  - "expenses": [
    - {
      - "approvalRequestId": "445687e29ae1f428e7ebe893",
      - "approvalStatus": "PENDING",
      - "billable": true,
      - "category": {
        - "archived": true,
        - "hasUnitPrice": true,
        - "id": "89a687e29ae1f428e7ebe303",
        - "name": "Procurement",
        - "priceInCents": 1000,
        - "unit": "piece",
        - "workspaceId": "64a687e29ae1f428e7ebe303"
},
      - "currency": "USD",
      - "date": "2020-01-01",
      - "fileId": "745687e29ae1f428e7ebe890",
      - "fileName": "file_12345.csv",
      - "id": "64c777ddd3fcab07cfbb210c",
      - "locked": true,
      - "notes": "This is a sample note for this expense.",
      - "project": {
        - "clientId": "64c777ddd3fcab07cfbb210c",
        - "clientName": "Client X",
        - "color": "#000000",
        - "id": "5b641568b07987035750505e",
        - "name": "Software Development"
},
      - "quantity": 0.1,
      - "task": {
        - "id": "5b715448b0798751107918ab",
        - "name": "Bugfixing"
},
      - "total": 10500.5,
      - "userId": "89b687e29ae1f428e7ebe912",
      - "workspaceId": "64a687e29ae1f428e7ebe303"
}
],
  - "pendingTime": "PT1H30M",
  - "trackedTime": "PT1H30M"
}
]`

## [](#tag/Approval/operation/createApprrovalRequest)Submit approval request

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| period | string Enum: "WEEKLY" "SEMI_MONTHLY" "MONTHLY" Specifies the approval period. It has to match the workspace approval period setting. |


| periodStartrequired | string Specifies an approval period start date in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/approval-requestshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/approval-requests

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "period": "MONTHLY",
- "periodStart": "2020-01-01T00:00:00.000Z"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "creator": {
  - "userEmail": "johhndoe@example.com",
  - "userId": "5a0ab5acb07987125438b60f",
  - "userName": "johhndoe"
},
- "dateRange": {
  - "end": "2019-08-24T14:15:22Z",
  - "start": "2019-08-24T14:15:22Z"
},
- "id": "567687e29ae1f428e7ebf564",
- "owner": {
  - "startOfWeek": "MONDAY",
  - "timeZone": "Europe/Budapest",
  - "userId": "5a0ab5acb07987125438b60f",
  - "userName": "johndoe"
},
- "status": {
  - "note": "This is a sample approval request note.",
  - "state": "APPROVED",
  - "updatedAt": "2020-01-01T08:00:00Z",
  - "updatedBy": "5a0ab5acb07987125438b60f",
  - "updatedByUserName": "juandelacruz"
},
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Approval/operation/resubmitApprovalRequest)Re-submit rejected/withdrawn entries/expenses for approval

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| period | string Enum: "WEEKLY" "SEMI_MONTHLY" "MONTHLY" Specifies the approval period. It has to match the workspace approval period setting. |


| periodStartrequired | string Specifies an approval period start date in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/approval-requests/resubmit-entries-for-approvalhttps://api.clockify.me/api/v1/workspaces/{workspaceId}/approval-requests/resubmit-entries-for-approval

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "period": "MONTHLY",
- "periodStart": "2020-01-01T00:00:00.000Z"
}`

## [](#tag/Approval/operation/createApprovalForOther)Submit approval request for user

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### Request Body schema: application/jsonrequired


| period | string Enum: "WEEKLY" "SEMI_MONTHLY" "MONTHLY" Specifies the approval period. It has to match the workspace approval period setting. |


| periodStartrequired | string Specifies an approval period start date in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/approval-requests/users/{userId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/approval-requests/users/{userId}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "period": "MONTHLY",
- "periodStart": "2020-01-01T00:00:00.000Z"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "creator": {
  - "userEmail": "johhndoe@example.com",
  - "userId": "5a0ab5acb07987125438b60f",
  - "userName": "johhndoe"
},
- "dateRange": {
  - "end": "2019-08-24T14:15:22Z",
  - "start": "2019-08-24T14:15:22Z"
},
- "id": "567687e29ae1f428e7ebf564",
- "owner": {
  - "startOfWeek": "MONDAY",
  - "timeZone": "Europe/Budapest",
  - "userId": "5a0ab5acb07987125438b60f",
  - "userName": "johndoe"
},
- "status": {
  - "note": "This is a sample approval request note.",
  - "state": "APPROVED",
  - "updatedAt": "2020-01-01T08:00:00Z",
  - "updatedBy": "5a0ab5acb07987125438b60f",
  - "updatedByUserName": "juandelacruz"
},
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Approval/operation/resubmitApprovalRequestForOther)Re-submit rejected/withdrawn entries/expenses for approval for user

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### Request Body schema: application/jsonrequired


| period | string Enum: "WEEKLY" "SEMI_MONTHLY" "MONTHLY" Specifies the approval period. It has to match the workspace approval period setting. |


| periodStartrequired | string Specifies an approval period start date in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/approval-requests/users/{userId}/resubmit-entries-for-approvalhttps://api.clockify.me/api/v1/workspaces/{workspaceId}/approval-requests/users/{userId}/resubmit-entries-for-approval

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "period": "MONTHLY",
- "periodStart": "2020-01-01T00:00:00.000Z"
}`

## [](#tag/Approval/operation/updateApprovalStatus)Update approval request

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| approvalRequestIdrequired | string Example: 940ab5acb07987125438b65yRepresents approval request identifier across the system. |


##### Request Body schema: application/jsonrequired


| note | string Additional notes for the approval request. |


| staterequired | string Enum: "PENDING" "APPROVED" "WITHDRAWN_SUBMISSION" "WITHDRAWN_APPROVAL" "REJECTED" Specifies the approval state to set. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/approval-requests/{approvalRequestId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/approval-requests/{approvalRequestId}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "note": "This is a sample note.",
- "state": "PENDING"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "creator": {
  - "userEmail": "johhndoe@example.com",
  - "userId": "5a0ab5acb07987125438b60f",
  - "userName": "johhndoe"
},
- "dateRange": {
  - "end": "2019-08-24T14:15:22Z",
  - "start": "2019-08-24T14:15:22Z"
},
- "id": "567687e29ae1f428e7ebf564",
- "owner": {
  - "startOfWeek": "MONDAY",
  - "timeZone": "Europe/Budapest",
  - "userId": "5a0ab5acb07987125438b60f",
  - "userName": "johndoe"
},
- "status": {
  - "note": "This is a sample approval request note.",
  - "state": "APPROVED",
  - "updatedAt": "2020-01-01T08:00:00Z",
  - "updatedBy": "5a0ab5acb07987125438b60f",
  - "updatedByUserName": "juandelacruz"
},
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Client)Client

## [](#tag/Client/operation/getClients)Find clients on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| name | string Example: name=Client XFilters client results that matches with the string provided in their client name. |


| sort-column | string Default: "NAME" Example: sort-column=NAMEColumn name that will be used as criteria for sorting results. |


| sort-order | string Default: "ASCENDING" Example: sort-order=ASCENDINGSorting mode |


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


| archived | boolean Filter whether to include archived clients or not. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/clientshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/clients

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "address": "Ground Floor, ABC Bldg., Palo Alto, California, USA 94020",
  - "archived": true,
  - "currencyCode": "USD",
  - "currencyId": "33t687e29ae1f428e7ebe505",
  - "email": "clientx@example.com",
  - "id": "44a687e29ae1f428e7ebe305",
  - "name": "Client X",
  - "note": "This is a sample note for the client.",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Client/operation/createClient)Add a new client

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| address | string [ 0 .. 3000 ] characters Represents client's address. |


| email | string Represents client email. |


| name | string [ 0 .. 100 ] characters Represents client name. |


| note | string [ 0 .. 3000 ] characters Represents additional notes for the client. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/clientshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/clients

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "address": "Ground Floor, ABC Bldg., Palo Alto, California, USA 94020",
- "email": "clientx@example.com",
- "name": "Client X",
- "note": "This is a sample note for the client."
}`

###  Response samples
- 201
Content typeapplication/jsonCopy`{
- "address": "Ground Floor, ABC Bldg., Palo Alto, California, USA 94020",
- "archived": true,
- "currencyCode": "USD",
- "currencyId": "33t687e29ae1f428e7ebe505",
- "email": "clientx@example.com",
- "id": "44a687e29ae1f428e7ebe305",
- "name": "Client X",
- "note": "This is a sample note for the client.",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Client/operation/deleteClient)Delete client

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| idrequired | string Example: 44a687e29ae1f428e7ebe305Represents client identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/clients/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/clients/{id}

###  Response samples
- 200
Content typeapplication/jsonCopy`{
- "address": "Ground Floor, ABC Bldg., Palo Alto, California, USA 94020",
- "archived": true,
- "currencyId": "33t687e29ae1f428e7ebe505",
- "email": "clientx@example.com",
- "id": "44a687e29ae1f428e7ebe305",
- "name": "Client X",
- "note": "This is a sample note for the client.",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Client/operation/getClient)Get client by ID

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| idrequired | string Example: 44a687e29ae1f428e7ebe305Represents client identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/clients/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/clients/{id}

###  Response samples
- 200
Content typeapplication/jsonCopy`{
- "address": "Ground Floor, ABC Bldg., Palo Alto, California, USA 94020",
- "archived": true,
- "currencyCode": "USD",
- "currencyId": "33t687e29ae1f428e7ebe505",
- "email": "clientx@example.com",
- "id": "44a687e29ae1f428e7ebe305",
- "name": "Client X",
- "note": "This is a sample note for the client.",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Client/operation/updateClient)Update client

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| idrequired | string Example: 44a687e29ae1f428e7ebe305Represents client identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters

| archive-projects | boolean |
| mark-tasks-as-done | boolean |


##### Request Body schema: application/jsonrequired


| address | string [ 0 .. 3000 ] characters Represents client's address. |


| archived | boolean Indicates if client will be archived or not. |


| currencyId | string Represents currency identifier across the system. |


| email | string Represents client email. |


| name | string [ 0 .. 100 ] characters Represents client name. |


| note | string [ 0 .. 3000 ] characters Represents additional notes for the client. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/clients/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/clients/{id}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "address": "Ground Floor, ABC Bldg., Palo Alto, California, USA 94020",
- "archived": true,
- "currencyId": "53a687e29ae1f428e7ebe888",
- "email": "clientx@example.com",
- "name": "Client X",
- "note": "This is a sample note for the client."
}`

###  Response samples
- 200
Content typeapplication/jsonCopy`{
- "address": "Ground Floor, ABC Bldg., Palo Alto, California, USA 94020",
- "archived": true,
- "currencyId": "33t687e29ae1f428e7ebe505",
- "email": "clientx@example.com",
- "id": "44a687e29ae1f428e7ebe305",
- "name": "Client X",
- "note": "This is a sample note for the client.",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Custom-fields)Custom fields

## [](#tag/Custom-fields/operation/ofWorkspace)Get custom fields on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| name | string Example: name=locationIf provided, you'll get a filtered list of custom fields that contain the provided string in their name. |


| status | string Enum: "INACTIVE" "VISIBLE" "INVISIBLE" Example: status=VISIBLEIf provided, you'll get a filtered list of custom fields that matches the provided string with the custom field status. |


| entity-type | string Example: entity-type=TIMEENTRY&entity-type=USERIf provided, you'll get a filtered list of custom fields that matches the provided string with the custom field entity type. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/custom-fieldshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/custom-fields

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "allowedValues": [
    - "New York",
    - "London",
    - "Manila",
    - "Sydney",
    - "Belgrade"
],
  - "description": "This field contains a location.",
  - "entityType": "USER",
  - "id": "44a687e29ae1f428e7ebe305",
  - "name": "location",
  - "onlyAdminCanEdit": true,
  - "placeholder": "Location",
  - "projectDefaultValues": [
    - {
      - "projectId": "5b641568b07987035750505e",
      - "status": "VISIBLE",
      - "value": "Manila"
}
],
  - "required": true,
  - "status": "VISIBLE",
  - "type": "DROPDOWN_MULTIPLE",
  - "workspaceDefaultValue": "Manila",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Custom-fields/operation/create)Create custom fields on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| allowedValues | Array of strings Represents a list of custom field's allowed values. |


| description | string Represents custom field description. |


| entityType | string Enum: "TIMEENTRY" "USER" Represents custom field entity type |


| namerequired | string Represents custom field name. |


| onlyAdminCanEdit | boolean Flag to set whether custom field is modifiable only by admin users. |


| placeholder | string Represents custom field placeholder value. |


| status | string Enum: "INACTIVE" "VISIBLE" "INVISIBLE" Represents custom field status |


| typerequired | string Enum: "TXT" "NUMBER" "DROPDOWN_SINGLE" "DROPDOWN_MULTIPLE" "CHECKBOX" "LINK" Represents custom field type. |


| workspaceDefaultValue | object Represents a custom field's default value in the workspace.if type = NUMBER, then value must be a numberif type = DROPDOWN_MULTIPLE, value must be a listif type = CHECKBOX, value must be true/falseotherwise any string |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/custom-fieldshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/custom-fields

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowedValues": [
  - "New York",
  - "London",
  - "Manila",
  - "Sydney",
  - "Belgrade"
],
- "description": "This field contains a location.",
- "entityType": "TIMEENTRY",
- "name": "location",
- "onlyAdminCanEdit": true,
- "placeholder": "Location",
- "status": "VISIBLE",
- "type": "DROPDOWN_MULTIPLE",
- "workspaceDefaultValue": "Manila"
}`

## [](#tag/Custom-fields/operation/delete)Delete custom field

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| customFieldIdrequired | string Example: 26a687e29ae1f428e7ebe101Represents custom field identifier across the system. |


### Responses
**204 **

No Content

 delete/v1/workspaces/{workspaceId}/custom-fields/{customFieldId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/custom-fields/{customFieldId}

## [](#tag/Custom-fields/operation/editCustomField)Update custom field on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| customFieldIdrequired | string Example: 26a687e29ae1f428e7ebe101Represents custom field identifier across the system. |


##### Request Body schema: application/jsonrequired


| allowedValues | Array of strings Represents a list of custom field's allowed values. |


| description | string Represents custom field description. |


| namerequired | string [ 2 .. 250 ] characters Represents custom field name. |


| onlyAdminCanEdit | boolean Flag to set whether custom field is modifiable only by admin users. |


| placeholder | string Represents a custom field placeholder value. |


| required | boolean Flag to set whether custom field is mandatory or not. |


| status | string Enum: "INACTIVE" "VISIBLE" "INVISIBLE" Represents custom field status |


| typerequired | string Enum: "TXT" "NUMBER" "DROPDOWN_SINGLE" "DROPDOWN_MULTIPLE" "CHECKBOX" "LINK" Represents custom field type. |


| workspaceDefaultValue | object Represents a custom field's default value in the workspace. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/custom-fields/{customFieldId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/custom-fields/{customFieldId}

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowedValues": [
  - "New York",
  - "London",
  - "Manila",
  - "Sydney",
  - "Belgrade"
],
- "description": "This field contains a location.",
- "name": "location",
- "onlyAdminCanEdit": true,
- "placeholder": "This is a sample placeholder.",
- "required": true,
- "status": "VISIBLE",
- "type": "DROPDOWN_MULTIPLE",
- "workspaceDefaultValue": "Manila"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowedValues": [
  - "New York",
  - "London",
  - "Manila",
  - "Sydney",
  - "Belgrade"
],
- "description": "This field contains a location.",
- "entityType": "USER",
- "id": "44a687e29ae1f428e7ebe305",
- "name": "location",
- "onlyAdminCanEdit": true,
- "placeholder": "Location",
- "projectDefaultValues": [
  - {
    - "projectId": "5b641568b07987035750505e",
    - "status": "VISIBLE",
    - "value": "Manila"
}
],
- "required": true,
- "status": "VISIBLE",
- "type": "DROPDOWN_MULTIPLE",
- "workspaceDefaultValue": "Manila",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Custom-fields/operation/getCustomFieldsOfProject)Get custom fields on project

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 5b641568b07987035750505eRepresents project identifier across the system. |


##### query Parameters


| status | string Enum: "INACTIVE" "VISIBLE" "INVISIBLE" Example: status=INACTIVEIf provided, you'll get a filtered list of custom fields that matches the provided string with the custom field status. |


| entity-type | string Example: entity-type=TIMEENTRYIf provided, you'll get a filtered list of custom fields that matches the provided string with the custom field entity type. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/projects/{projectId}/custom-fieldshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/custom-fields

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "allowedValues": [
    - "New York",
    - "London",
    - "Manila",
    - "Sydney",
    - "Belgrade"
],
  - "description": "This field contains a location.",
  - "entityType": "USER",
  - "id": "44a687e29ae1f428e7ebe305",
  - "name": "location",
  - "onlyAdminCanEdit": true,
  - "placeholder": "Location",
  - "projectDefaultValues": [
    - {
      - "projectId": "5b641568b07987035750505e",
      - "status": "VISIBLE",
      - "value": "Manila"
}
],
  - "required": true,
  - "status": "VISIBLE",
  - "type": "DROPDOWN_MULTIPLE",
  - "workspaceDefaultValue": "Manila",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Custom-fields/operation/removeDefaultValueOfProject)Remove custom field from project

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents project identifier across the system. |


| customFieldIdrequired | string Example: 26a687e29ae1f428e7ebe101Represents custom field identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/projects/{projectId}/custom-fields/{customFieldId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/custom-fields/{customFieldId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowedValues": [
  - "New York",
  - "London",
  - "Manila",
  - "Sydney",
  - "Belgrade"
],
- "description": "This field contains a location.",
- "entityType": "USER",
- "id": "44a687e29ae1f428e7ebe305",
- "name": "location",
- "onlyAdminCanEdit": true,
- "placeholder": "Location",
- "projectDefaultValues": [
  - {
    - "projectId": "5b641568b07987035750505e",
    - "status": "VISIBLE",
    - "value": "Manila"
}
],
- "required": true,
- "status": "VISIBLE",
- "type": "DROPDOWN_MULTIPLE",
- "workspaceDefaultValue": "Manila",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Custom-fields/operation/editProjectCustomFieldDefaultValue)Update custom field on project

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents project identifier across the system. |


| customFieldIdrequired | string Example: 26a687e29ae1f428e7ebe101Represents custom field identifier across the system. |


##### Request Body schema: application/jsonrequired


| defaultValue | object Represents a custom field's default value. |


| status | string Enum: "INACTIVE" "VISIBLE" "INVISIBLE" Represents custom field status. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/projects/{projectId}/custom-fields/{customFieldId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/custom-fields/{customFieldId}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "defaultValue": "Manila",
- "status": "VISIBLE"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowedValues": [
  - "New York",
  - "London",
  - "Manila",
  - "Sydney",
  - "Belgrade"
],
- "description": "This field contains a location.",
- "entityType": "USER",
- "id": "44a687e29ae1f428e7ebe305",
- "name": "location",
- "onlyAdminCanEdit": true,
- "placeholder": "Location",
- "projectDefaultValues": [
  - {
    - "projectId": "5b641568b07987035750505e",
    - "status": "VISIBLE",
    - "value": "Manila"
}
],
- "required": true,
- "status": "VISIBLE",
- "type": "DROPDOWN_MULTIPLE",
- "workspaceDefaultValue": "Manila",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Expense)Expense

## [](#tag/Expense/operation/getExpenses)Get all expenses on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


| user-id | string Example: user-id=5a0ab5acb07987125438b60fIf provided, you'll get a filtered list of expenses which match the provided string in the user ID linked to the expense. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/expenseshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/expenses

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "dailyTotals": [
  - {
    - "date": "2020-01-01",
    - "dateAsInstant": "2019-08-24T14:15:22Z",
    - "total": 1500.75
}
],
- "expenses": {
  - "count": 25,
  - "expenses": [
    - {
      - "billable": true,
      - "category": {
        - "archived": true,
        - "hasUnitPrice": true,
        - "id": "89a687e29ae1f428e7ebe303",
        - "name": "Procurement",
        - "priceInCents": 1000,
        - "unit": "piece",
        - "workspaceId": "64a687e29ae1f428e7ebe303"
},
      - "date": "89b687e29ae1f428e7ebe912",
      - "fileId": "745687e29ae1f428e7ebe890",
      - "fileName": "expense_20200101",
      - "id": "64c777ddd3fcab07cfbb210c",
      - "locked": true,
      - "notes": "This is a sample note for this expense.",
      - "project": {
        - "clientId": "64c777ddd3fcab07cfbb210c",
        - "clientName": "Client X",
        - "color": "#000000",
        - "id": "5b641568b07987035750505e",
        - "name": "Software Development"
},
      - "quantity": 0.1,
      - "task": {
        - "id": "5b715448b0798751107918ab",
        - "name": "Bugfixing"
},
      - "total": 10500.5,
      - "userId": "89b687e29ae1f428e7ebe912",
      - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]
},
- "weeklyTotals": [
  - {
    - "date": "2020-01-01",
    - "total": 20000.75
}
]
}`

## [](#tag/Expense/operation/createExpense)Create expense

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: multipart/form-data


| amountrequired | number <double> <= 92233720368547760 Represents expense amount as double data type. |


| billable | boolean Indicates whether expense is billable or not. |


| categoryIdrequired | string Represents category identifier across the system. |


| daterequired | string <date-time> Provides a valid yyyy-MM-ddThh:mm:ssZ format date. |
| filerequired | string <binary> |


| notes | string [ 0 .. 3000 ] characters Represents notes for an expense. |


| projectIdrequired | string Represents project identifier across the system. |


| taskId | string Represents task identifier across the system. |


| userIdrequired | string Represents user identifier across the system. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/expenseshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/expenses

###  Response samples
- 201
Content typeapplication/jsonCopy`{
- "billable": true,
- "categoryId": "45y687e29ae1f428e7ebe890",
- "date": "2020-01-01",
- "fileId": "745687e29ae1f428e7ebe890",
- "id": "64c777ddd3fcab07cfbb210c",
- "locked": true,
- "notes": "This is a sample note for this expense.",
- "projectId": "25b687e29ae1f428e7ebe123",
- "quantity": 0.1,
- "taskId": "25b687e29ae1f428e7ebe123",
- "total": 10500.5,
- "userId": "89b687e29ae1f428e7ebe912",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Expense/operation/getCategories)Get all expense categories

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| sort-column | string Value: "NAME" Example: sort-column=NAMERepresents the column name to be used as sorting criteria. |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGRepresents the sorting order. |


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


| archived | boolean Example: archived=trueFlag to filter results based on whether category is archived or not. |


| name | string Example: name=procurementIf provided, you'll get a filtered list of expense categories that matches the provided string in their name. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/expenses/categorieshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/expenses/categories

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "categories": [
  - {
    - "archived": true,
    - "hasUnitPrice": true,
    - "id": "89a687e29ae1f428e7ebe303",
    - "name": "Procurement",
    - "priceInCents": 1000,
    - "unit": "piece",
    - "workspaceId": "64a687e29ae1f428e7ebe303"
}
],
- "count": 20
}`

## [](#tag/Expense/operation/createExpenseCategory)Add expense category

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| hasUnitPrice | boolean Flag whether expense category has unit price or none. |


| namerequired | string [ 0 .. 250 ] characters Represents a valid expense category name. |


| priceInCents | integer <int32> Represents price in cents as integer. |


| unit | string Represents a valid expense category unit. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/expenses/categorieshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/expenses/categories

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "hasUnitPrice": true,
- "name": "Procurement",
- "priceInCents": 1000,
- "unit": "piece"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy`{
- "archived": true,
- "hasUnitPrice": true,
- "id": "89a687e29ae1f428e7ebe303",
- "name": "Procurement",
- "priceInCents": 1000,
- "unit": "piece",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Expense/operation/deleteCategory)Delete expense category

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| categoryIdrequired | string Example: 89a687e29ae1f428e7ebe567Represents category identifier across the system. |


### Responses
**204 **

No Content

 delete/v1/workspaces/{workspaceId}/expenses/categories/{categoryId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/expenses/categories/{categoryId}

## [](#tag/Expense/operation/updateCategory)Update expense category

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| categoryIdrequired | string Example: 89a687e29ae1f428e7ebe567Represents category identifier across the system. |


##### Request Body schema: application/jsonrequired


| hasUnitPrice | boolean Flag whether expense category has unit price or none. |


| namerequired | string [ 0 .. 250 ] characters Represents a valid expense category name. |


| priceInCents | integer <int32> Represents price in cents as integer. |


| unit | string Represents a valid expense category unit. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/expenses/categories/{categoryId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/expenses/categories/{categoryId}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "hasUnitPrice": true,
- "name": "Procurement",
- "priceInCents": 1000,
- "unit": "piece"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy`{
- "archived": true,
- "hasUnitPrice": true,
- "id": "89a687e29ae1f428e7ebe303",
- "name": "Procurement",
- "priceInCents": 1000,
- "unit": "piece",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Expense/operation/updateExpenseCategoryStatus)Archive expense category

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| categoryIdrequired | string Example: 89a687e29ae1f428e7ebe567Represents category identifier across the system. |


##### Request Body schema: application/jsonrequired


| archived | boolean Flag whether to archive the expense category or not. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/expenses/categories/{categoryId}/statushttps://api.clockify.me/api/v1/workspaces/{workspaceId}/expenses/categories/{categoryId}/status

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "archived": true
}`

###  Response samples
- 200
Content typeapplication/jsonCopy`{
- "archived": true,
- "hasUnitPrice": true,
- "id": "89a687e29ae1f428e7ebe303",
- "name": "Procurement",
- "priceInCents": 1000,
- "unit": "piece",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Expense/operation/deleteExpense)Delete expense

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| expenseIdrequired | string Example: 64c777ddd3fcab07cfbb210cRepresents expense identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/expenses/{expenseId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/expenses/{expenseId}

## [](#tag/Expense/operation/getExpense)Get expense by ID

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| expenseIdrequired | string Example: 64c777ddd3fcab07cfbb210cRepresents expense identifier across the system. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/expenses/{expenseId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/expenses/{expenseId}

###  Response samples
- 200
Content typeapplication/jsonCopy`{
- "billable": true,
- "categoryId": "45y687e29ae1f428e7ebe890",
- "date": "2020-01-01",
- "fileId": "745687e29ae1f428e7ebe890",
- "id": "64c777ddd3fcab07cfbb210c",
- "locked": true,
- "notes": "This is a sample note for this expense.",
- "projectId": "25b687e29ae1f428e7ebe123",
- "quantity": 0.1,
- "taskId": "25b687e29ae1f428e7ebe123",
- "total": 10500.5,
- "userId": "89b687e29ae1f428e7ebe912",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Expense/operation/updateExpense)Update expense

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| expenseIdrequired | string Example: 64c777ddd3fcab07cfbb210cRepresents expense identifier across the system. |


##### Request Body schema: multipart/form-data


| amountrequired | number <double> [ 0 .. 92233720368547760 ] Represents expense amount as double data type. |


| billable | boolean Indicates whether expense is billable or not. |


| categoryIdrequired | string Represents category identifier across the system. |


| changeFieldsrequired | Array of stringsItems Enum: "USER" "DATE" "PROJECT" "TASK" "CATEGORY" "NOTES" "AMOUNT" "BILLABLE" "FILE" Represents a list of expense change fields. |


| daterequired | string <date-time> Provides a valid yyyy-MM-ddThh:mm:ssZ format date. |
| filerequired | string <binary> |


| notes | string [ 0 .. 3000 ] characters Represents notes for an expense. |


| projectId | string Represents project identifier across the system. |


| taskId | string Represents task identifier across the system. |


| userIdrequired | string Represents user identifier across the system. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/expenses/{expenseId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/expenses/{expenseId}

###  Response samples
- 200
Content typeapplication/jsonCopy`{
- "billable": true,
- "categoryId": "45y687e29ae1f428e7ebe890",
- "date": "2020-01-01",
- "fileId": "745687e29ae1f428e7ebe890",
- "id": "64c777ddd3fcab07cfbb210c",
- "locked": true,
- "notes": "This is a sample note for this expense.",
- "projectId": "25b687e29ae1f428e7ebe123",
- "quantity": 0.1,
- "taskId": "25b687e29ae1f428e7ebe123",
- "total": 10500.5,
- "userId": "89b687e29ae1f428e7ebe912",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Expense/operation/downloadFile)Download receipt

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| fileIdrequired | string Example: 745687e29ae1f428e7ebe890Represents file identifier across the system. |


| expenseIdrequired | string Example: 64c777ddd3fcab07cfbb210cRepresents expense identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/expenses/{expenseId}/files/{fileId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/expenses/{expenseId}/files/{fileId}

## [](#tag/Holiday)Holiday

## [](#tag/Holiday/operation/getHolidays)Get holidays on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


##### query Parameters


| assigned-to | string Example: assigned-to=60f924bafdaf031696ec6218If provided, you'll get a filtered list of holidays assigned to user. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/holidayshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/holidays

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "automaticTimeEntryCreation": false,
  - "datePeriod": {
    - "endDate": "2019-08-24",
    - "startDate": "2019-08-24"
},
  - "everyoneIncludingNew": false,
  - "id": "5b715612b079875110791111",
  - "name": "New Year's Day",
  - "occursAnnually": true,
  - "projectId": "65b36d3c525e243c48f9150f",
  - "taskId": "65b36d46fa3df8607e42d21a",
  - "userGroupIds": [
    - "5b715612b079875110791342",
    - "5b715612b079875110791324",
    - "5b715612b079875110793142"
],
  - "userIds": [
    - "5b715612b079875110791432",
    - "5b715612b079875110791234"
],
  - "workspaceId": "5b715612b079875110792222"
}
]`

## [](#tag/Holiday/operation/createHoliday)Create holiday

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| automaticTimeEntryCreation | object (AutomaticTimeEntryCreationRequest) Provides automatic time entry creation settings. |


| color | string^#(?:[0-9a-fA-F]{6}){1}$ Provide color in format ^#(?:[0-9a-fA-F]{6}){1}$. Explanation: A valid color code should start with '#' and consist of six hexadecimal characters, representing a color in hexadecimal format. Color value is in standard RGB hexadecimal format. |


| datePeriodrequired | object (DatePeriodRequest) Provide startDate and endDate for the holiday. |


| everyoneIncludingNew | boolean Indicates whether the holiday is shown to new users. |


| namerequired | string [ 2 .. 100 ] characters Provide the name of the holiday. |


| occursAnnually | boolean Indicates whether the holiday occurs annually. |


| userGroups | object (UserGroupIdsSchema) Provide list with user group ids and corresponding status. |


| users | object (UserIdsSchema) Provide list with user ids and corresponding status. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/holidayshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/holidays

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "color": "#8BC34A",
- "datePeriod": {
  - "endDate": "2023-02-16",
  - "startDate": "2023-02-14"
},
- "everyoneIncludingNew": true,
- "name": "Labour Day",
- "occursAnnually": true,
- "userGroups": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715612b079875110791111",
    - "5b715612b079875110791222"
],
  - "status": "ALL"
},
- "users": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715612b079875110791111",
    - "5b715612b079875110791222"
],
  - "status": "ALL"
}
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "automaticTimeEntryCreation": false,
- "datePeriod": {
  - "endDate": "2019-08-24",
  - "startDate": "2019-08-24"
},
- "everyoneIncludingNew": false,
- "id": "5b715612b079875110791111",
- "name": "New Year's Day",
- "occursAnnually": true,
- "projectId": "65b36d3c525e243c48f9150f",
- "taskId": "65b36d46fa3df8607e42d21a",
- "userGroupIds": [
  - "5b715612b079875110791342",
  - "5b715612b079875110791324",
  - "5b715612b079875110793142"
],
- "userIds": [
  - "5b715612b079875110791432",
  - "5b715612b079875110791234"
],
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Holiday/operation/getHolidaysInPeriod)Get holiday in specific period

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


##### query Parameters


| assigned-torequired | string Example: assigned-to=60f924bafdaf031696ec6218If provided, you'll get a filtered list of holidays assigned to user. |


| startrequired | string Example: start=2022-12-03If provided, you'll get a filtered list of holidays starting from start date. Expected date format yyyy-mm-dd |


| endrequired | string Example: end=2022-12-05If provided, you'll get a filtered list of holidays ending by end date. Expected date format yyyy-mm-dd |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/holidays/in-periodhttps://api.clockify.me/api/v1/workspaces/{workspaceId}/holidays/in-period

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "automaticTimeEntryCreation": false,
  - "datePeriod": {
    - "endDate": "2019-08-24",
    - "startDate": "2019-08-24"
},
  - "everyoneIncludingNew": false,
  - "id": "5b715612b079875110791111",
  - "name": "New Year's Day",
  - "occursAnnually": true,
  - "projectId": "65b36d3c525e243c48f9150f",
  - "taskId": "65b36d46fa3df8607e42d21a",
  - "userGroupIds": [
    - "5b715612b079875110791342",
    - "5b715612b079875110791324",
    - "5b715612b079875110793142"
],
  - "userIds": [
    - "5b715612b079875110791432",
    - "5b715612b079875110791234"
],
  - "workspaceId": "5b715612b079875110792222"
}
]`

## [](#tag/Holiday/operation/deleteHoliday)Delete holiday

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| holidayIdrequired | string Example: 60f927920658241e3cf35e02Represents holiday identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/holidays/{holidayId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/holidays/{holidayId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "color": "#8BC34A",
- "datePeriod": {
  - "endDate": "2019-08-24",
  - "startDate": "2019-08-24"
},
- "everyoneIncludingNew": false,
- "id": "5b715612b079875110791111",
- "name": "New Year's Day",
- "occursAnnually": true,
- "userGroupIds": [
  - "5b715612b079875110791342",
  - "5b715612b079875110791324",
  - "5b715612b079875110793142"
],
- "userIds": [
  - "5b715612b079875110791432",
  - "5b715612b079875110791234"
],
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Holiday/operation/updateHoliday)Update holiday

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| holidayIdrequired | string Example: 60f927920658241e3cf35e02Represents holiday identifier across the system. |


##### Request Body schema: application/jsonrequired


| automaticTimeEntryCreation | object (AutomaticTimeEntryCreationRequest) Provides automatic time entry creation settings. |


| color | string^#(?:[0-9a-fA-F]{6}){1}$ Provide color in format ^#(?:[0-9a-fA-F]{6}){1}$. Explanation: A valid color code should start with '#' and consist of six hexadecimal characters, representing a color in hexadecimal format. Color value is in standard RGB hexadecimal format. |


| datePeriodrequired | object (DatePeriodRequest) Provide startDate and endDate for the holiday. |


| everyoneIncludingNew | boolean Indicates whether the holiday is shown to new users. |


| namerequired | string Provide the name you would like to use for updating the holiday. |


| occursAnnuallyrequired | boolean Indicates whether the holiday occurs annually. |


| userGroups | object (ContainsUserGroupFilterRequest) Provide list with user group ids and corresponding status. |


| users | object (ContainsUsersFilterRequestForHoliday) Provide list with users ids and corresponding status. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/holidays/{holidayId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/holidays/{holidayId}

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "color": "#8BC34A",
- "datePeriod": {
  - "endDate": "2023-02-16",
  - "startDate": "2023-02-14"
},
- "everyoneIncludingNew": false,
- "name": "New Year's Day",
- "occursAnnually": true,
- "userGroups": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5a0ab5acb07987125438b60f",
    - "64c777ddd3fcab07cfbb210c"
],
  - "status": "ACTIVE"
},
- "users": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5a0ab5acb07987125438b60f",
    - "64c777ddd3fcab07cfbb210c"
],
  - "status": "ACTIVE",
  - "statuses": [
    - "string"
]
}
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "automaticTimeEntryCreation": false,
- "datePeriod": {
  - "endDate": "2019-08-24",
  - "startDate": "2019-08-24"
},
- "everyoneIncludingNew": false,
- "id": "5b715612b079875110791111",
- "name": "New Year's Day",
- "occursAnnually": true,
- "projectId": "65b36d3c525e243c48f9150f",
- "taskId": "65b36d46fa3df8607e42d21a",
- "userGroupIds": [
  - "5b715612b079875110791342",
  - "5b715612b079875110791324",
  - "5b715612b079875110793142"
],
- "userIds": [
  - "5b715612b079875110791432",
  - "5b715612b079875110791234"
],
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Invoice)Invoice

## [](#tag/Invoice/operation/getInvoices)Get all invoices on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


| statuses | string Enum: "UNSENT" "SENT" "PAID" "PARTIALLY_PAID" "VOID" "OVERDUE" Example: statuses=UNSENT&statuses=PAIDIf provided, you'll get a filtered result of invoices that matches the provided string in the user ID linked to the expense. |


| sort-column | string Enum: "ID" "CLIENT" "DUE_ON" "ISSUE_DATE" "AMOUNT" "BALANCE" Example: sort-column=CLIENTValid column name as sorting criteria. Default: ID |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGSort order. Default: ASCENDING |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/invoiceshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "invoices": [
  - {
    - "amount": 100,
    - "balance": 50,
    - "clientId": "98h687e29ae1f428e7ebe707",
    - "clientName": "Client X",
    - "currency": "USD",
    - "dueDate": "2020-06-01T08:00:00Z",
    - "id": "78a687e29ae1f428e7ebe303",
    - "issuedDate": "2020-01-01T08:00:00Z",
    - "number": "202306121129",
    - "paid": 50,
    - "status": "PAID"
}
],
- "total": 100
}`

## [](#tag/Invoice/operation/createInvoice)Add invoice

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| clientIdrequired | string Represents client identifier across the system. |


| currencyrequired | string Represents the currency used by the invoice. |


| dueDaterequired | string <date-time> Represents an invoice due date in yyyy-MM-ddThh:mm:ssZ format. |


| issuedDaterequired | string <date-time> Represents an invoice issued date in yyyy-MM-ddThh:mm:ssZ format. |


| numberrequired | string Represents an invoice number. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/invoiceshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "clientId": "98h687e29ae1f428e7ebe707",
- "currency": "USD",
- "dueDate": "2020-06-01T08:00:00Z",
- "issuedDate": "2020-01-01T08:00:00Z",
- "number": "202306121129"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy`{
- "billFrom": "Business X",
- "clientId": "34p687e29ae1f428e7ebe562",
- "currency": "USD",
- "dueDate": "2020-06-01T08:00:00Z",
- "id": "78a687e29ae1f428e7ebe303",
- "issuedDate": "2020-01-01T08:00:00Z",
- "number": "202306121129"
}`

## [](#tag/Invoice/operation/getInvoicesInfo)Filter out invoices

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| clients | object (ContainsArchivedFilterRequest) Represents a client filter object. If provided, you'll get a filtered list of invoices that matches the specified client filter. |


| companies | object (BaseFilterRequest) Represents a company filter object. If provided, you'll get a filtered list of invoices that matches the specified company filter. |


| exactAmount | integer <int64> Represents an invoice amount. If provided, you'll get a filtered list of invoices that has the equal amount as specified. |


| exactBalance | integer <int64> Represents an invoice balance. If provided, you'll get a filtered list of invoices that has the equal balance as specified. |


| greaterThanAmount | integer <int64> Represents an invoice amount. If provided, you'll get a filtered list of invoices that has amount greater than specified. |


| greaterThanBalance | integer <int64> Represents an invoice balance. If provided, you'll get a filtered list of invoices that has balance greater than specified. |


| invoiceNumber | string If provided, you'll get a filtered list of invoices that contain the provided string in their invoice number. |


| issueDate | object (TimeRangeRequestDtoV1) Represents a time range object. If provided, you'll get a filtered list of invoices that has issue date within the time range specified. |


| lessThanAmount | integer <int64> Represents an invoice amount. If provided, you'll get a filtered list of invoices that has amount less than specified. |


| lessThanBalance | integer <int64> Represents an invoice balance. If provided, you'll get a filtered list of invoices that has balance less than specified. |


| pagerequired | integer <int32> Page number. |


| pageSizerequired | integer <int32> Page size. |


| sortColumn | string Enum: "ID" "CLIENT" "DUE_ON" "ISSUE_DATE" "AMOUNT" "BALANCE" Represents the column name to be used as sorting criteria. |


| sortOrder | string Enum: "ASCENDING" "DESCENDING" Represents the sorting order. |


| statuses | Array of stringsItems Enum: "UNSENT" "SENT" "PAID" "PARTIALLY_PAID" "VOID" "OVERDUE" Represents a list of invoice statuses. If provided, you'll get a filtered list of invoices that matches any of the invoice status provided. |


| strictSearch | boolean Flag to toggle on/off strict search mode. When set to true, search by invoice number only will return invoices whose number exactly matches the string value given for the 'invoiceNumber' parameter. When set to false, results will also include invoices whose number contain the string value, but could be longer than the string value itself. For example, if there is an invoice with the number '123456', and the search value is '123', setting strict-name-search to true will not return that invoice in the results, whereas setting it to false will. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/invoices/infohttps://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices/info

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "clients": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5a0ab5acb07987125438b60f",
    - "64c777ddd3fcab07cfbb210c"
],
  - "status": "ACTIVE"
},
- "companies": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5a0ab5acb07987125438b60f",
    - "64c777ddd3fcab07cfbb210c"
]
},
- "exactAmount": 1000,
- "exactBalance": 1000,
- "greaterThanAmount": 500,
- "greaterThanBalance": 500,
- "invoiceNumber": "Invoice-01",
- "issueDate": {
  - "issue-date-end": "2020-01-01",
  - "issue-date-start": "2020-01-01"
},
- "lessThanAmount": 500,
- "lessThanBalance": 500,
- "page": 1,
- "pageSize": 50,
- "sortColumn": "ID",
- "sortOrder": "ASCENDING",
- "statuses": [
  - "SENT",
  - "PAID",
  - "PARTIALLY_PAID"
],
- "strictSearch": true
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "invoices": [
  - {
    - "amount": 100,
    - "balance": 50,
    - "billFrom": "Company XYZ",
    - "clientId": "98h687e29ae1f428e7ebe707",
    - "clientName": "Client X",
    - "currency": "USD",
    - "daysOverdue": 10,
    - "dueDate": "2020-06-01T08:00:00Z",
    - "id": "78a687e29ae1f428e7ebe303",
    - "issuedDate": "2020-01-01T08:00:00Z",
    - "number": "202306121129",
    - "paid": 50,
    - "status": "PAID",
    - "visibleZeroFields": [
      - "TAX",
      - "TAX_2",
      - "DISCOUNT"
]
}
],
- "total": 100
}`

## [](#tag/Invoice/operation/getInvoiceSettings)Get invoice in another language

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/invoices/settingshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices/settings

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "defaults": {
  - "companyId": "34a687e29ae1f428e7ebe101",
  - "defaultImportExpenseItemTypeId": "88a687e29ae1f428e7ebe303",
  - "defaultImportTimeItemTypeId": "18a687e29ae1f428e7ebe303",
  - "dueDays": 2,
  - "itemTypeId": "78a687e29ae1f428e7ebe303",
  - "notes": "This is a sample note for this invoice.",
  - "subject": "January salary",
  - "tax": 0,
  - "tax2": 0,
  - "tax2Percent": 1,
  - "taxPercent": 5,
  - "taxType": "COMPOUND"
},
- "exportFields": {
  - "itemType": true,
  - "quantity": true,
  - "rtl": true,
  - "tax": true,
  - "tax2": true,
  - "unitPrice": true
},
- "labels": {
  - "amount": "1000",
  - "billFrom": "Entity A",
  - "billTo": "Entity B",
  - "description": "This is a sample description for this invoice.",
  - "discount": "0",
  - "dueDate": "2020-01-01",
  - "issueDate": "2020-01-01",
  - "itemType": "Service",
  - "notes": "This is a sample note for this invoice.",
  - "paid": "1000",
  - "quantity": "10",
  - "subtotal": "1000",
  - "tax": "10",
  - "tax2": "0",
  - "total": "1010",
  - "totalAmount": "1010",
  - "unitPrice": "100"
}
}`

## [](#tag/Invoice/operation/updateInvoiceSettings)Change invoice language

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| defaults | object (InvoiceDefaultSettingsRequestV1) Represents an invoice default settings object. |


| exportFields | object (InvoiceExportFieldsRequest) Represents an invoice export fields object. |


| labelsrequired | object (LabelsCustomizationRequest) Represents a label customization object. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/invoices/settingshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices/settings

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "defaults": {
  - "companyId": "34a687e29ae1f428e7ebe101",
  - "dueDays": 2,
  - "itemTypeId": "78a687e29ae1f428e7ebe303",
  - "notes": "This is a sample note for this invoice.",
  - "subject": "January salary",
  - "tax2Percent": 5,
  - "taxPercent": 5,
  - "taxType": "COMPOUND"
},
- "exportFields": {
  - "itemType": true,
  - "quantity": true,
  - "rtl": true,
  - "tax": true,
  - "tax2": true,
  - "unitPrice": true
},
- "labels": {
  - "amount": "AMOUNT",
  - "billFrom": "BILL FROM",
  - "billTo": "BILL TO",
  - "description": "DESCRIPTION",
  - "discount": "DISCOUNT",
  - "dueDate": "DUE DATE",
  - "issueDate": "ISSUE DATE",
  - "itemType": "ITEM TYPE",
  - "notes": "NOTES",
  - "paid": "PAID",
  - "quantity": "QUANTITY",
  - "subtotal": "SUBTOTAL",
  - "tax": "TAX",
  - "tax2": "TAX2",
  - "total": "AMOUNT",
  - "totalAmountDue": "TOTAL AMOUNT DUE",
  - "unitPrice": "UNIT PRICE"
}
}`

## [](#tag/Invoice/operation/deleteInvoice)Delete invoice

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| invoiceIdrequired | string Example: 78a687e29ae1f428e7ebe303Represents invoice identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/invoices/{invoiceId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices/{invoiceId}

## [](#tag/Invoice/operation/getInvoice)Get invoice by ID

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| invoiceIdrequired | string Example: 83q687e29ae1f428e7ebe195Represents invoice identifier across the system. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/invoices/{invoiceId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices/{invoiceId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "amount": 100,
- "balance": 50,
- "billFrom": "Business X",
- "clientAddress": "Ground Floor, ABC Bldg., Palo Alto, California, USA 94020",
- "clientId": "98h687e29ae1f428e7ebe707",
- "clientName": "Client X",
- "companyId": "04g687e29ae1f428e7ebe123",
- "containsImportedExpenses": true,
- "containsImportedTimes": true,
- "currency": "USD",
- "discount": 10.5,
- "discountAmount": 11,
- "dueDate": "2020-06-01T08:00:00Z",
- "id": "78a687e29ae1f428e7ebe303",
- "issuedDate": "2020-01-01T08:00:00Z",
- "items": [
  - {
    - "amount": 5000,
    - "applyTaxes": "TAX1TAX2",
    - "description": "This is a description of an invoice item.",
    - "itemType": "Goods",
    - "order": 100,
    - "quantity": 10,
    - "timeEntryIds": [
      - "5b715448b0798751107918ab",
      - "5b641568b07987035750505e"
],
    - "unitPrice": 500
}
],
- "note": "This is a sample note for this invoice.",
- "number": "202306121129",
- "paid": 50,
- "status": "PAID",
- "subject": "January salary",
- "subtotal": 5000,
- "tax": 1.5,
- "tax2": 0,
- "tax2Amount": 0,
- "taxAmount": 1,
- "taxType": "SIMPLE",
- "userId": "12t687e29ae1f428e7ebe202",
- "visibleZeroFields": [
  - "TAX",
  - "TAX_2",
  - "DISCOUNT"
]
}`

## [](#tag/Invoice/operation/updateInvoice)Send invoice

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| invoiceIdrequired | string Example: 78a687e29ae1f428e7ebe303Represents invoice identifier across the system. |


##### Request Body schema: application/jsonrequired


| clientId | string Represents client identifier across the system. |


| companyId | string Represents company identifier across the system. |


| currencyrequired | string [ 1 .. 100 ] characters Represents the currency used by the invoice. |


| discountPercentrequired | number <double> Represents an invoice discount percent as double. |


| dueDaterequired | string <date-time> Represents an invoice due date in yyyy-MM-ddThh:mm:ssZ format. |


| issuedDaterequired | string <date-time> Represents an invoice issued date in yyyy-MM-ddThh:mm:ssZ format. |


| note | string Represents an invoice note. |


| numberrequired | string Represents an invoice number. |


| subject | string Represents an invoice subject. |


| tax2Percentrequired | number <double> Represents an invoice tax 2 percent as double. |


| taxPercentrequired | number <double> Represents an invoice tax percent as double. |


| taxType | object (TaxType) Represents an invoice taxation type. |


| visibleZeroFields | string Enum: "TAX" "TAX_2" "DISCOUNT" Represents a list of zero value invoice fields that will be visible. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/invoices/{invoiceId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices/{invoiceId}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "clientId": "98h687e29ae1f428e7ebe707",
- "companyId": "04g687e29ae1f428e7ebe123",
- "currency": "USD",
- "discountPercent": 1.5,
- "dueDate": "2020-06-01T08:00:00Z",
- "issuedDate": "2020-01-01T08:00:00Z",
- "note": "This is a sample note for this invoice.",
- "number": "202306121129",
- "subject": "January salary",
- "tax2Percent": 0,
- "taxPercent": 0.5,
- "taxType": "SIMPLE",
- "visibleZeroFields": "[\"TAX\",\"TAX_2\",\"DISCOUNT\"]"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "amount": 100,
- "balance": 50,
- "billFrom": "Business X",
- "clientAddress": "Ground Floor, ABC Bldg., Palo Alto, California, USA 94020",
- "clientId": "98h687e29ae1f428e7ebe707",
- "clientName": "Client X",
- "companyId": "04g687e29ae1f428e7ebe123",
- "containsImportedExpenses": true,
- "containsImportedTimes": true,
- "currency": "USD",
- "discount": 10.5,
- "discountAmount": 11,
- "dueDate": "2020-06-01T08:00:00Z",
- "id": "78a687e29ae1f428e7ebe303",
- "issuedDate": "2020-01-01T08:00:00Z",
- "items": [
  - {
    - "amount": 5000,
    - "applyTaxes": "TAX1TAX2",
    - "description": "This is a description of an invoice item.",
    - "itemType": "Goods",
    - "order": 100,
    - "quantity": 10,
    - "timeEntryIds": [
      - "5b715448b0798751107918ab",
      - "5b641568b07987035750505e"
],
    - "unitPrice": 500
}
],
- "note": "This is a sample note for this invoice.",
- "number": "202306121129",
- "paid": 50,
- "status": "PAID",
- "subject": "January salary",
- "subtotal": 5000,
- "tax": 1.5,
- "tax2": 0,
- "tax2Amount": 0,
- "taxAmount": 1,
- "taxType": "SIMPLE",
- "userId": "12t687e29ae1f428e7ebe202",
- "visibleZeroFields": [
  - "TAX",
  - "TAX_2",
  - "DISCOUNT"
]
}`

## [](#tag/Invoice/operation/duplicateInvoice)Duplicate invoice

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| invoiceIdrequired | string Example: 78a687e29ae1f428e7ebe303Represents invoice identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/invoices/{invoiceId}/duplicatehttps://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices/{invoiceId}/duplicate

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "amount": 100,
- "balance": 50,
- "billFrom": "Business X",
- "clientAddress": "Ground Floor, ABC Bldg., Palo Alto, California, USA 94020",
- "clientId": "98h687e29ae1f428e7ebe707",
- "clientName": "Client X",
- "companyId": "04g687e29ae1f428e7ebe123",
- "containsImportedExpenses": true,
- "containsImportedTimes": true,
- "currency": "USD",
- "discount": 10.5,
- "discountAmount": 11,
- "dueDate": "2020-06-01T08:00:00Z",
- "id": "78a687e29ae1f428e7ebe303",
- "issuedDate": "2020-01-01T08:00:00Z",
- "items": [
  - {
    - "amount": 5000,
    - "applyTaxes": "TAX1TAX2",
    - "description": "This is a description of an invoice item.",
    - "itemType": "Goods",
    - "order": 100,
    - "quantity": 10,
    - "timeEntryIds": [
      - "5b715448b0798751107918ab",
      - "5b641568b07987035750505e"
],
    - "unitPrice": 500
}
],
- "note": "This is a sample note for this invoice.",
- "number": "202306121129",
- "paid": 50,
- "status": "PAID",
- "subject": "January salary",
- "subtotal": 5000,
- "tax": 1.5,
- "tax2": 0,
- "tax2Amount": 0,
- "taxAmount": 1,
- "taxType": "SIMPLE",
- "userId": "12t687e29ae1f428e7ebe202",
- "visibleZeroFields": [
  - "TAX",
  - "TAX_2",
  - "DISCOUNT"
]
}`

## [](#tag/Invoice/operation/exportInvoice)Export invoice

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| invoiceIdrequired | string Example: 78a687e29ae1f428e7ebe303Represents invoice identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| userLocalerequired | string Example: userLocale=enRepresents a locale. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/invoices/{invoiceId}/exporthttps://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices/{invoiceId}/export

## [](#tag/Invoice/operation/getPaymentsForInvoice)Get payments for invoice

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| invoiceIdrequired | string Example: 78a687e29ae1f428e7ebe303Represents invoice identifier across the system. |


##### query Parameters


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/invoices/{invoiceId}/paymentshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices/{invoiceId}/payments

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "amount": 100,
  - "author": "John Doe",
  - "date": "2021-01-01T12:00:00Z",
  - "id": "78a687e29ae1f428e7ebe303",
  - "note": "This is a sample note for this invoice payment."
}
]`

## [](#tag/Invoice/operation/createInvoicePayment)Add payment to invoice

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| invoiceIdrequired | string Example: 78a687e29ae1f428e7ebe303Represents invoice identifier across the system. |


##### Request Body schema: application/jsonrequired


| amount | integer <int64> >= 1 Represents an invoice payment amount as long. |


| note | string [ 0 .. 1000 ] characters Represents an invoice payment note. |


| paymentDate | string Represents an invoice payment date in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/invoices/{invoiceId}/paymentshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices/{invoiceId}/payments

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "amount": 100,
- "note": "This is a sample note for this invoice payment.",
- "paymentDate": "2021-01-01T12:00:00Z"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "amount": 100,
- "balance": 50,
- "billFrom": "Business X",
- "clientAddress": "Ground Floor, ABC Bldg., Palo Alto, California, USA 94020",
- "clientId": "98h687e29ae1f428e7ebe707",
- "clientName": "Client X",
- "companyId": "04g687e29ae1f428e7ebe123",
- "containsImportedExpenses": true,
- "containsImportedTimes": true,
- "currency": "USD",
- "discount": 10.5,
- "discountAmount": 11,
- "dueDate": "2020-06-01T08:00:00Z",
- "id": "78a687e29ae1f428e7ebe303",
- "issuedDate": "2020-01-01T08:00:00Z",
- "items": [
  - {
    - "amount": 5000,
    - "applyTaxes": "TAX1TAX2",
    - "description": "This is a description of an invoice item.",
    - "itemType": "Goods",
    - "order": 100,
    - "quantity": 10,
    - "timeEntryIds": [
      - "5b715448b0798751107918ab",
      - "5b641568b07987035750505e"
],
    - "unitPrice": 500
}
],
- "note": "This is a sample note for this invoice.",
- "number": "202306121129",
- "paid": 50,
- "status": "PAID",
- "subject": "January salary",
- "subtotal": 5000,
- "tax": 1.5,
- "tax2": 0,
- "tax2Amount": 0,
- "taxAmount": 1,
- "taxType": "SIMPLE",
- "userId": "12t687e29ae1f428e7ebe202",
- "visibleZeroFields": [
  - "TAX",
  - "TAX_2",
  - "DISCOUNT"
]
}`

## [](#tag/Invoice/operation/deletePaymentById)Delete payment from invoice

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| invoiceIdrequired | string Example: 78a687e29ae1f428e7ebe303Represents invoice identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| paymentIdrequired | string Example: 56p687e29ae1f428e7ebe456Represents payment identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/invoices/{invoiceId}/payments/{paymentId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices/{invoiceId}/payments/{paymentId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "amount": 100,
- "balance": 50,
- "billFrom": "Business X",
- "clientAddress": "Ground Floor, ABC Bldg., Palo Alto, California, USA 94020",
- "clientId": "98h687e29ae1f428e7ebe707",
- "clientName": "Client X",
- "companyId": "04g687e29ae1f428e7ebe123",
- "containsImportedExpenses": true,
- "containsImportedTimes": true,
- "currency": "USD",
- "discount": 10.5,
- "discountAmount": 11,
- "dueDate": "2020-06-01T08:00:00Z",
- "id": "78a687e29ae1f428e7ebe303",
- "issuedDate": "2020-01-01T08:00:00Z",
- "items": [
  - {
    - "amount": 5000,
    - "applyTaxes": "TAX1TAX2",
    - "description": "This is a description of an invoice item.",
    - "itemType": "Goods",
    - "order": 100,
    - "quantity": 10,
    - "timeEntryIds": [
      - "5b715448b0798751107918ab",
      - "5b641568b07987035750505e"
],
    - "unitPrice": 500
}
],
- "note": "This is a sample note for this invoice.",
- "number": "202306121129",
- "paid": 50,
- "status": "PAID",
- "subject": "January salary",
- "subtotal": 5000,
- "tax": 1.5,
- "tax2": 0,
- "tax2Amount": 0,
- "taxAmount": 1,
- "taxType": "SIMPLE",
- "userId": "12t687e29ae1f428e7ebe202",
- "visibleZeroFields": [
  - "TAX",
  - "TAX_2",
  - "DISCOUNT"
]
}`

## [](#tag/Invoice/operation/changeInvoiceStatus)Change invoice status

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| invoiceIdrequired | string Example: 78a687e29ae1f428e7ebe303Represents invoice identifier across the system. |


##### Request Body schema: application/jsonrequired


| invoiceStatus | string Enum: "UNSENT" "SENT" "PAID" "PARTIALLY_PAID" "VOID" "OVERDUE" Represents the invoice status to be set. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/invoices/{invoiceId}/statushttps://api.clockify.me/api/v1/workspaces/{workspaceId}/invoices/{invoiceId}/status

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "invoiceStatus": "PAID"
}`

## [](#tag/Project)Project

## [](#tag/Project/operation/getProjects)Get all projects on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| name | string Example: name=Software DevelopmentIf provided, you'll get a filtered list of projects that contains the provided string in the project name. |


| strict-name-search | boolean Flag to toggle on/off strict search mode. When set to true, search by name will only return projects whose name exactly matches the string value given for the 'name' parameter. When set to false, results will also include projects whose name contain the string value, but could be longer than the string value itself. For example, if there is a project with the name 'applications', and the search value is 'app', setting strict-name-search to true will not return that project in the results, whereas setting it to false will. |


| archived | boolean If provided and set to true, you'll only get archived projects. If omitted, you'll get both archived and non-archived projects. |


| billable | boolean If provided and set to true, you'll only get billable projects. If omitted, you'll get both billable and non-billable projects. |


| clients | Array of strings unique Example: clients=5a0ab5acb07987125438b60f&clients=64c777ddd3fcab07cfbb210cIf provided, you'll get a filtered list of projects that contain clients which match any of the provided ids. |


| contains-client | boolean Default: true If set to true, you'll get a filtered list of projects that contain clients which match the provided id(s) in 'clients' field. If set to false, you'll get a filtered list of projects which do NOT contain clients that match the provided id(s) in 'clients' field. |


| client-status | string Enum: "ACTIVE" "ARCHIVED" "ALL" Example: client-status=ACTIVEFilters projects based on client status provided. |


| users | Array of strings unique Example: users=5a0ab5acb07987125438b60f&users=64c777ddd3fcab07cfbb210cIf provided, you'll get a filtered list of projects that contain users which match any of the provided ids. |


| contains-user | boolean Default: true If set to true, you'll get a filtered list of projects that contain users which match the provided id(s) in 'users' field. If set to false, you'll get a filtered list of projects which do NOT contain users which match the provided id(s) in 'users' field. |


| user-status | string Enum: "PENDING" "ACTIVE" "DECLINED" "INACTIVE" "ALL" Example: user-status=ALLFilters projects based on user status provided. |


| is-template | boolean Filters projects based on whether they are used as a template or not. |


| sort-column | string Enum: "ID" "NAME" "CLIENT_NAME" "DURATION" "BUDGET" "PROGRESS" Example: sort-column=NAMESorts the results by the given column/field. |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGSorting mode. |


| hydrated | boolean Default: false If set to true, results will contain additional information about the project. |


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


| access | string Enum: "PUBLIC" "PRIVATE" Example: access=PUBLICValid set of string(s). If provided, you'll get a filtered list of projects that matches the provided access. |


| expense-limit | integer <int32> Default: 20 Example: expense-limit=10Represents maximum number of expenses to fetch. |


| expense-date | string Example: expense-date=2024-12-31If provided, you will get expenses dated before the provided value in yyyy-MM-dd format. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/projectshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/projects

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "color": "#000000",
  - "duration": "60000",
  - "id": "5b641568b07987035750505e",
  - "memberships": [
    - {
      - "costRate": {
        - "amount": 10500,
        - "currency": "USD"
},
      - "hourlyRate": {
        - "amount": 10500,
        - "currency": "USD"
},
      - "membershipStatus": "PENDING",
      - "membershipType": "PROJECT",
      - "targetId": "64c777ddd3fcab07cfbb210c",
      - "userId": "5a0ab5acb07987125438b60f"
}
],
  - "name": "Software Development",
  - "note": "This is a sample note for the project.",
  - "public": true,
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Project/operation/createNewProject)Add a new project

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| billable | boolean Indicates whether project is billable or not. |


| clientId | string Represents client identifier across the system. |


| color | string^#(?:[0-9a-fA-F]{6}){1}$ Color format ^#(?:[0-9a-fA-F]{6}){1}$. Explanation: A valid color code should start with '#' and consist of six hexadecimal characters, representing a color in hexadecimal format. Color value is in standard RGB hexadecimal format. |
| costRate | object (CostRateRequestV1) |


| estimate | object (EstimateRequest) Represents an estimate request object. |
| hourlyRate | object (HourlyRateRequestV1) |


| isPublic | boolean Indicates whether project is public or not. |


| memberships | Array of objects (MembershipRequest) Represents a list of membership request objects. |


| name | string [ 2 .. 250 ] characters Represents a project name. |


| note | string <= 16384 characters Represents project note. |


| tasks | Array of objects (TaskRequest) Represents a list of task request objects. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/projectshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/projects

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "billable": true,
- "clientId": "9t641568b07987035750704",
- "color": "#000000",
- "costRate": {
  - "amount": 20000,
  - "since": "2020-01-01T00:00:00Z"
},
- "estimate": {
  - "estimate": "PT1H30M",
  - "type": "AUTO"
},
- "hourlyRate": {
  - "amount": 20000,
  - "since": "2020-01-01T00:00:00Z"
},
- "isPublic": true,
- "memberships": [
  - {
    - "hourlyRate": {
      - "amount": 20000,
      - "since": "2020-01-01T00:00:00Z"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "userId": "12t687e29ae1f428e7ebe202"
}
],
- "name": "Software Development",
- "note": "This is a sample note for the project.",
- "tasks": [
  - {
    - "assigneeId": "string",
    - "assigneeIds": [
      - "45b687e29ae1f428e7ebe123",
      - "67s687e29ae1f428e7ebe678"
],
    - "billable": true,
    - "budgetEstimate": 10000,
    - "costRate": {
      - "amount": 2000,
      - "since": "2020-01-01T00:00:00Z",
      - "sinceAsInstant": "2019-08-24T14:15:22Z"
},
    - "estimate": "PT1H30M",
    - "hourlyRate": {
      - "amount": 20000,
      - "since": "2020-01-01T00:00:00Z"
},
    - "id": "57a687e29ae1f428e7ebe107",
    - "name": "Bugfixing",
    - "projectId": "5b641568b07987035750505e",
    - "status": "DONE",
    - "userGroupIds": [
      - "67b687e29ae1f428e7ebe123",
      - "12s687e29ae1f428e7ebe678"
]
}
]
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "archived": true,
- "billable": true,
- "budgetEstimate": {
  - "active": true,
  - "estimate": 600000,
  - "includeExpenses": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "clientId": "9t641568b07987035750704",
- "clientName": "Client X",
- "color": "#000000",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "60000",
- "estimate": {
  - "estimate": "PT1H30M",
  - "type": "AUTO"
},
- "estimateReset": {
  - "dayOfMonth": 0,
  - "dayOfWeek": "MONDAY",
  - "hour": 0,
  - "interval": "WEEKLY",
  - "month": "JANUARY"
},
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "5b641568b07987035750505e",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Software Development",
- "note": "This is a sample note for the project.",
- "public": true,
- "template": true,
- "timeEstimate": {
  - "active": true,
  - "estimate": "60000",
  - "includeNonBillable": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Project/operation/deleteProject)Delete project from workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 5b641568b07987035750505eRepresents project identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/projects/{projectId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "archived": true,
- "billable": true,
- "budgetEstimate": {
  - "active": true,
  - "estimate": 600000,
  - "includeExpenses": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "clientId": "9t641568b07987035750704",
- "clientName": "Client X",
- "color": "#000000",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "60000",
- "estimate": {
  - "estimate": "PT1H30M",
  - "type": "AUTO"
},
- "estimateReset": {
  - "dayOfMonth": 0,
  - "dayOfWeek": "MONDAY",
  - "hour": 0,
  - "interval": "WEEKLY",
  - "month": "JANUARY"
},
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "5b641568b07987035750505e",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Software Development",
- "note": "This is a sample note for the project.",
- "public": true,
- "template": true,
- "timeEstimate": {
  - "active": true,
  - "estimate": "60000",
  - "includeNonBillable": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Project/operation/getProject)Find project by ID

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 5b641568b07987035750505eRepresents project identifier across the system. |


##### query Parameters


| hydrated | boolean Default: false If set to true, results will contain additional information about the project |


| custom-field-entity-type | string Default: "TIMEENTRY" Example: custom-field-entity-type=TIMEENTRYIf provided, you'll get a filtered list of custom fields that matches the provided string with the custom field entity type. |


| expense-limit | integer <int32> Default: 20 Example: expense-limit=10Represents maximum number of expenses to fetch. |


| expense-date | string Example: expense-date=2024-12-31If provided, you will get expenses dated before the provided value in yyyy-MM-dd format. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/projects/{projectId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "color": "#000000",
- "duration": "60000",
- "id": "5b641568b07987035750505e",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Software Development",
- "note": "This is a sample note for the project.",
- "public": true,
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Project/operation/updateProject)Update project on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 5b641568b07987035750505eRepresents project identifier across the system. |


##### Request Body schema: application/jsonrequired


| archived | boolean Indicates whether project is archived or not. |


| billable | boolean Indicates whether project is billable or not. |


| clientId | string Represents client identifier across the system. |


| color | string^#(?:[0-9a-fA-F]{6}){1}$ Color format ^#(?:[0-9a-fA-F]{6}){1}$. Explanation: A valid color code should start with '#' and consist of six hexadecimal characters, representing a color in hexadecimal format. Color value is in standard RGB hexadecimal format. |
| costRate | object (CostRateRequestV1) |
| hourlyRate | object (HourlyRateRequestV1) |


| isPublic | boolean Indicates whether project is public or not. |


| name | string [ 2 .. 250 ] characters Represents a project name. |


| note | string <= 16384 characters Represents project note. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/projects/{projectId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "archived": true,
- "billable": true,
- "clientId": "9t641568b07987035750704",
- "color": "#000000",
- "costRate": {
  - "amount": 20000,
  - "since": "2020-01-01T00:00:00Z"
},
- "hourlyRate": {
  - "amount": 20000,
  - "since": "2020-01-01T00:00:00Z"
},
- "isPublic": true,
- "name": "Software Development",
- "note": "This is a sample note for the project."
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "archived": true,
- "billable": true,
- "budgetEstimate": {
  - "active": true,
  - "estimate": 600000,
  - "includeExpenses": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "clientId": "9t641568b07987035750704",
- "clientName": "Client X",
- "color": "#000000",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "60000",
- "estimate": {
  - "estimate": "PT1H30M",
  - "type": "AUTO"
},
- "estimateReset": {
  - "dayOfMonth": 0,
  - "dayOfWeek": "MONDAY",
  - "hour": 0,
  - "interval": "WEEKLY",
  - "month": "JANUARY"
},
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "5b641568b07987035750505e",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Software Development",
- "note": "This is a sample note for the project.",
- "public": true,
- "template": true,
- "timeEstimate": {
  - "active": true,
  - "estimate": "60000",
  - "includeNonBillable": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Project/operation/updateEstimate)Update project estimate

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 5b641568b07987035750505eRepresents project identifier across the system. |


##### Request Body schema: application/jsonrequired


| budgetEstimate | object (EstimateWithOptionsRequest) Represents estimate with options request object. |


| estimateReset | object (EstimateResetRequest) Represents estimate reset request object. |


| timeEstimate | object (TimeEstimateRequest) Represents project time estimate request object. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/projects/{projectId}/estimatehttps://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/estimate

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "budgetEstimate": {
  - "active": true,
  - "estimate": 10000,
  - "includeExpenses": true,
  - "resetOption": "MONTHLY",
  - "type": "AUTO"
},
- "estimateReset": {
  - "active": true,
  - "dayOfMonth": 20,
  - "dayOfWeek": "MONDAY",
  - "hour": 15,
  - "interval": "MONTHLY",
  - "isActive": true,
  - "month": "FEBRUARY"
},
- "timeEstimate": {
  - "active": true,
  - "estimate": "PT1H30M",
  - "includeNonBillable": true,
  - "resetOption": "MONTHLY",
  - "type": "AUTO"
}
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "archived": true,
- "billable": true,
- "budgetEstimate": {
  - "active": true,
  - "estimate": 600000,
  - "includeExpenses": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "clientId": "9t641568b07987035750704",
- "clientName": "Client X",
- "color": "#000000",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "60000",
- "estimate": {
  - "estimate": "PT1H30M",
  - "type": "AUTO"
},
- "estimateReset": {
  - "dayOfMonth": 0,
  - "dayOfWeek": "MONDAY",
  - "hour": 0,
  - "interval": "WEEKLY",
  - "month": "JANUARY"
},
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "5b641568b07987035750505e",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Software Development",
- "note": "This is a sample note for the project.",
- "public": true,
- "template": true,
- "timeEstimate": {
  - "active": true,
  - "estimate": "60000",
  - "includeNonBillable": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Project/operation/updateMemberships)Update project memberships

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 5b641568b07987035750505eRepresents project identifier across the system. |


##### Request Body schema: application/jsonrequired


| membershipsrequired | Array of objects (UserIdWithRatesRequest) Represents a list of users with id and rates request objects. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/projects/{projectId}/membershipshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/memberships

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "memberships": [
  - {
    - "costRate": {
      - "amount": 20000,
      - "since": "2020-01-01T00:00:00Z"
},
    - "hourlyRate": {
      - "amount": 20000,
      - "since": "2020-01-01T00:00:00Z"
},
    - "userId": "12t687e29ae1f428e7ebe202"
}
]
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "archived": true,
- "billable": true,
- "budgetEstimate": {
  - "active": true,
  - "estimate": 600000,
  - "includeExpenses": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "clientId": "9t641568b07987035750704",
- "clientName": "Client X",
- "color": "#000000",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "60000",
- "estimate": {
  - "estimate": "PT1H30M",
  - "type": "AUTO"
},
- "estimateReset": {
  - "dayOfMonth": 0,
  - "dayOfWeek": "MONDAY",
  - "hour": 0,
  - "interval": "WEEKLY",
  - "month": "JANUARY"
},
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "5b641568b07987035750505e",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Software Development",
- "note": "This is a sample note for the project.",
- "public": true,
- "template": true,
- "timeEstimate": {
  - "active": true,
  - "estimate": "60000",
  - "includeNonBillable": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Project/operation/addUsersToProject)Assign/remove users to/from the project

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 5b641568b07987035750505eRepresents project identifier across the system. |


##### Request Body schema: application/jsonrequired


| remove | boolean Default: false Setting this flag to 'true' will remove the given users from the project. |


| userIds | Array of strings Represents array of user ids which should be added/removed. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/projects/{projectId}/membershipshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/memberships

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "remove": false,
- "userIds": [
  - "45b687e29ae1f428e7ebe123",
  - "67s687e29ae1f428e7ebe678"
]
}`

## [](#tag/Project/operation/updateIsProjectTemplate)Update project template

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 5b641568b07987035750505eRepresents project identifier across the system. |


##### Request Body schema: application/jsonrequired


| isTemplate | boolean Indicates whether project is a template or not. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/projects/{projectId}/templatehttps://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/template

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "isTemplate": true
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "archived": true,
- "billable": true,
- "budgetEstimate": {
  - "active": true,
  - "estimate": 600000,
  - "includeExpenses": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "clientId": "9t641568b07987035750704",
- "clientName": "Client X",
- "color": "#000000",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "60000",
- "estimate": {
  - "estimate": "PT1H30M",
  - "type": "AUTO"
},
- "estimateReset": {
  - "dayOfMonth": 0,
  - "dayOfWeek": "MONDAY",
  - "hour": 0,
  - "interval": "WEEKLY",
  - "month": "JANUARY"
},
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "5b641568b07987035750505e",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Software Development",
- "note": "This is a sample note for the project.",
- "public": true,
- "template": true,
- "timeEstimate": {
  - "active": true,
  - "estimate": "60000",
  - "includeNonBillable": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Project/operation/addUsersCostRate)Update project user cost rate

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 5b641568b07987035750505eRepresents project identifier across the system. |


| userIdrequired | string Example: 4a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### Request Body schema: application/jsonrequired


| amountrequired | integer <int32> >= 0 Represents an amount as integer. |


| since | string Represents a date and time in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/projects/{projectId}/users/{userId}/cost-ratehttps://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/users/{userId}/cost-rate

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "amount": 20000,
- "since": "2020-01-01T00:00:00Z"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "archived": true,
- "billable": true,
- "budgetEstimate": {
  - "active": true,
  - "estimate": 600000,
  - "includeExpenses": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "clientId": "9t641568b07987035750704",
- "clientName": "Client X",
- "color": "#000000",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "60000",
- "estimate": {
  - "estimate": "PT1H30M",
  - "type": "AUTO"
},
- "estimateReset": {
  - "dayOfMonth": 0,
  - "dayOfWeek": "MONDAY",
  - "hour": 0,
  - "interval": "WEEKLY",
  - "month": "JANUARY"
},
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "5b641568b07987035750505e",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Software Development",
- "note": "This is a sample note for the project.",
- "public": true,
- "template": true,
- "timeEstimate": {
  - "active": true,
  - "estimate": "60000",
  - "includeNonBillable": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Project/operation/addUsersHourlyRate)Update project user billable rate

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 5b641568b07987035750505eRepresents project identifier across the system. |


| userIdrequired | string Example: 4a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### Request Body schema: application/jsonrequired


| amountrequired | integer <int32> >= 0 Represents an amount as integer. |


| since | string Represents a date and time in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/projects/{projectId}/users/{userId}/hourly-ratehttps://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/users/{userId}/hourly-rate

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "amount": 20000,
- "since": "2020-01-01T00:00:00Z"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "archived": true,
- "billable": true,
- "budgetEstimate": {
  - "active": true,
  - "estimate": 600000,
  - "includeExpenses": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "clientId": "9t641568b07987035750704",
- "clientName": "Client X",
- "color": "#000000",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "60000",
- "estimate": {
  - "estimate": "PT1H30M",
  - "type": "AUTO"
},
- "estimateReset": {
  - "dayOfMonth": 0,
  - "dayOfWeek": "MONDAY",
  - "hour": 0,
  - "interval": "WEEKLY",
  - "month": "JANUARY"
},
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "5b641568b07987035750505e",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Software Development",
- "note": "This is a sample note for the project.",
- "public": true,
- "template": true,
- "timeEstimate": {
  - "active": true,
  - "estimate": "60000",
  - "includeNonBillable": true,
  - "resetOption": "WEEKLY",
  - "type": "AUTO"
},
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Task)Task

## [](#tag/Task/operation/getTasks)Find tasks on project

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| projectIdrequired | string Example: 25b687e29ae1f428e7ebe123Represents project identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| name | string Example: name=BugfixingIf provided, you'll get a filtered list of tasks that matches the provided string in their name. |


| strict-name-search | boolean Flag to toggle on/off strict search mode. When set to true, search by name only will return tasks whose name exactly matches the string value given for the 'name' parameter. When set to false, results will also include tasks whose name contain the string value, but could be longer than the string value itself. For example, if there is a task with the name 'applications', and the search value is 'app', setting strict-name-search to true will not return that task in the results, whereas setting it to false will. |


| is-active | boolean Filters search results whether task is active or not. |


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


| sort-column | string Enum: "ID" "NAME" Example: sort-column=IDRepresents the column as criteria for sorting tasks. |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGSorting mode. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/projects/{projectId}/taskshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/tasks

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "assigneeId": "string",
  - "assigneeIds": [
    - "45b687e29ae1f428e7ebe123",
    - "67s687e29ae1f428e7ebe678"
],
  - "billable": true,
  - "budgetEstimate": 10000,
  - "costRate": {
    - "amount": 10500,
    - "currency": "USD"
},
  - "duration": "PT1H30M",
  - "estimate": "PT1H30M",
  - "hourlyRate": {
    - "amount": 10500,
    - "currency": "USD"
},
  - "id": "57a687e29ae1f428e7ebe107",
  - "name": "Bugfixing",
  - "projectId": "25b687e29ae1f428e7ebe123",
  - "status": "DONE",
  - "userGroupIds": [
    - "67b687e29ae1f428e7ebe123",
    - "12s687e29ae1f428e7ebe678"
]
}
]`

## [](#tag/Task/operation/createTask)Add a new task on project

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| projectIdrequired | string Example: 25b687e29ae1f428e7ebe123Represents project identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| contains-assignee | boolean Default: true Flag to set whether task will have assignee or none. |


##### Request Body schema: application/jsonrequired

| assigneeId | string Deprecated |


| assigneeIds | Array of strings unique Represents list of assignee ids for the task. |


| budgetEstimate | integer <int64> >= 0 Represents a task budget estimate as long. |


| estimate | string Represents a task duration estimate in ISO-8601 format. |


| id | string Represents task identifier across the system. |


| namerequired | string [ 1 .. 1000 ] characters Represents task name. |


| status | string Enum: "ACTIVE" "DONE" "ALL" Represents task status. |


| userGroupIds | Array of strings unique Represents list of user group ids for the task. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/projects/{projectId}/taskshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/tasks

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "assigneeId": "string",
- "assigneeIds": [
  - "45b687e29ae1f428e7ebe123",
  - "67s687e29ae1f428e7ebe678"
],
- "budgetEstimate": 10000,
- "estimate": "PT1H30M",
- "id": "57a687e29ae1f428e7ebe107",
- "name": "Bugfixing",
- "status": "DONE",
- "userGroupIds": [
  - "67b687e29ae1f428e7ebe123",
  - "12s687e29ae1f428e7ebe678"
]
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "assigneeId": "string",
- "assigneeIds": [
  - "45b687e29ae1f428e7ebe123",
  - "67s687e29ae1f428e7ebe678"
],
- "billable": true,
- "budgetEstimate": 10000,
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "PT1H30M",
- "estimate": "PT1H30M",
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "57a687e29ae1f428e7ebe107",
- "name": "Bugfixing",
- "projectId": "25b687e29ae1f428e7ebe123",
- "status": "DONE",
- "userGroupIds": [
  - "67b687e29ae1f428e7ebe123",
  - "12s687e29ae1f428e7ebe678"
]
}`

## [](#tag/Task/operation/setTaskCostRate)Update task cost rate

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| projectIdrequired | string Example: 25b687e29ae1f428e7ebe123Represents project identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| idrequired | string Example: 57a687e29ae1f428e7ebe107Represents task identifier across the system. |


##### Request Body schema: application/jsonrequired


| amountrequired | integer <int32> >= 0 Represents an amount as integer. |


| since | string Represents a date and time in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/projects/{projectId}/tasks/{id}/cost-ratehttps://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/tasks/{id}/cost-rate

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "amount": 20000,
- "since": "2020-01-01T00:00:00Z"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "assigneeId": "string",
- "assigneeIds": [
  - "45b687e29ae1f428e7ebe123",
  - "67s687e29ae1f428e7ebe678"
],
- "billable": true,
- "budgetEstimate": 10000,
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "PT1H30M",
- "estimate": "PT1H30M",
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "57a687e29ae1f428e7ebe107",
- "name": "Bugfixing",
- "projectId": "25b687e29ae1f428e7ebe123",
- "status": "DONE",
- "userGroupIds": [
  - "67b687e29ae1f428e7ebe123",
  - "12s687e29ae1f428e7ebe678"
]
}`

## [](#tag/Task/operation/setTaskHourlyRate)Update task billable rate

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| projectIdrequired | string Example: 25b687e29ae1f428e7ebe123Represents project identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| idrequired | string Example: 57a687e29ae1f428e7ebe107Represents task identifier across the system. |


##### Request Body schema: application/jsonrequired


| amountrequired | integer <int32> >= 0 Represents an hourly rate amount as integer. |


| since | string Represents a date and time in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/projects/{projectId}/tasks/{id}/hourly-ratehttps://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/tasks/{id}/hourly-rate

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "amount": 20000,
- "since": "2020-01-01T00:00:00Z"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "assigneeId": "string",
- "assigneeIds": [
  - "45b687e29ae1f428e7ebe123",
  - "67s687e29ae1f428e7ebe678"
],
- "billable": true,
- "budgetEstimate": 10000,
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "PT1H30M",
- "estimate": "PT1H30M",
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "57a687e29ae1f428e7ebe107",
- "name": "Bugfixing",
- "projectId": "25b687e29ae1f428e7ebe123",
- "status": "DONE",
- "userGroupIds": [
  - "67b687e29ae1f428e7ebe123",
  - "12s687e29ae1f428e7ebe678"
]
}`

## [](#tag/Task/operation/deleteTask)Delete task from project

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| taskIdrequired | string Example: 57a687e29ae1f428e7ebe107Represents task identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 25b687e29ae1f428e7ebe123Represents project identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "assigneeId": "string",
- "assigneeIds": [
  - "45b687e29ae1f428e7ebe123",
  - "67s687e29ae1f428e7ebe678"
],
- "billable": true,
- "budgetEstimate": 10000,
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "PT1H30M",
- "estimate": "PT1H30M",
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "57a687e29ae1f428e7ebe107",
- "name": "Bugfixing",
- "projectId": "25b687e29ae1f428e7ebe123",
- "status": "DONE",
- "userGroupIds": [
  - "67b687e29ae1f428e7ebe123",
  - "12s687e29ae1f428e7ebe678"
]
}`

## [](#tag/Task/operation/getTask)Get task by id

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| taskIdrequired | string Example: 57a687e29ae1f428e7ebe107Represents task identifier across the system. |


| projectIdrequired | string Example: 25b687e29ae1f428e7ebe123Represents project identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "assigneeId": "string",
- "assigneeIds": [
  - "45b687e29ae1f428e7ebe123",
  - "67s687e29ae1f428e7ebe678"
],
- "billable": true,
- "budgetEstimate": 10000,
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "PT1H30M",
- "estimate": "PT1H30M",
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "57a687e29ae1f428e7ebe107",
- "name": "Bugfixing",
- "projectId": "25b687e29ae1f428e7ebe123",
- "status": "DONE",
- "userGroupIds": [
  - "67b687e29ae1f428e7ebe123",
  - "12s687e29ae1f428e7ebe678"
]
}`

## [](#tag/Task/operation/updateTask)Update task on project

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| taskIdrequired | string Example: 57a687e29ae1f428e7ebe107Represents task identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 25b687e29ae1f428e7ebe123Represents project identifier across the system. |


##### query Parameters


| contains-assignee | boolean Default: true Flag to set whether task will have assignee or none. |


| membership-status | string Enum: "PENDING" "ACTIVE" "DECLINED" "INACTIVE" "ALL" Example: membership-status=ACTIVERepresents a membership status. |


##### Request Body schema: application/jsonrequired

| assigneeId | string Deprecated |


| assigneeIds | Array of strings unique Represents list of assignee ids for the task. |


| billable | boolean Indicates whether a task is billable or not. |


| budgetEstimate | integer <int64> >= 0 Represents a task budget estimate as integer. |


| estimate | string Represents a task duration estimate. |


| namerequired | string [ 1 .. 1000 ] characters Represents task name. |


| status | string Enum: "ACTIVE" "DONE" "ALL" Represents task status. |


| userGroupIds | Array of strings unique Represents list of user group ids for the task. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/projects/{projectId}/tasks/{taskId}

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "assigneeId": "string",
- "assigneeIds": [
  - "45b687e29ae1f428e7ebe123",
  - "67s687e29ae1f428e7ebe678"
],
- "billable": true,
- "budgetEstimate": 10000,
- "estimate": "PT1H30M",
- "name": "Bugfixing",
- "status": "DONE",
- "userGroupIds": [
  - "67b687e29ae1f428e7ebe123",
  - "12s687e29ae1f428e7ebe678"
]
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "assigneeId": "string",
- "assigneeIds": [
  - "45b687e29ae1f428e7ebe123",
  - "67s687e29ae1f428e7ebe678"
],
- "billable": true,
- "budgetEstimate": 10000,
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "duration": "PT1H30M",
- "estimate": "PT1H30M",
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "57a687e29ae1f428e7ebe107",
- "name": "Bugfixing",
- "projectId": "25b687e29ae1f428e7ebe123",
- "status": "DONE",
- "userGroupIds": [
  - "67b687e29ae1f428e7ebe123",
  - "12s687e29ae1f428e7ebe678"
]
}`

## [](#tag/Scheduling)Scheduling

## [](#tag/Scheduling/operation/getAllAssignments)Get all assignments

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| name | string Default: "" Example: name=BugfixingIf provided, assignments will be filtered by name |


| startrequired | string Example: start=2020-01-01T00:00:00ZRepresents start date in yyyy-MM-ddThh:mm:ssZ format. |


| endrequired | string Example: end=2021-01-01T00:00:00ZRepresents start date in yyyy-MM-ddThh:mm:ssZ format. |


| sort-column | string Enum: "PROJECT" "USER" "ID" Example: sort-column=USERRepresents the column as the sorting criteria. |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGRepresents the sorting mode. |


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/scheduling/assignments/allhttps://api.clockify.me/api/v1/workspaces/{workspaceId}/scheduling/assignments/all

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "billable": true,
  - "clientId": "36b687e29ae1f428e7ebe109",
  - "clientName": "Software Development",
  - "hoursPerDay": 7.5,
  - "id": "74a687e29ae1f428e7ebe505",
  - "note": "This is a sample note for an assignment.",
  - "period": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
},
  - "projectArchived": true,
  - "projectBillable": true,
  - "projectColor": "#000000",
  - "projectId": "56b687e29ae1f428e7ebe504",
  - "projectName": "Software Development",
  - "startTime": "10:00:00",
  - "userId": "72k687e29ae1f428e7ebe109",
  - "userName": "John Doe",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Scheduling/operation/getFilteredProjectTotals)Get all scheduled assignments per project

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| endrequired | string <date-time> Represents end date in yyyy-MM-ddThh:mm:ssZ format. |


| page | integer <int32> Page number. |


| pageSize | integer <int32> <= 200 Page size. |


| search | string Represents term for searching projects and clients by name. |


| startrequired | string <date-time> Represents start date in yyyy-MM-ddThh:mm:ssZ format. |


| statusFilter | string Enum: "PUBLISHED" "UNPUBLISHED" "ALL" Filters assignments by status. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/scheduling/assignments/projects/totalshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/scheduling/assignments/projects/totals

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "end": "2021-01-01T00:00:00Z",
- "page": 1,
- "pageSize": 50,
- "search": "Project name",
- "start": "2020-01-01T00:00:00Z",
- "statusFilter": "PUBLISHED"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "assignments": [
    - {
      - "date": "2019-08-24T14:15:22Z",
      - "hasAssignment": true
}
],
  - "clientName": "Software Development",
  - "milestones": [
    - {
      - "date": "2020-01-01T08:00:00Z",
      - "id": "34a687e29ae1f428e7ebe303",
      - "name": "Q3",
      - "projectId": "5b641568b07987035750505e",
      - "workspaceId": "64a687e29ae1f428e7ebe303"
}
],
  - "projectArchived": true,
  - "projectBillable": true,
  - "projectColor": "#000000",
  - "projectId": "56b687e29ae1f428e7ebe504",
  - "projectName": "Software Development",
  - "totalHours": 490.5,
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Scheduling/operation/getProjectTotalsForSingleProject)Get all scheduled assignments on project

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| projectIdrequired | string Example: 56b687e29ae1f428e7ebe504Represents project identifier across the system. |


##### query Parameters


| startrequired | string Example: start=2020-01-01T00:00:00ZRepresents start date in yyyy-MM-ddThh:mm:ssZ format. |


| endrequired | string Example: end=2021-01-01T00:00:00ZRepresents end date in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/scheduling/assignments/projects/totals/{projectId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/scheduling/assignments/projects/totals/{projectId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "assignments": [
  - {
    - "date": "2019-08-24T14:15:22Z",
    - "hasAssignment": true
}
],
- "clientName": "Software Development",
- "milestones": [
  - {
    - "date": "2020-01-01T08:00:00Z",
    - "id": "34a687e29ae1f428e7ebe303",
    - "name": "Q3",
    - "projectId": "5b641568b07987035750505e",
    - "workspaceId": "64a687e29ae1f428e7ebe303"
}
],
- "projectArchived": true,
- "projectBillable": true,
- "projectColor": "#000000",
- "projectId": "56b687e29ae1f428e7ebe504",
- "projectName": "Software Development",
- "totalHours": 490.5,
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Scheduling/operation/publishAssignments)Publish assignments

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| endrequired | string Represents end date in yyyy-MM-ddThh:mm:ssZ format. |


| notifyUsers | boolean Indicates whether to notify users when assignment is published. |


| search | string Represents a search string. |


| startrequired | string Represents start date in yyyy-MM-ddThh:mm:ssZ format. |


| userFilter | object (ContainsUsersFilterRequestV1) Represents a user filter request object. |


| userGroupFilter | object (ContainsUserGroupFilterRequestV1) Represents a user group filter request object. |


| viewType | string Enum: "PROJECTS" "TEAM" "ALL" Represents view type. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/scheduling/assignments/publishhttps://api.clockify.me/api/v1/workspaces/{workspaceId}/scheduling/assignments/publish

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "end": "2021-01-01T00:00:00Z",
- "notifyUsers": true,
- "search": "search keyword",
- "start": "2020-01-01T00:00:00Z",
- "userFilter": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5a0ab5acb07987125438b60f",
    - "64c777ddd3fcab07cfbb210c"
],
  - "sourceType": "USER_GROUP",
  - "status": "ACTIVE",
  - "statuses": [
    - "PENDING",
    - "INACTIVE"
]
},
- "userGroupFilter": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5a0ab5acb07987125438b60f",
    - "64c777ddd3fcab07cfbb210c"
],
  - "status": "ACTIVE"
},
- "viewType": "PROJECTS"
}`

## [](#tag/Scheduling/operation/createRecurring)Create recurring assignment

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| billable | boolean Indicates whether assignment is billable or not. |


| endrequired | string Represents end date in yyyy-MM-ddThh:mm:ssZ format. |


| hoursPerDayrequired | number <double> Represents assignment total hours per day. |


| includeNonWorkingDays | boolean Indicates whether to include non-working days or not. |


| note | string [ 0 .. 100 ] characters Represents assignment note. |


| projectIdrequired | string Represents project identifier across the system. |
| recurringAssignment | object (RecurringAssignmentRequestV1) |


| startrequired | string Represents start date in yyyy-MM-ddThh:mm:ssZ format. |


| startTime | string Represents start time in hh:mm:ss format. |


| taskId | string Represents task identifier across the system. |


| userIdrequired | string Represents user identifier across the system. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/scheduling/assignments/recurringhttps://api.clockify.me/api/v1/workspaces/{workspaceId}/scheduling/assignments/recurring

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "billable": true,
- "end": "2021-01-01T00:00:00Z",
- "hoursPerDay": 7.5,
- "includeNonWorkingDays": true,
- "note": "This is a sample note for an assignment.",
- "projectId": "56b687e29ae1f428e7ebe504",
- "recurringAssignment": {
  - "repeat": true,
  - "weeks": 5
},
- "start": "2020-01-01T00:00:00Z",
- "startTime": "10:00:00",
- "taskId": "56b687e29ae1f428e7ebe505",
- "userId": "72k687e29ae1f428e7ebe109"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "billable": true,
  - "excludeDays": [
    - {
      - "date": "2020-01-01T08:00:00Z",
      - "type": "WEEKEND"
}
],
  - "hoursPerDay": 7.5,
  - "id": "74a687e29ae1f428e7ebe505",
  - "includeNonWorkingDays": true,
  - "note": "This is a sample note for an assignment.",
  - "period": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
},
  - "projectId": "56b687e29ae1f428e7ebe504",
  - "published": true,
  - "recurring": {
    - "repeat": true,
    - "seriesId": "64c777ddd3fcab07cfbb210c",
    - "weeks": 5
},
  - "startTime": "10:00:00",
  - "userId": "72k687e29ae1f428e7ebe109",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Scheduling/operation/deleteRRecurringAssignment)Delete recurring assignment

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| assignmentIdrequired | string Example: 5b641568b07987035750505eRepresents assignment identifier across the system. |


##### query Parameters


| seriesUpdateOption | string Enum: "THIS_ONE" "THIS_AND_FOLLOWING" "ALL" Example: seriesUpdateOption=ALLRepresents a series option. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/scheduling/assignments/recurring/{assignmentId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/scheduling/assignments/recurring/{assignmentId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "billable": true,
  - "excludeDays": [
    - {
      - "date": "2020-01-01T08:00:00Z",
      - "type": "WEEKEND"
}
],
  - "hoursPerDay": 7.5,
  - "id": "74a687e29ae1f428e7ebe505",
  - "includeNonWorkingDays": true,
  - "note": "This is a sample note for an assignment.",
  - "period": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
},
  - "projectId": "56b687e29ae1f428e7ebe504",
  - "published": true,
  - "recurring": {
    - "repeat": true,
    - "seriesId": "64c777ddd3fcab07cfbb210c",
    - "weeks": 5
},
  - "startTime": "10:00:00",
  - "userId": "72k687e29ae1f428e7ebe109",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Scheduling/operation/editRecurring)Update recurring assignment

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| assignmentIdrequired | string Example: 5b641568b07987035750505eRepresents assignment identifier across the system. |


##### Request Body schema: application/jsonrequired


| billable | boolean Indicates whether assignment is billable or not. |


| endrequired | string Represents end date in yyyy-MM-ddThh:mm:ssZ format. |


| hoursPerDay | number <double> Represents assignment total hours per day. |


| includeNonWorkingDays | boolean Indicates whether to include non-working days or not. |


| note | string [ 0 .. 100 ] characters Represents assignment note. |


| seriesUpdateOption | string Enum: "THIS_ONE" "THIS_AND_FOLLOWING" "ALL" Valid series option |


| startrequired | string Represents start date in yyyy-MM-ddThh:mm:ssZ format. |


| startTime | string Represents start time in hh:mm:ss format. |


| taskId | string Represents task identifier across the system. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/scheduling/assignments/recurring/{assignmentId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/scheduling/assignments/recurring/{assignmentId}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "billable": true,
- "end": "2021-01-01T00:00:00Z",
- "hoursPerDay": 7.5,
- "includeNonWorkingDays": true,
- "note": "This is a sample note for an assignment.",
- "seriesUpdateOption": "THIS_ONE",
- "start": "2020-01-01T00:00:00Z",
- "startTime": "10:00:00",
- "taskId": "56b687e29ae1f428e7ebe505"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "billable": true,
  - "excludeDays": [
    - {
      - "date": "2020-01-01T08:00:00Z",
      - "type": "WEEKEND"
}
],
  - "hoursPerDay": 7.5,
  - "id": "74a687e29ae1f428e7ebe505",
  - "includeNonWorkingDays": true,
  - "note": "This is a sample note for an assignment.",
  - "period": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
},
  - "projectId": "56b687e29ae1f428e7ebe504",
  - "published": true,
  - "recurring": {
    - "repeat": true,
    - "seriesId": "64c777ddd3fcab07cfbb210c",
    - "weeks": 5
},
  - "startTime": "10:00:00",
  - "userId": "72k687e29ae1f428e7ebe109",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Scheduling/operation/editRecurringPeriod)Change recurring period

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| assignmentIdrequired | string Example: 5b641568b07987035750505eRepresents assignment identifier across the system. |


##### Request Body schema: application/jsonrequired


| repeat | boolean Indicates whether assignment is recurring or not. |


| weeksrequired | integer <int32> [ 1 .. 99 ] Indicates number of weeks for assignment. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/scheduling/assignments/series/{assignmentId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/scheduling/assignments/series/{assignmentId}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "repeat": true,
- "weeks": 5
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "billable": true,
  - "excludeDays": [
    - {
      - "date": "2020-01-01T08:00:00Z",
      - "type": "WEEKEND"
}
],
  - "hoursPerDay": 7.5,
  - "id": "74a687e29ae1f428e7ebe505",
  - "includeNonWorkingDays": true,
  - "note": "This is a sample note for an assignment.",
  - "period": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
},
  - "projectId": "56b687e29ae1f428e7ebe504",
  - "published": true,
  - "recurring": {
    - "repeat": true,
    - "seriesId": "64c777ddd3fcab07cfbb210c",
    - "weeks": 5
},
  - "startTime": "10:00:00",
  - "userId": "72k687e29ae1f428e7ebe109",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Scheduling/operation/getUserTotals)Get total of users' capacity on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| endrequired | string <date-time> Represents end date in yyyy-MM-ddThh:mm:ssZ format. |


| page | integer <int32> Page number. |


| pageSize | integer <int32> <= 200 Page size. |


| search | string Represents keyword for searching users by name or email. |


| startrequired | string <date-time> Represents start date in yyyy-MM-ddThh:mm:ssZ format. |


| statusFilter | string Enum: "PUBLISHED" "UNPUBLISHED" "ALL" Filters assignments by status. |


| userFilter | object (ContainsUsersFilterRequestV1) Represents a user filter request object. |


| userGroupFilter | object (ContainsUserGroupFilterRequestV1) Represents a user group filter request object. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/scheduling/assignments/user-filter/totalshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/scheduling/assignments/user-filter/totals

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "end": "2021-01-01T00:00:00Z",
- "page": 1,
- "pageSize": 50,
- "search": "keyword",
- "start": "2020-01-01T00:00:00Z",
- "statusFilter": "PUBLISHED",
- "userFilter": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5a0ab5acb07987125438b60f",
    - "64c777ddd3fcab07cfbb210c"
],
  - "sourceType": "USER_GROUP",
  - "status": "ACTIVE",
  - "statuses": [
    - "PENDING",
    - "INACTIVE"
]
},
- "userGroupFilter": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5a0ab5acb07987125438b60f",
    - "64c777ddd3fcab07cfbb210c"
],
  - "status": "ACTIVE"
}
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "capacityPerDay": 25200,
  - "totalHoursPerDay": [
    - {
      - "date": "2019-08-24T14:15:22Z",
      - "totalHours": 0.1
}
],
  - "userId": "72k687e29ae1f428e7ebe109",
  - "userImage": "string",
  - "userName": "John Doe",
  - "userStatus": "ACTIVE",
  - "workingDays": "[\"MONDAY\",\"TUESDAY\",\"WEDNESDAY\",\"THURSDAY\",\"FRIDAY\"]",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Scheduling/operation/getUserTotalsForSingleUser)Get total capacity of a user

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### query Parameters


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


| startrequired | string Example: start=2020-01-01T00:00:00ZRepresents start date in yyyy-MM-ddThh:mm:ssZ format. |


| endrequired | string Example: end=2021-01-01T00:00:00ZRepresents end date in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/scheduling/assignments/users/{userId}/totalshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/scheduling/assignments/users/{userId}/totals

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "capacityPerDay": 25200,
- "totalHoursPerDay": [
  - {
    - "date": "2019-08-24T14:15:22Z",
    - "totalHours": 0.1
}
],
- "userId": "72k687e29ae1f428e7ebe109",
- "userImage": "string",
- "userName": "John Doe",
- "userStatus": "ACTIVE",
- "workingDays": "[\"MONDAY\",\"TUESDAY\",\"WEDNESDAY\",\"THURSDAY\",\"FRIDAY\"]",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Scheduling/operation/copyAssignment)Copy scheduled assignment

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| assignmentIdrequired | string Example: 5b641568b07987035750505eRepresents assignment identifier across the system. |


##### Request Body schema: application/jsonrequired


| seriesUpdateOption | string Enum: "THIS_ONE" "THIS_AND_FOLLOWING" "ALL" Represents series update option. |


| userIdrequired | string Represents user identifier across the system. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/scheduling/assignments/{assignmentId}/copyhttps://api.clockify.me/api/v1/workspaces/{workspaceId}/scheduling/assignments/{assignmentId}/copy

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "seriesUpdateOption": "THIS_ONE",
- "userId": "72k687e29ae1f428e7ebe109"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "billable": true,
  - "excludeDays": [
    - {
      - "date": "2020-01-01T08:00:00Z",
      - "type": "WEEKEND"
}
],
  - "hoursPerDay": 7.5,
  - "id": "74a687e29ae1f428e7ebe505",
  - "includeNonWorkingDays": true,
  - "note": "This is a sample note for an assignment.",
  - "period": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
},
  - "projectId": "56b687e29ae1f428e7ebe504",
  - "published": true,
  - "recurring": {
    - "repeat": true,
    - "seriesId": "64c777ddd3fcab07cfbb210c",
    - "weeks": 5
},
  - "startTime": "10:00:00",
  - "userId": "72k687e29ae1f428e7ebe109",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Tag)Tag

## [](#tag/Tag/operation/getTags)Find tags on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| name | string Example: name=feature_XIf provided, you'll get a filtered list of tags that matches the provided string in their name. |


| strict-name-search | boolean Flag to toggle on/off strict search mode. When set to true, search by name will only return tags whose name exactly matches the string value given for the 'name' parameter. When set to false, results will also include tags whose name contain the string value, but could be longer than the string value itself. For example, if there is a tag with the name 'applications', and the search value is 'app', setting strict-name-search to true will not return that tag in the results, whereas setting it to false will. |


| excluded-ids | string Example: excluded-ids=90p687e29ae1f428e7ebe657&excluded-ids=3r8687e29ae1f428e7eg567yRepresents a list of excluded ids |


| sort-column | string Enum: "ID" "NAME" Example: sort-column=NAMERepresents column to be used as sorting criteria. |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGRepresents sorting mode. |


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


| archived | boolean Example: archived=falseFilters the result whether tags are archived or not. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/tagshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/tags

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "archived": true,
  - "id": "21s687e29ae1f428e7ebe404",
  - "name": "Sprint1",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Tag/operation/createNewTag)Add a new tag

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| name | string [ 0 .. 100 ] characters Represents tag name. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/tagshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/tags

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "name": "Sprint1"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy`{
- "archived": true,
- "id": "21s687e29ae1f428e7ebe404",
- "name": "Sprint1",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Tag/operation/deleteTag)Delete tag

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| idrequired | string Example: 21s687e29ae1f428e7ebe404Represents tag identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/tags/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/tags/{id}

###  Response samples
- 200
Content typeapplication/jsonCopy`{
- "archived": true,
- "id": "21s687e29ae1f428e7ebe404",
- "name": "Sprint1",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Tag/operation/getTag)Get tag by ID

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| idrequired | string Example: 21s687e29ae1f428e7ebe404Represents tag identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/tags/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/tags/{id}

###  Response samples
- 200
Content typeapplication/jsonCopy`{
- "archived": true,
- "id": "21s687e29ae1f428e7ebe404",
- "name": "Sprint1",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Tag/operation/updateTag)Update tag

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| idrequired | string Example: 21s687e29ae1f428e7ebe404Represents tag identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| archived | boolean Indicates whether a tag will be archived or not. |


| name | string [ 0 .. 100 ] characters Represents tag name. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/tags/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/tags/{id}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "archived": true,
- "name": "Sprint1"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy`{
- "archived": true,
- "id": "21s687e29ae1f428e7ebe404",
- "name": "Sprint1",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Time-entry)Time entry

## [](#tag/Time-entry/operation/createTimeEntry)Add a new time entry

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| billable | boolean Indicates whether a time entry is billable or not. |


| customAttributes | Array of objects (CreateCustomAttributeRequest) [ 0 .. 10 ] items Represents a list of create custom field request objects. |


| customFields | Array of objects (UpdateCustomFieldRequest) [ 0 .. 50 ] items Represents a list of value objects for user’s custom fields. |


| description | string <= 3000 characters Represents time entry description. |


| end | string <date-time> Represents an end date in yyyy-MM-ddThh:mm:ssZ format. |


| projectId | string Represents project identifier across the system. |


| start | string <date-time> Represents a start date in yyyy-MM-ddThh:mm:ssZ format. |


| tagIds | Array of strings Represents a list of tag ids. |


| taskId | string Represents task identifier across the system. |


| type | string Enum: "REGULAR" "BREAK" Valid time entry type. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/time-entrieshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/time-entries

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "billable": true,
- "customAttributes": [
  - {
    - "name": "race",
    - "namespace": "user_info",
    - "value": "Asian"
}
],
- "customFields": [
  - {
    - "customFieldId": "5e4117fe8c625f38930d57b7",
    - "sourceType": "WORKSPACE",
    - "value": "new value"
}
],
- "description": "This is a sample time entry description.",
- "end": "2021-01-01T00:00:00Z",
- "projectId": "25b687e29ae1f428e7ebe123",
- "start": "2020-01-01T00:00:00Z",
- "tagIds": [
  - "321r77ddd3fcab07cfbb567y",
  - "44x777ddd3fcab07cfbb88f"
],
- "taskId": "54m377ddd3fcab07cfbb432w",
- "type": "REGULAR"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "billable": true,
- "customFieldValues": [
  - {
    - "customFieldId": "5e4117fe8c625f38930d57b7",
    - "name": "TIN",
    - "timeEntryId": "64c777ddd3fcab07cfbb210c",
    - "type": "WORKSPACE",
    - "value": "20231211-12345"
}
],
- "description": "This is a sample time entry description.",
- "id": "64c777ddd3fcab07cfbb210c",
- "isLocked": true,
- "kioskId": "94c777ddd3fcab07cfbb210d",
- "projectId": "25b687e29ae1f428e7ebe123",
- "tagIds": [
  - "321r77ddd3fcab07cfbb567y",
  - "44x777ddd3fcab07cfbb88f"
],
- "taskId": "54m377ddd3fcab07cfbb432w",
- "timeInterval": {
  - "duration": "8000",
  - "end": "2021-01-01T00:00:00Z",
  - "start": "2020-01-01T00:00:00Z"
},
- "type": "BREAK",
- "userId": "5a0ab5acb07987125438b60f",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Time-entry/operation/updateInvoicedStatus)Mark time entries as invoiced

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| invoicedrequired | boolean Indicates whether time entry is invoiced or not. |


| timeEntryIdsrequired | Array of objects (TimeEntryId) unique Represents a list of invoiced time entry ids |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/time-entries/invoicedhttps://api.clockify.me/api/v1/workspaces/{workspaceId}/time-entries/invoiced

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "invoiced": true,
- "timeEntryIds": [
  - "54m377ddd3fcab07cfbb432w",
  - "25b687e29ae1f428e7ebe123"
]
}`

## [](#tag/Time-entry/operation/getInProgressTimeEntries)Get all in progress time entries on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters

| workspaceIdrequired | string |


##### query Parameters

| page | integer <int32> >= 1 Default: 1 |
| page-size | integer <int32> [ 1 .. 1000 ] Default: 10 |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/time-entries/status/in-progresshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/time-entries/status/in-progress

## [](#tag/Time-entry/operation/deleteTimeEntry)Delete time entry from workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| idrequired | string Example: 64c777ddd3fcab07cfbb210cRepresents time entry identifier across the system. |


### Responses
**204 **

No Content

 delete/v1/workspaces/{workspaceId}/time-entries/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/time-entries/{id}

## [](#tag/Time-entry/operation/getTimeEntry)Get a specific time entry on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| idrequired | string Example: 64c777ddd3fcab07cfbb210cRepresents time entry identifier across the system. |


##### query Parameters


| hydrated | boolean Default: false Flag to set whether to include additional information of a time entry or not. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/time-entries/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/time-entries/{id}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "billable": true,
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "customFieldValues": [
  - {
    - "customFieldId": "5e4117fe8c625f38930d57b7",
    - "name": "TIN",
    - "timeEntryId": "64c777ddd3fcab07cfbb210c",
    - "type": "WORKSPACE",
    - "value": "20231211-12345"
}
],
- "description": "This is a sample time entry description.",
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "64c777ddd3fcab07cfbb210c",
- "isLocked": true,
- "kioskId": "94c777ddd3fcab07cfbb210d",
- "projectId": "25b687e29ae1f428e7ebe123",
- "tagIds": [
  - "321r77ddd3fcab07cfbb567y",
  - "44x777ddd3fcab07cfbb88f"
],
- "taskId": "54m377ddd3fcab07cfbb432w",
- "timeInterval": {
  - "duration": "8000",
  - "end": "2021-01-01T00:00:00Z",
  - "start": "2020-01-01T00:00:00Z"
},
- "type": "BREAK",
- "userId": "5a0ab5acb07987125438b60f",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Time-entry/operation/updateTimeEntry)Update time entry on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| idrequired | string Example: 64c777ddd3fcab07cfbb210cRepresents time entry identifier across the system. |


##### Request Body schema: application/jsonrequired


| billable | boolean Indicates whether a time entry is billable or not. |


| customFields | Array of objects (UpdateCustomFieldRequest) [ 0 .. 50 ] items Represents a list of value objects for user’s custom fields. |


| description | string [ 0 .. 3000 ] characters Represents time entry description. |


| end | string <date-time> Represents an end date in yyyy-MM-ddThh:mm:ssZ format. |


| projectId | string Represents project identifier across the system. |


| startrequired | string <date-time> Represents a start date in yyyy-MM-ddThh:mm:ssZ format. |


| tagIds | Array of strings Represents a list of tag ids. |


| taskId | string Represents task identifier across the system. |
| type | string Enum: "REGULAR" "BREAK" |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/time-entries/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/time-entries/{id}

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "billable": true,
- "customFields": [
  - {
    - "customFieldId": "5e4117fe8c625f38930d57b7",
    - "sourceType": "WORKSPACE",
    - "value": "new value"
}
],
- "description": "This is a sample time entry description.",
- "end": "2021-01-01T00:00:00Z",
- "projectId": "25b687e29ae1f428e7ebe123",
- "start": "2020-01-01T00:00:00Z",
- "tagIds": [
  - "321r77ddd3fcab07cfbb567y",
  - "44x777ddd3fcab07cfbb88f"
],
- "taskId": "54m377ddd3fcab07cfbb432w",
- "type": "REGULAR"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "billable": true,
- "customFieldValues": [
  - {
    - "customFieldId": "5e4117fe8c625f38930d57b7",
    - "name": "TIN",
    - "timeEntryId": "64c777ddd3fcab07cfbb210c",
    - "type": "WORKSPACE",
    - "value": "20231211-12345"
}
],
- "description": "This is a sample time entry description.",
- "id": "64c777ddd3fcab07cfbb210c",
- "isLocked": true,
- "kioskId": "94c777ddd3fcab07cfbb210d",
- "projectId": "25b687e29ae1f428e7ebe123",
- "tagIds": [
  - "321r77ddd3fcab07cfbb567y",
  - "44x777ddd3fcab07cfbb88f"
],
- "taskId": "54m377ddd3fcab07cfbb432w",
- "timeInterval": {
  - "duration": "8000",
  - "end": "2021-01-01T00:00:00Z",
  - "start": "2020-01-01T00:00:00Z"
},
- "type": "BREAK",
- "userId": "5a0ab5acb07987125438b60f",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Time-entry/operation/deleteMany)Delete all time entries for user on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### query Parameters


| time-entry-idsrequired | Array of strings Example: time-entry-ids=5a0ab5acb07987125438b60fRepresents a list of time entry ids to delete. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/user/{userId}/time-entrieshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/user/{userId}/time-entries

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "billable": true,
  - "customFieldValues": [
    - {
      - "customFieldId": "5e4117fe8c625f38930d57b7",
      - "name": "TIN",
      - "timeEntryId": "64c777ddd3fcab07cfbb210c",
      - "type": "WORKSPACE",
      - "value": "20231211-12345"
}
],
  - "description": "This is a sample time entry description.",
  - "id": "64c777ddd3fcab07cfbb210c",
  - "isLocked": true,
  - "kioskId": "94c777ddd3fcab07cfbb210d",
  - "projectId": "25b687e29ae1f428e7ebe123",
  - "tagIds": [
    - "321r77ddd3fcab07cfbb567y",
    - "44x777ddd3fcab07cfbb88f"
],
  - "taskId": "54m377ddd3fcab07cfbb432w",
  - "timeInterval": {
    - "duration": "8000",
    - "end": "2021-01-01T00:00:00Z",
    - "start": "2020-01-01T00:00:00Z"
},
  - "type": "BREAK",
  - "userId": "5a0ab5acb07987125438b60f",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Time-entry/operation/getTimeEntries)Get time entries for a user on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### query Parameters


| description | string Example: description=Description keywordsRepresents term for searching time entries by description. |


| start | string Example: start=2020-01-01T00:00:00ZRepresents start date in yyyy-MM-ddThh:mm:ssZ format. |


| end | string Example: end=2021-01-01T00:00:00ZRepresents end date in yyyy-MM-ddThh:mm:ssZ format. |


| project | string Example: project=5b641568b07987035750505eIf provided, you'll get a filtered list of time entries that matches the provided string in their project id. |


| task | string Example: task=64c777ddd3fcab07cfbb210cIf provided, you'll get a filtered list of time entries that matches the provided string in their task id. |


| tags | Array of strings unique Example: tags=5e4117fe8c625f38930d57b7&tags=7e4117fe8c625f38930d57b8If provided, you'll get a filtered list of time entries that matches the provided string(s) in their tag id(s). |


| project-required | boolean Flag to set whether to only get time entries which have a project. |


| task-required | boolean Flag to set whether to only get time entries which have tasks. |


| hydrated | boolean Default: false Flag to set whether to include additional information on time entries or not. |


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


| in-progress | boolean Flag to set whether to filter only in progress time entries. |


| get-week-before | string Example: get-week-before=2020-01-01T00:00:00ZValid yyyy-MM-ddThh:mm:ssZ format date. If provided, filters results within the week before the datetime provided and only those entries with assigned project or task. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/user/{userId}/time-entrieshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/user/{userId}/time-entries

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "billable": true,
  - "costRate": {
    - "amount": 10500,
    - "currency": "USD"
},
  - "customFieldValues": [
    - {
      - "customFieldId": "5e4117fe8c625f38930d57b7",
      - "name": "TIN",
      - "timeEntryId": "64c777ddd3fcab07cfbb210c",
      - "type": "WORKSPACE",
      - "value": "20231211-12345"
}
],
  - "description": "This is a sample time entry description.",
  - "hourlyRate": {
    - "amount": 10500,
    - "currency": "USD"
},
  - "id": "64c777ddd3fcab07cfbb210c",
  - "isLocked": true,
  - "kioskId": "94c777ddd3fcab07cfbb210d",
  - "projectId": "25b687e29ae1f428e7ebe123",
  - "tagIds": [
    - "321r77ddd3fcab07cfbb567y",
    - "44x777ddd3fcab07cfbb88f"
],
  - "taskId": "54m377ddd3fcab07cfbb432w",
  - "timeInterval": {
    - "duration": "8000",
    - "end": "2021-01-01T00:00:00Z",
    - "start": "2020-01-01T00:00:00Z"
},
  - "type": "BREAK",
  - "userId": "5a0ab5acb07987125438b60f",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Time-entry/operation/stopRunningTimeEntry)Stop currently running timer on workspace for user

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### Request Body schema: application/jsonrequired


| endrequired | string <date-time> Represents an end date in yyyy-MM-ddThh:mm:ssZ format. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/user/{userId}/time-entrieshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/user/{userId}/time-entries

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "end": "2021-01-01T00:00:00Z"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "billable": true,
- "customFieldValues": [
  - {
    - "customFieldId": "5e4117fe8c625f38930d57b7",
    - "name": "TIN",
    - "timeEntryId": "64c777ddd3fcab07cfbb210c",
    - "type": "WORKSPACE",
    - "value": "20231211-12345"
}
],
- "description": "This is a sample time entry description.",
- "id": "64c777ddd3fcab07cfbb210c",
- "isLocked": true,
- "kioskId": "94c777ddd3fcab07cfbb210d",
- "projectId": "25b687e29ae1f428e7ebe123",
- "tagIds": [
  - "321r77ddd3fcab07cfbb567y",
  - "44x777ddd3fcab07cfbb88f"
],
- "taskId": "54m377ddd3fcab07cfbb432w",
- "timeInterval": {
  - "duration": "8000",
  - "end": "2021-01-01T00:00:00Z",
  - "start": "2020-01-01T00:00:00Z"
},
- "type": "BREAK",
- "userId": "5a0ab5acb07987125438b60f",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Time-entry/operation/createForOthers)Add a new time entry for another user on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### query Parameters


| from-entry | string Example: from-entry=64c777ddd3fcab07cfbb210cRepresents time entry identifier across the system. |


##### Request Body schema: application/jsonrequired


| billable | boolean Indicates whether a time entry is billable or not. |


| customAttributes | Array of objects (CreateCustomAttributeRequest) [ 0 .. 10 ] items Represents a list of create custom field request objects. |


| customFields | Array of objects (UpdateCustomFieldRequest) [ 0 .. 50 ] items Represents a list of value objects for user’s custom fields. |


| description | string <= 3000 characters Represents time entry description. |


| end | string <date-time> Represents an end date in yyyy-MM-ddThh:mm:ssZ format. |


| projectId | string Represents project identifier across the system. |


| start | string <date-time> Represents a start date in yyyy-MM-ddThh:mm:ssZ format. |


| tagIds | Array of strings Represents a list of tag ids. |


| taskId | string Represents task identifier across the system. |


| type | string Enum: "REGULAR" "BREAK" Valid time entry type. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/user/{userId}/time-entrieshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/user/{userId}/time-entries

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "billable": true,
- "customAttributes": [
  - {
    - "name": "race",
    - "namespace": "user_info",
    - "value": "Asian"
}
],
- "customFields": [
  - {
    - "customFieldId": "5e4117fe8c625f38930d57b7",
    - "sourceType": "WORKSPACE",
    - "value": "new value"
}
],
- "description": "This is a sample time entry description.",
- "end": "2021-01-01T00:00:00Z",
- "projectId": "25b687e29ae1f428e7ebe123",
- "start": "2020-01-01T00:00:00Z",
- "tagIds": [
  - "321r77ddd3fcab07cfbb567y",
  - "44x777ddd3fcab07cfbb88f"
],
- "taskId": "54m377ddd3fcab07cfbb432w",
- "type": "REGULAR"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "billable": true,
- "customFieldValues": [
  - {
    - "customFieldId": "5e4117fe8c625f38930d57b7",
    - "name": "TIN",
    - "timeEntryId": "64c777ddd3fcab07cfbb210c",
    - "type": "WORKSPACE",
    - "value": "20231211-12345"
}
],
- "description": "This is a sample time entry description.",
- "id": "64c777ddd3fcab07cfbb210c",
- "isLocked": true,
- "kioskId": "94c777ddd3fcab07cfbb210d",
- "projectId": "25b687e29ae1f428e7ebe123",
- "tagIds": [
  - "321r77ddd3fcab07cfbb567y",
  - "44x777ddd3fcab07cfbb88f"
],
- "taskId": "54m377ddd3fcab07cfbb432w",
- "timeInterval": {
  - "duration": "8000",
  - "end": "2021-01-01T00:00:00Z",
  - "start": "2020-01-01T00:00:00Z"
},
- "type": "BREAK",
- "userId": "5a0ab5acb07987125438b60f",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Time-entry/operation/replaceMany)Bulk edit time entries

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


##### query Parameters


| hydrated | boolean Default: false If set to true, results will contain additional information about the time entry. |


##### Request Body schema: application/jsonrequired
 Array (non-empty)

| billable | boolean Indicates whether a time entry is billable or not. |
| customFields | Array of objects (UpdateCustomFieldRequest) [ 0 .. 50 ] items |


| description | string [ 0 .. 3000 ] characters Represents time entry description. |


| end | string <date-time> Represents an end date in yyyy-MM-ddThh:mm:ssZ format. |


| idrequired | string Represents time entry identifier across the system. |


| projectId | string Represents project identifier across the system. |


| start | string <date-time> Represents a start date in yyyy-MM-ddThh:mm:ssZ format. |


| tagIds | Array of strings Represents a list of tag ids. |


| taskId | string Represents task identifier across the system. |
| type | string Enum: "REGULAR" "BREAK" |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/user/{userId}/time-entrieshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/user/{userId}/time-entries

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "billable": true,
  - "customFields": [
    - {
      - "customFieldId": "5e4117fe8c625f38930d57b7",
      - "sourceType": "WORKSPACE",
      - "value": "new value"
}
],
  - "description": "This is a sample time entry description.",
  - "end": "2021-01-01T00:00:00Z",
  - "id": "64c777ddd3fcab07cfbb210c",
  - "projectId": "25b687e29ae1f428e7ebe123",
  - "start": "2020-01-01T00:00:00Z",
  - "tagIds": [
    - "321r77ddd3fcab07cfbb567y",
    - "44x777ddd3fcab07cfbb88f"
],
  - "taskId": "54m377ddd3fcab07cfbb432w",
  - "type": "REGULAR"
}
]`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "billable": true,
  - "customFieldValues": [
    - {
      - "customFieldId": "5e4117fe8c625f38930d57b7",
      - "name": "TIN",
      - "timeEntryId": "64c777ddd3fcab07cfbb210c",
      - "type": "WORKSPACE",
      - "value": "20231211-12345"
}
],
  - "description": "This is a sample time entry description.",
  - "id": "64c777ddd3fcab07cfbb210c",
  - "isLocked": true,
  - "kioskId": "94c777ddd3fcab07cfbb210d",
  - "projectId": "25b687e29ae1f428e7ebe123",
  - "tagIds": [
    - "321r77ddd3fcab07cfbb567y",
    - "44x777ddd3fcab07cfbb88f"
],
  - "taskId": "54m377ddd3fcab07cfbb432w",
  - "timeInterval": {
    - "duration": "8000",
    - "end": "2021-01-01T00:00:00Z",
    - "start": "2020-01-01T00:00:00Z"
},
  - "type": "BREAK",
  - "userId": "5a0ab5acb07987125438b60f",
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Time-entry/operation/duplicateTimeEntry)Duplicate time entry

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


| idrequired | string Example: 8j39fn9307hh5125439g2astRepresents time entry identifier across the system. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/user/{userId}/time-entries/{id}/duplicatehttps://api.clockify.me/api/v1/workspaces/{workspaceId}/user/{userId}/time-entries/{id}/duplicate

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "billable": true,
- "customFieldValues": [
  - {
    - "customFieldId": "5e4117fe8c625f38930d57b7",
    - "name": "TIN",
    - "timeEntryId": "64c777ddd3fcab07cfbb210c",
    - "type": "WORKSPACE",
    - "value": "20231211-12345"
}
],
- "description": "This is a sample time entry description.",
- "id": "64c777ddd3fcab07cfbb210c",
- "isLocked": true,
- "kioskId": "94c777ddd3fcab07cfbb210d",
- "projectId": "25b687e29ae1f428e7ebe123",
- "tagIds": [
  - "321r77ddd3fcab07cfbb567y",
  - "44x777ddd3fcab07cfbb88f"
],
- "taskId": "54m377ddd3fcab07cfbb432w",
- "timeInterval": {
  - "duration": "8000",
  - "end": "2021-01-01T00:00:00Z",
  - "start": "2020-01-01T00:00:00Z"
},
- "type": "BREAK",
- "userId": "5a0ab5acb07987125438b60f",
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Balance)Balance

This endpoint group replaces the deprecated [Balance (Deprecated)](#tag/Balance-(Deprecated)) endpoints. Request and response formats are exactly the same. Compared to [Balance (Deprecated)](#tag/Balance-(Deprecated)), changes are made only to the base URL and path.


## [](#tag/Balance/operation/getBalancesForPolicy)Get balance by policy

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| policyIdrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


##### query Parameters

| page | integer <int32> <= 1000 Default: 1 Example: page=1 |
| page-size | integer <int32> [ 1 .. 200 ] Default: 50 Example: page-size=50 |


| sort | string Enum: "USER" "POLICY" "USED" "BALANCE" "TOTAL" Example: sort=USERIf provided, you'll get result sorted by sort column. |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGSort results in ascending or descending order. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/time-off/balance/policy/{policyId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/balance/policy/{policyId}

## [](#tag/Balance/operation/updateBalance)Update balance

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| policyIdrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


##### Request Body schema: application/jsonrequired


| note | string Represents note attached to updating balance. |


| userIdsrequired | Array of strings unique Represents list of users' identifiers whose balance is to be updated. |


| valuerequired | number <double> [ -10000 .. 10000 ] Represents new balance value. |


### Responses
**204 **

No Content

 patch/v1/workspaces/{workspaceId}/time-off/balance/policy/{policyId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/balance/policy/{policyId}

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "note": "Bonus days added.",
- "userIds": [
  - "5b715448b079875110792222",
  - "5b715448b079875110791111"
],
- "value": 22
}`

## [](#tag/Balance/operation/getBalancesForUser)Get balance by user

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| userIdrequired | string Example: 60f924bafdaf031696ec6218Represents user identifier across the system. |


##### query Parameters


| page | integer <int32> <= 1000 Default: 1 Example: page=1Page number. |


| page-size | integer <int32> [ 1 .. 200 ] Default: 50 Example: page-size=50Page size. |


| sort | string Enum: "USER" "POLICY" "USED" "BALANCE" "TOTAL" Example: sort=POLICYSort result based on given criteria |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGSort result by providing sort order. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/time-off/balance/user/{userId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/balance/user/{userId}

## [](#tag/Policy)Policy

This endpoint group replaces the deprecated [Policy (Deprecated)](#tag/Policy-(Deprecated)) endpoints. Request and response formats are exactly the same. Compared to [Policy (Deprecated)](#tag/Policy-(Deprecated)), changes are made only to the base URL and path.


## [](#tag/Policy/operation/findPoliciesForWorkspace)Get policies on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


##### query Parameters


| page | integer <int32> <= 1000 Default: 1 Example: page=1Page number. |


| page-size | integer <int32> [ 1 .. 200 ] Default: 50 Example: page-size=50Page size. |


| name | string Example: name=HolidaysIf provided, you'll get a filtered list of policies that contain the provided string in their name. |


| status | string Enum: "ACTIVE" "ARCHIVED" "ALL" Example: status=ACTIVEIf provided, you'll get a filtered list of policies with the corresponding status. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/time-off/policieshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/policies

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "allowHalfDay": false,
  - "allowNegativeBalance": true,
  - "approve": {
    - "requiresApproval": true,
    - "specificMembers": false,
    - "teamManagers": false,
    - "userIds": [
      - "6579d126c2fe3b25f20ea001",
      - "6579d126c2fe3b25f20ea002"
]
},
  - "archived": true,
  - "automaticAccrual": {
    - "amount": 20,
    - "period": "YEAR",
    - "timeUnit": "DAYS"
},
  - "automaticTimeEntryCreation": {
    - "defaultEntities": {
      - "projectId": "string",
      - "taskId": "string"
},
    - "enabled": true
},
  - "everyoneIncludingNew": false,
  - "id": "5b715612b079875110791111",
  - "name": "Days",
  - "negativeBalance": {
    - "amount": 0.1,
    - "period": "string",
    - "timeUnit": "string"
},
  - "projectId": "string",
  - "timeUnit": "DAYS",
  - "userGroupIds": [
    - "5b715612b079875110791342",
    - "5b715612b079875110791324",
    - "5b715612b079875110793142"
],
  - "userIds": [
    - "5b715612b079875110791432",
    - "5b715612b079875110791234"
],
  - "workspaceId": "5b715612b079875110792222"
}
]`

## [](#tag/Policy/operation/createPolicy)Create time off policy

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| allowHalfDay | boolean Indicates whether policy allows half days. |


| allowNegativeBalance | boolean Indicates whether policy allows negative balances. |


| approverequired | object (ApproveDto) Provide approval settings. |


| archived | boolean Indicates whether policy is archived. |


| automaticAccrual | object (AutomaticAccrualRequest) Provide automatic accrual settings. |


| automaticTimeEntryCreation | object (AutomaticTimeEntryCreationRequest) Provides automatic time entry creation settings. |


| color | string^#(?:[0-9a-fA-F]{6}){1}$ Provide color in format ^#(?:[0-9a-fA-F]{6}){1}$. Explanation: A valid color code should start with '#' and consist of six hexadecimal characters, representing a color in hexadecimal format. Color value is in standard RGB hexadecimal format. |


| everyoneIncludingNew | boolean Indicates whether the policy is to be applied to future new users. |


| namerequired | string [ 2 .. 100 ] characters Represents name of new policy. |


| negativeBalance | object (NegativeBalanceRequest) Provide the negative balance data you would like to use for updating the policy. |


| timeUnit | string Enum: "DAYS" "HOURS" Indicates time unit of the policy. |


| userGroups | object (UserGroupIdsSchema) Provide list with user group ids and corresponding status. |


| users | object (UserIdsSchema) Provide list with user ids and corresponding status. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/time-off/policieshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/policies

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowHalfDay": false,
- "allowNegativeBalance": true,
- "approve": {
  - "requiresApproval": true,
  - "specificMembers": false,
  - "teamManagers": false,
  - "userIds": [
    - "6579d126c2fe3b25f20ea001",
    - "6579d126c2fe3b25f20ea002"
]
},
- "archived": true,
- "automaticAccrual": {
  - "amount": 2,
  - "amountValidForTimeUnit": true,
  - "period": "MONTH",
  - "timeUnit": "DAYS"
},
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "color": "#8BC34A",
- "everyoneIncludingNew": false,
- "name": "Mental health days",
- "negativeBalance": {
  - "amount": 2,
  - "amountValidForTimeUnit": true,
  - "period": "MONTH",
  - "timeUnit": "DAYS"
},
- "timeUnit": "DAYS",
- "userGroups": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715612b079875110791111",
    - "5b715612b079875110791222"
],
  - "status": "ALL"
},
- "users": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715612b079875110791111",
    - "5b715612b079875110791222"
],
  - "status": "ALL"
}
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowHalfDay": false,
- "allowNegativeBalance": true,
- "approve": {
  - "requiresApproval": true,
  - "specificMembers": false,
  - "teamManagers": false,
  - "userIds": [
    - "6579d126c2fe3b25f20ea001",
    - "6579d126c2fe3b25f20ea002"
]
},
- "archived": true,
- "automaticAccrual": {
  - "amount": 20,
  - "period": "YEAR",
  - "timeUnit": "DAYS"
},
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "everyoneIncludingNew": false,
- "id": "5b715612b079875110791111",
- "name": "Days",
- "negativeBalance": {
  - "amount": 0.1,
  - "period": "string",
  - "timeUnit": "string"
},
- "projectId": "string",
- "timeUnit": "DAYS",
- "userGroupIds": [
  - "5b715612b079875110791342",
  - "5b715612b079875110791324",
  - "5b715612b079875110793142"
],
- "userIds": [
  - "5b715612b079875110791432",
  - "5b715612b079875110791234"
],
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Policy/operation/deletePolicy)Delete policy

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| idrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/time-off/policies/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/policies/{id}

## [](#tag/Policy/operation/getPolicy)Get time off policy

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| idrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/time-off/policies/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/policies/{id}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowHalfDay": false,
- "allowNegativeBalance": true,
- "approve": {
  - "requiresApproval": true,
  - "specificMembers": false,
  - "teamManagers": false,
  - "userIds": [
    - "6579d126c2fe3b25f20ea001",
    - "6579d126c2fe3b25f20ea002"
]
},
- "archived": true,
- "automaticAccrual": {
  - "amount": 20,
  - "period": "YEAR",
  - "timeUnit": "DAYS"
},
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "everyoneIncludingNew": false,
- "id": "5b715612b079875110791111",
- "name": "Days",
- "negativeBalance": {
  - "amount": 0.1,
  - "period": "string",
  - "timeUnit": "string"
},
- "projectId": "string",
- "timeUnit": "DAYS",
- "userGroupIds": [
  - "5b715612b079875110791342",
  - "5b715612b079875110791324",
  - "5b715612b079875110793142"
],
- "userIds": [
  - "5b715612b079875110791432",
  - "5b715612b079875110791234"
],
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Policy/operation/updatePolicyStatus)Change policy status

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| idrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


##### Request Body schema: application/jsonrequired


| statusrequired | string Enum: "ACTIVE" "ARCHIVED" "ALL" Provide the status you would like to use for changing the policy. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/time-off/policies/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/policies/{id}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "status": "ACTIVE"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowHalfDay": false,
- "allowNegativeBalance": true,
- "approve": {
  - "requiresApproval": true,
  - "specificMembers": false,
  - "teamManagers": false,
  - "userIds": [
    - "6579d126c2fe3b25f20ea001",
    - "6579d126c2fe3b25f20ea002"
]
},
- "archived": true,
- "automaticAccrual": {
  - "amount": 20,
  - "period": "YEAR",
  - "timeUnit": "DAYS"
},
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "everyoneIncludingNew": false,
- "id": "5b715612b079875110791111",
- "name": "Days",
- "negativeBalance": {
  - "amount": 0.1,
  - "period": "string",
  - "timeUnit": "string"
},
- "projectId": "string",
- "timeUnit": "DAYS",
- "userGroupIds": [
  - "5b715612b079875110791342",
  - "5b715612b079875110791324",
  - "5b715612b079875110793142"
],
- "userIds": [
  - "5b715612b079875110791432",
  - "5b715612b079875110791234"
],
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Policy/operation/updatePolicy)Update policy

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| idrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


##### Request Body schema: application/jsonrequired


| allowHalfDayrequired | boolean Indicates whether policy allows half day. |


| allowNegativeBalancerequired | boolean Indicates whether policy allows negative balance. |


| approverequired | object (ApproveDto) Provide approval settings. |


| archivedrequired | boolean Indicates whether policy is archived. |


| automaticAccrual | object (AutomaticAccrualRequest) Provide automatic accrual settings. |


| automaticTimeEntryCreation | object (AutomaticTimeEntryCreationRequest) Provides automatic time entry creation settings. |


| color | string^#(?:[0-9a-fA-F]{6}){1}$ Provide color in format ^#(?:[0-9a-fA-F]{6}){1}$. Explanation: A valid color code should start with '#' and consist of six hexadecimal characters, representing a color in hexadecimal format. Color value is in standard RGB hexadecimal format. |


| everyoneIncludingNewrequired | boolean Indicates whether the policy is shown to new users. |


| namerequired | string [ 2 .. 100 ] characters Provide the name you would like to use for updating the policy. |


| negativeBalance | object (NegativeBalanceRequest) Provide the negative balance data you would like to use for updating the policy. |


| userGroupsrequired | object (UserGroupIdsSchema) Provide list with user group ids and corresponding status. |


| usersrequired | object (UserIdsSchema) Provide list with user ids and corresponding status. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/time-off/policies/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/policies/{id}

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowHalfDay": true,
- "allowNegativeBalance": false,
- "approve": {
  - "requiresApproval": true,
  - "specificMembers": false,
  - "teamManagers": false,
  - "userIds": [
    - "6579d126c2fe3b25f20ea001",
    - "6579d126c2fe3b25f20ea002"
]
},
- "archived": false,
- "automaticAccrual": {
  - "amount": 2,
  - "amountValidForTimeUnit": true,
  - "period": "MONTH",
  - "timeUnit": "DAYS"
},
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "color": "#8BC34A",
- "everyoneIncludingNew": false,
- "name": "Days",
- "negativeBalance": {
  - "amount": 2,
  - "amountValidForTimeUnit": true,
  - "period": "MONTH",
  - "timeUnit": "DAYS"
},
- "userGroups": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715612b079875110791111",
    - "5b715612b079875110791222"
],
  - "status": "ALL"
},
- "users": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715612b079875110791111",
    - "5b715612b079875110791222"
],
  - "status": "ALL"
}
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowHalfDay": false,
- "allowNegativeBalance": true,
- "approve": {
  - "requiresApproval": true,
  - "specificMembers": false,
  - "teamManagers": false,
  - "userIds": [
    - "6579d126c2fe3b25f20ea001",
    - "6579d126c2fe3b25f20ea002"
]
},
- "archived": true,
- "automaticAccrual": {
  - "amount": 20,
  - "period": "YEAR",
  - "timeUnit": "DAYS"
},
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "everyoneIncludingNew": false,
- "id": "5b715612b079875110791111",
- "name": "Days",
- "negativeBalance": {
  - "amount": 0.1,
  - "period": "string",
  - "timeUnit": "string"
},
- "projectId": "string",
- "timeUnit": "DAYS",
- "userGroupIds": [
  - "5b715612b079875110791342",
  - "5b715612b079875110791324",
  - "5b715612b079875110793142"
],
- "userIds": [
  - "5b715612b079875110791432",
  - "5b715612b079875110791234"
],
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Time-Off)Time Off

This endpoint group replaces the deprecated [Time Off (Deprecated)](#tag/Time-Off-(Deprecated)) endpoints. Request and response formats are exactly the same. Compared to [Time Off (Deprecated)](#tag/Time-Off-(Deprecated)), changes are made only to the base URL and path.


## [](#tag/Time-Off/operation/createTimeOffRequest)Create time off request

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| policyIdrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


##### Request Body schema: application/jsonrequired


| note | string Provide the note you would like to use for creating the time off request. |


| timeOffPeriodrequired | object (TimeOffRequestPeriodV1Request) Provide the period you would like to use for creating the time off request. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/time-off/policies/{policyId}/requestshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/policies/{policyId}/requests

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "note": "Create Time Off Note",
- "timeOffPeriod": {
  - "halfDayPeriod": "NOT_DEFINED",
  - "isHalfDay": false,
  - "period": {
    - "days": 3,
    - "end": "2021-12-25",
    - "start": "2021-12-23"
},
  - "timeOffHalfDayPeriod": "FIRST_HALF"
}
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "balance": 10,
- "balanceDiff": 1,
- "createdAt": "2022-08-26T08:32:01.640708Z",
- "id": "5b715612b079875110791111",
- "note": "Time Off Request Note",
- "policyId": "5b715612b079875110792333",
- "policyName": "Days",
- "requesterUserId": "5b715612b0798751107925555",
- "requesterUserName": "John",
- "status": {
  - "changedAt": "2019-08-24T14:15:22Z",
  - "changedByUserId": "string",
  - "changedByUserName": "string",
  - "changedForUserName": "string",
  - "note": "string",
  - "statusType": "PENDING"
},
- "timeOffPeriod": {
  - "halfDay": true,
  - "halfDayHours": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
},
  - "halfDayPeriod": "string",
  - "period": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
}
},
- "timeUnit": "DAYS",
- "userEmail": "nicholas@clockify.com",
- "userId": "5b715612b079875110794444",
- "userName": "Nicholas",
- "userTimeZone": "Europe/Budapest",
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Time-Off/operation/deleteTimeOffRequest)Delete request

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| policyIdrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


| requestIdrequired | string Example: 6308850156b7d75ea8fd3fbdRepresents time off request identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/time-off/policies/{policyId}/requests/{requestId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/policies/{policyId}/requests/{requestId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "balanceDiff": 1,
- "createdAt": "2022-08-26T08:32:01.640708Z",
- "id": "5b715612b079875110791111",
- "note": "Time Off Request Note",
- "policyId": "5b715612b079875110792333",
- "status": {
  - "changedAt": "2019-08-24T14:15:22Z",
  - "changedByUserId": "string",
  - "changedByUserName": "string",
  - "changedForUserName": "string",
  - "note": "string",
  - "statusType": "PENDING"
},
- "timeOffPeriod": {
  - "halfDay": true,
  - "halfDayHours": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
},
  - "halfDayPeriod": "string",
  - "period": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
}
},
- "userId": "5b715612b079875110794444",
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Time-Off/operation/changeTimeOffRequestStatus)Change time off request status

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| policyIdrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


| requestIdrequired | string Example: 6308850156b7d75ea8fd3fbdRepresents time off request identifier across the system. |


##### Request Body schema: application/jsonrequired


| note | string Provide the note you would like to use for changing the time off request. |


| status | string Enum: "APPROVED" "REJECTED" Provide the status you would like to use for changing the time off request. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/time-off/policies/{policyId}/requests/{requestId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/policies/{policyId}/requests/{requestId}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "note": "Time Off Request Note",
- "status": "APPROVED"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "balanceDiff": 1,
- "createdAt": "2022-08-26T08:32:01.640708Z",
- "id": "5b715612b079875110791111",
- "note": "Time Off Request Note",
- "policyId": "5b715612b079875110792333",
- "status": {
  - "changedAt": "2019-08-24T14:15:22Z",
  - "changedByUserId": "string",
  - "changedByUserName": "string",
  - "changedForUserName": "string",
  - "note": "string",
  - "statusType": "PENDING"
},
- "timeOffPeriod": {
  - "halfDay": true,
  - "halfDayHours": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
},
  - "halfDayPeriod": "string",
  - "period": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
}
},
- "userId": "5b715612b079875110794444",
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Time-Off/operation/createTimeOffRequestForOther)Create time off request for user

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| policyIdrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


| userIdrequired | string Example: 60f924bafdaf031696ec6218Represents user identifier across the system. |


##### Request Body schema: application/jsonrequired


| note | string Provide the note you would like to use for creating the time off request. |


| timeOffPeriodrequired | object (TimeOffRequestPeriodV1Request) Provide the period you would like to use for creating the time off request. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/time-off/policies/{policyId}/users/{userId}/requestshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/policies/{policyId}/users/{userId}/requests

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "note": "Create Time Off Note",
- "timeOffPeriod": {
  - "halfDayPeriod": "NOT_DEFINED",
  - "isHalfDay": false,
  - "period": {
    - "days": 3,
    - "end": "2021-12-25",
    - "start": "2021-12-23"
},
  - "timeOffHalfDayPeriod": "FIRST_HALF"
}
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "balance": 10,
- "balanceDiff": 1,
- "createdAt": "2022-08-26T08:32:01.640708Z",
- "id": "5b715612b079875110791111",
- "note": "Time Off Request Note",
- "policyId": "5b715612b079875110792333",
- "policyName": "Days",
- "requesterUserId": "5b715612b0798751107925555",
- "requesterUserName": "John",
- "status": {
  - "changedAt": "2019-08-24T14:15:22Z",
  - "changedByUserId": "string",
  - "changedByUserName": "string",
  - "changedForUserName": "string",
  - "note": "string",
  - "statusType": "PENDING"
},
- "timeOffPeriod": {
  - "halfDay": true,
  - "halfDayHours": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
},
  - "halfDayPeriod": "string",
  - "period": {
    - "end": "2019-08-24T14:15:22Z",
    - "start": "2019-08-24T14:15:22Z"
}
},
- "timeUnit": "DAYS",
- "userEmail": "nicholas@clockify.com",
- "userId": "5b715612b079875110794444",
- "userName": "Nicholas",
- "userTimeZone": "Europe/Budapest",
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Time-Off/operation/getTimeOffRequest)Get all time off requests on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| end | string <date-time> Return time off requests created before the specified time in requester's time zone. Provide end in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| page | integer <int32> <= 1000 Default: 1 Page number. |


| pageSize | integer <int32> [ 1 .. 200 ] Default: 50 Page size. |


| start | string <date-time> Return time off requests created after the specified time in requester's time zone. Provide start in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| statuses | Array of strings unique Items Enum: "PENDING" "APPROVED" "REJECTED" "ALL" Filters time off requests by status. |


| userGroups | Array of strings unique Provide the user group ids of time off requests. |


| users | Array of strings unique Provide the user ids of time off requests. If empty, will return time off requests of all users (with a maximum of 5000 users). |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/time-off/requestshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/time-off/requests

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "end": "2022-08-26T23:55:06.281873Z",
- "page": 1,
- "pageSize": 50,
- "start": "2022-08-26T08:00:06.281873Z",
- "statuses": [
  - "APPROVED",
  - "PENDING"
],
- "userGroups": [
  - "5b715612b079875110791342",
  - "5b715612b079875110791324",
  - "5b715612b079875110793142"
],
- "users": [
  - "5b715612b079875110791432",
  - "b715612b079875110791234"
]
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "count": 1,
- "requests": [
  - {
    - "balance": 10,
    - "balanceDiff": 1,
    - "createdAt": "2022-08-26T08:32:01.640708Z",
    - "id": "5b715612b079875110791111",
    - "note": "Time Off Request Note",
    - "policyId": "5b715612b079875110792333",
    - "policyName": "Days",
    - "requesterUserId": "5b715612b0798751107925555",
    - "requesterUserName": "John",
    - "status": {
      - "changedAt": "2019-08-24T14:15:22Z",
      - "changedByUserId": "string",
      - "changedByUserName": "string",
      - "changedForUserName": "string",
      - "note": "string",
      - "statusType": "PENDING"
},
    - "timeOffPeriod": {
      - "halfDay": true,
      - "halfDayHours": {
        - "end": "2019-08-24T14:15:22Z",
        - "start": "2019-08-24T14:15:22Z"
},
      - "halfDayPeriod": "string",
      - "period": {
        - "end": "2019-08-24T14:15:22Z",
        - "start": "2019-08-24T14:15:22Z"
}
},
    - "timeUnit": "DAYS",
    - "userEmail": "nicholas@clockify.com",
    - "userId": "5b715612b079875110794444",
    - "userName": "Nicholas",
    - "userTimeZone": "Europe/Budapest",
    - "workspaceId": "5b715612b079875110792222"
}
]
}`

## [](#tag/Group)Group

## [](#tag/Group/operation/getUserGroups)Find all groups on workspace

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| project-id | string Example: project-id=5a0ab5acb07987125438b60fIf provided, you'll get a filtered list of groups that matches the string provided in their project id. |


| name | string Example: name=development_teamIf provided, you'll get a filtered list of groups that matches the string provided in their name. |


| sort-column | string Enum: "ID" "NAME" Example: sort-column=NAMEColumn to be used as the sorting criteria. |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGSorting mode. |


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


| includeTeamManagers | boolean Default: false Example: includeTeamManagers=trueIf provided, you'll get a list of team managers assigned to this user group. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/user-groupshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/user-groups

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "id": "76a687e29ae1f428e7ebe101",
  - "name": "development_team",
  - "teamManagers": [
    - {
      - "id": "672323eb0024343a1585e8a7",
      - "name": "Jane Doe"
}
],
  - "userIds": [
    - "5a0ab5acb07987125438b60f",
    - "98j4b5acb07987125437y32"
],
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Group/operation/createUserGroup)Add a new group

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| name | string [ 0 .. 100 ] characters Represents user group name. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/user-groupshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/user-groups

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "name": "development_team"
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "id": "76a687e29ae1f428e7ebe101",
- "name": "development_team",
- "teamManagers": [
  - {
    - "id": "672323eb0024343a1585e8a7",
    - "name": "Jane Doe"
}
],
- "userIds": [
  - "5a0ab5acb07987125438b60f",
  - "98j4b5acb07987125437y32"
],
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Group/operation/deleteUserGroup)Delete group

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| idrequired | string Example: 76a687e29ae1f428e7ebe101Represents user group identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/user-groups/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/user-groups/{id}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "id": "76a687e29ae1f428e7ebe101",
- "name": "development_team",
- "teamManagers": [
  - {
    - "id": "672323eb0024343a1585e8a7",
    - "name": "Jane Doe"
}
],
- "userIds": [
  - "5a0ab5acb07987125438b60f",
  - "98j4b5acb07987125437y32"
],
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Group/operation/updateUserGroup)Update group

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| idrequired | string Example: 76a687e29ae1f428e7ebe101Represents user group identifier across the system. |


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| name | string [ 0 .. 100 ] characters Represents user group name. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/user-groups/{id}https://api.clockify.me/api/v1/workspaces/{workspaceId}/user-groups/{id}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "name": "development_team"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "id": "76a687e29ae1f428e7ebe101",
- "name": "development_team",
- "teamManagers": [
  - {
    - "id": "672323eb0024343a1585e8a7",
    - "name": "Jane Doe"
}
],
- "userIds": [
  - "5a0ab5acb07987125438b60f",
  - "98j4b5acb07987125437y32"
],
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Group/operation/addUser)Add users to group

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userGroupIdrequired | string Example: 76a687e29ae1f428e7ebe101Represents user group identifier across the system. |


##### Request Body schema: application/jsonrequired


| userIdrequired | string Represents user identifier across the system. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/user-groups/{userGroupId}/usershttps://api.clockify.me/api/v1/workspaces/{workspaceId}/user-groups/{userGroupId}/users

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "userId": "5a0ab5acb07987125438b60f"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "id": "76a687e29ae1f428e7ebe101",
- "name": "development_team",
- "teamManagers": [
  - {
    - "id": "672323eb0024343a1585e8a7",
    - "name": "Jane Doe"
}
],
- "userIds": [
  - "5a0ab5acb07987125438b60f",
  - "98j4b5acb07987125437y32"
],
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Group/operation/deleteUser)Remove user from group

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userGroupIdrequired | string Example: 76a687e29ae1f428e7ebe101Represents user group identifier across the system. |


| userIdrequired | string Example: 5a0ab5acb07987125438b60fRepresents user identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/user-groups/{userGroupId}/users/{userId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/user-groups/{userGroupId}/users/{userId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "id": "76a687e29ae1f428e7ebe101",
- "name": "development_team",
- "teamManagers": [
  - {
    - "id": "672323eb0024343a1585e8a7",
    - "name": "Jane Doe"
}
],
- "userIds": [
  - "5a0ab5acb07987125438b60f",
  - "98j4b5acb07987125437y32"
],
- "workspaceId": "64a687e29ae1f428e7ebe303"
}`

## [](#tag/Shared-Report)Shared Report

## [](#tag/Shared-Report/operation/generateSharedReportV1)Generate shared report by ID

Response depends on report type and export type. Given example is for SUMMARY report and JSON exportType.


Shared report data on FREE subscription plan is limited to a maximum interval length of one year (366 days).


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| idrequired | string Example: 61794f784363c45af78e5555Represents shared report identifier across the system. |


##### query Parameters


| dateRangeStart | string Example: dateRangeStart=2018-11-01T00:00:00ZProvide start date in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| dateRangeEnd | string Example: dateRangeEnd=2018-11-30T23:59:59.999ZProvide end date in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| sortOrder | string Example: sortOrder=ASCENDINGSort result in ascending or descending order |


| sortColumn | string If provided, you'll get result sorted by sort column. |


| exportType | string Example: exportType=JSONRepresents export type of shared report |
| page | integer <int32> Example: page=1 |
| pageSize | integer <int32> Example: pageSize=20 |


### Responses
**200 **

OK

 get/v1/shared-reports/{id}https://reports.api.clockify.me/v1/shared-reports/{id}

## [](#tag/Shared-Report/operation/getSharedReportsV1)Get all my shared reports

Gets all shared reports for current user on given workspace


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ecxxxxRepresents workspace identifier across the system. |


##### query Parameters


| page | integer <int32> Default: 1 Example: page=2Page number. |


| pageSize | integer <int32> >= 1 Default: 50 Example: pageSize=20Page size. |


| sharedReportsFilter | string Default: "ALL" Enum: "ALL" "CREATED_BY_ME" "SHARED_WITH_ME" Example: sharedReportsFilter=CREATED_BY_MEFilters shared reports by origin. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/shared-reportshttps://reports.api.clockify.me/v1/workspaces/{workspaceId}/shared-reports

## [](#tag/Shared-Report/operation/saveSharedReportV1)Create shared report

Saves shared report with name, options and report filter.


Shared report data on FREE subscription plan is limited to a maximum interval length of one year (366 days).


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ecxxxxRepresents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired

| filter | object (ReportFilterV1) |


| fixedDate | boolean Indicates whether the shared report has a fixed date range. |


| isPublic | boolean Indicates whether the shared report is public or not |


| name | string Represents shared report's name |


| type | string Enum: "DETAILED" "WEEKLY" "SUMMARY" "SCHEDULED" "EXPENSE_DETAILED" "EXPENSE_RECEIPT" "PTO_REQUESTS" "PTO_BALANCE" "ATTENDANCE" "INVOICE_EXPENSE" "PROJECT" "TEAM_FULL" "TEAM_LIMITED" "TEAM_GROUPS" "INVOICES" Represent the type of shared report. |


| visibleToUserGroups | Array of strings unique Represents user group ids. |


| visibleToUsers | Array of strings unique Represents user ids. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/shared-reportshttps://reports.api.clockify.me/v1/workspaces/{workspaceId}/shared-reports

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "filter": {
  - "amountShown": "COST",
  - "amounts": [
    - "[EARNED, COST]"
],
  - "approvalState": "APPROVED",
  - "archived": false,
  - "attendanceFilter": {
    - "breakFilters": [
      - {
        - "filtrationType": "EXACTLY",
        - "value": "50"
}
],
    - "capacityFilters": [
      - {
        - "filtrationType": "EXACTLY",
        - "value": "750"
}
],
    - "endFilters": [
      - {
        - "filtrationType": "EXACTLY",
        - "value": "17:00"
}
],
    - "hasTimeOff": true,
    - "overtimeFilters": [
      - {
        - "filtrationType": "EXACTLY",
        - "value": "150"
}
],
    - "page": 1,
    - "pageSize": 1,
    - "sortColumn": "NAME",
    - "startFilters": [
      - {
        - "filtrationType": "EXACTLY",
        - "value": "15:00"
}
],
    - "workFilters": [
      - {
        - "filtrationType": "EXACTLY",
        - "value": "750"
}
]
},
  - "billable": true,
  - "clients": {
    - "contains": "CONTAINS",
    - "ids": [
      - "5b715448b079875110792222",
      - "5b715448b079875110791111"
],
    - "status": "ACTIVE"
},
  - "currency": {
    - "contains": "CONTAINS",
    - "ids": [
      - "5b715448b079875110792222",
      - "5b715448b079875110791111"
],
    - "status": "ACTIVE"
},
  - "customFields": [
    - {
      - "id": "5b71544ab0798751107918b3",
      - "isEmpty": false,
      - "numberCondition": "EQUAL",
      - "type": "NUMBER",
      - "value": 2000
}
],
  - "dateFormat": "2018-11-01",
  - "dateRangeEnd": "2018-11-30T23:59:59.999Z",
  - "dateRangeStart": "2018-11-01T00:00:00Z",
  - "dateRangeType": "LAST_MONTH",
  - "description": "some description keyword",
  - "detailedFilter": {
    - "auditFilter": {
      - "duration": 2,
      - "durationShorter": false,
      - "withoutProject": false,
      - "withoutTask": true
},
    - "options": {
      - "totals": "CALCULATE"
},
    - "page": 1,
    - "pageSize": 20,
    - "sortColumn": "ID"
},
  - "exportType": "JSON",
  - "invoicingState": "INVOICED",
  - "projects": {
    - "contains": "CONTAINS",
    - "ids": [
      - "5b715448b079875110792222",
      - "5b715448b079875110791111"
],
    - "status": "ACTIVE"
},
  - "rounding": false,
  - "sortOrder": "ASCENDING",
  - "summaryFilter": {
    - "groups": "\"[5b715448b07987511071111\", \"5b715448b079875110792222\"]",
    - "sortColumn": "GROUP",
    - "summaryChartType": "PROJECT"
},
  - "tags": {
    - "containedInTimeentry": "CONTAINS_ONLY",
    - "contains": "CONTAINS",
    - "ids": [
      - "5b715448b079875110792222",
      - "5b715448b079875110791111"
],
    - "status": "ACTIVE"
},
  - "tasks": {
    - "contains": "CONTAINS",
    - "ids": [
      - "5b715448b079875110792222",
      - "5b715448b079875110791111"
],
    - "status": "ACTIVE"
},
  - "timeFormat": "T00:00:00",
  - "timeZone": "Europe/Belgrade",
  - "userGroups": {
    - "contains": "CONTAINS",
    - "ids": [
      - "5b715448b079875110792222",
      - "5b715448b079875110791111"
],
    - "status": "ACTIVE"
},
  - "userLocale": "en",
  - "users": {
    - "contains": "CONTAINS",
    - "ids": [
      - "5b715448b079875110792222",
      - "5b715448b079875110791111"
],
    - "status": "ACTIVE"
},
  - "weekStart": "MONDAY",
  - "weeklyFilter": {
    - "group": "5b715448b079875110791111",
    - "subgroup": "5b715448b079875110792222"
},
  - "withoutDescription": false,
  - "zoomLevel": "WEEK"
},
- "fixedDate": true,
- "isPublic": false,
- "name": "Weekly 1",
- "type": "WEEKLY",
- "visibleToUserGroups": "\"[5b715448b079875110792222\", \"5b715448b079875110791111\"]",
- "visibleToUsers": [
  - "5b715448b079875110791234",
  - "5b715448b079875110791432",
  - "5b715448b079875110791324"
]
}`

## [](#tag/Shared-Report/operation/deleteSharedReportV1)Delete shared report

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| idrequired | string Example: 61794f784363c45af78e5555Represents shared report identifier across the system. |


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ecxxxxRepresents workspace identifier across the system. |


### Responses
**204 **

Success

 delete/v1/workspaces/{workspaceId}/shared-reports/{id}https://reports.api.clockify.me/v1/workspaces/{workspaceId}/shared-reports/{id}

## [](#tag/Shared-Report/operation/updateSharedReportV1)Update shared report

Updates shared report name and/or options


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ecxxxxRepresents workspace identifier across the system. |


| idrequired | string Example: 61794f784363c45af78e5555Represents shared report identifier across the system. |


##### Request Body schema: application/jsonrequired


| fixedDate | boolean Indicates whether the shared report has a fixed date range. |


| isPublic | boolean Indicates whether the shared report is public. |


| namerequired | string Represents shared reports name. |


| visibleToUserGroups | Array of strings unique Provide user groups ids to which the shared report is visible. |


| visibleToUsers | Array of strings unique Provide user ids to which the shared report is visible. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/shared-reports/{id}https://reports.api.clockify.me/v1/workspaces/{workspaceId}/shared-reports/{id}

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "fixedDate": false,
- "isPublic": false,
- "name": "Weekly Updated Report",
- "visibleToUserGroups": "\"[5b715448b079875110792222\", \"5b715448b079875110791111\"]",
- "visibleToUsers": [
  - "5b715448b079875110791234",
  - "5b715448b079875110791432",
  - "5b715448b079875110791324"
]
}`

## [](#tag/Team-Report)Team Report

## [](#tag/Team-Report/operation/generateAttendanceReport)Generate attendance report

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters

| workspaceIdrequired | string |


##### Request Body schema: application/json


| amountShown | string Enum: "EARNED" "COST" "PROFIT" "HIDE_AMOUNT" "EXPORT" If provided, you'll get filtered result including reports with provided amount shown. |
| amounts | Array of stringsItems Enum: "EARNED" "COST" "PROFIT" "HIDE_AMOUNT" "EXPORT" |


| approvalState | string Enum: "APPROVED" "UNAPPROVED" "ALL" If provided, you'll get filtered result including reports with provided approval state. |


| archived | boolean Indicates whether the report is archived |


| attendanceFilterrequired | object (AttendanceFilterV1) Represents attendance report filter. |


| billable | boolean Indicates whether the report is billable |
| clients | object (ContainsArchivedFilterV1) |
| currency | object (ContainsArchivedFilterV1) |
| customFields | Array of objects (CustomFieldFilterV1) |


| dateFormat | string Provide date in format YYYY-MM-DD |


| dateRangeEndrequired | string non-empty Provide date in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| dateRangeStartrequired | string non-empty Provide date in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| dateRangeType | string Enum: "ABSOLUTE" "TODAY" "YESTERDAY" "THIS_WEEK" "LAST_WEEK" "PAST_TWO_WEEKS" "THIS_MONTH" "LAST_MONTH" "THIS_YEAR" "LAST_YEAR" Provide date range type |


| description | string Represents search term for filtering report entries by description |


| detailedFilter | object (DetailedFilterV1) Represents detailed report filter. |


| exportType | string Enum: "JSON" "JSON_V1" "PDF" "CSV" "XLSX" "ZIP" If provided, you'll get filtered result including reports with provided export type. |


| invoicingState | string Enum: "INVOICED" "UNINVOICED" "ALL" If provided, you'll get filtered result including reports with provided invoicing state. |
| projects | object (ContainsArchivedFilterV1) |


| rounding | boolean Indicates whether the report filter is rounding |


| sortOrder | string Enum: "ASCENDING" "DESCENDING" If provided, you'll get sorted result by provided sort order. |


| summaryFilter | object (SummaryFilterV1) Represents summary report filter. |


| tags | object (ContainsTagFilterV1) Represents object for filtering entries by tags. |


| tasks | object (ContainsTaskFilterV1) Represents filter criteria for expenses associated with tasks. |


| timeFormat | string Provide time in format THH:MM:SS.ssssss |


| timeZone | string If provided, you'll get filtered result including reports with provided time zone. |
| userGroups | object (ContainsUsersFilterV1) |


| userLocale | string If provided, you'll get filtered result including reports with provided user locale. |
| users | object (ContainsUsersFilterV1) |


| weekStart | string Enum: "MONDAY" "TUESDAY" "WEDNESDAY" "THURSDAY" "FRIDAY" "SATURDAY" "SUNDAY" If provided, you'll get filtered result including reports with provided week start. |


| weeklyFilter | object (WeeklyFilterV1) Represents weekly report filter. |


| withoutDescription | boolean If set to 'true', report will only include entries with empty description |


| zoomLevel | string Enum: "WEEK" "MONTH" "YEAR" If provided, you'll get filtered result including reports with provided zoom level. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/reports/attendancehttps://reports.api.clockify.me/v1/workspaces/{workspaceId}/reports/attendance

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "amountShown": "COST",
- "amounts": [
  - "[EARNED, COST]"
],
- "approvalState": "APPROVED",
- "archived": false,
- "attendanceFilter": {
  - "breakFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "50"
}
],
  - "capacityFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "750"
}
],
  - "endFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "17:00"
}
],
  - "hasTimeOff": true,
  - "overtimeFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "150"
}
],
  - "page": 1,
  - "pageSize": 1,
  - "sortColumn": "NAME",
  - "startFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "15:00"
}
],
  - "workFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "750"
}
]
},
- "billable": true,
- "clients": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "currency": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "customFields": [
  - {
    - "id": "5b71544ab0798751107918b3",
    - "isEmpty": false,
    - "numberCondition": "EQUAL",
    - "type": "NUMBER",
    - "value": 2000
}
],
- "dateFormat": "2018-11-01",
- "dateRangeEnd": "2018-11-30T23:59:59.999Z",
- "dateRangeStart": "2018-11-01T00:00:00Z",
- "dateRangeType": "LAST_MONTH",
- "description": "some description keyword",
- "detailedFilter": {
  - "auditFilter": {
    - "duration": 2,
    - "durationShorter": false,
    - "withoutProject": false,
    - "withoutTask": true
},
  - "options": {
    - "totals": "CALCULATE"
},
  - "page": 1,
  - "pageSize": 20,
  - "sortColumn": "ID"
},
- "exportType": "JSON",
- "invoicingState": "INVOICED",
- "projects": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "rounding": false,
- "sortOrder": "ASCENDING",
- "summaryFilter": {
  - "groups": "\"[5b715448b07987511071111\", \"5b715448b079875110792222\"]",
  - "sortColumn": "GROUP",
  - "summaryChartType": "PROJECT"
},
- "tags": {
  - "containedInTimeentry": "CONTAINS_ONLY",
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "tasks": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "timeFormat": "T00:00:00",
- "timeZone": "Europe/Belgrade",
- "userGroups": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "userLocale": "en",
- "users": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "weekStart": "MONDAY",
- "weeklyFilter": {
  - "group": "5b715448b079875110791111",
  - "subgroup": "5b715448b079875110792222"
},
- "withoutDescription": false,
- "zoomLevel": "WEEK"
}`

## [](#tag/Time-Entry-Report)Time Entry Report

## [](#tag/Time-Entry-Report/operation/generateDetailedReport)Detailed report

Detailed report data on FREE subscription plan is limited to a maximum interval length of one year (366 days).


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ecxxxxRepresents workspace identifier across the system. |


##### Request Body schema: application/json


| amountShown | string Enum: "EARNED" "COST" "PROFIT" "HIDE_AMOUNT" "EXPORT" If provided, you'll get filtered result including reports with provided amount shown. |
| amounts | Array of stringsItems Enum: "EARNED" "COST" "PROFIT" "HIDE_AMOUNT" "EXPORT" |


| approvalState | string Enum: "APPROVED" "UNAPPROVED" "ALL" If provided, you'll get filtered result including reports with provided approval state. |


| archived | boolean Indicates whether the report is archived |


| attendanceFilter | object (AttendanceFilterV1) Represents attendance report filter. |


| billable | boolean Indicates whether the report is billable |
| clients | object (ContainsArchivedFilterV1) |
| currency | object (ContainsArchivedFilterV1) |
| customFields | Array of objects (CustomFieldFilterV1) |


| dateFormat | string Provide date in format YYYY-MM-DD |


| dateRangeEndrequired | string non-empty Provide date in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| dateRangeStartrequired | string non-empty Provide date in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| dateRangeType | string Enum: "ABSOLUTE" "TODAY" "YESTERDAY" "THIS_WEEK" "LAST_WEEK" "PAST_TWO_WEEKS" "THIS_MONTH" "LAST_MONTH" "THIS_YEAR" "LAST_YEAR" Provide date range type |


| description | string Represents search term for filtering report entries by description |


| detailedFilterrequired | object (DetailedFilterV1) Represents detailed report filter. |


| exportType | string Enum: "JSON" "JSON_V1" "PDF" "CSV" "XLSX" "ZIP" If provided, you'll get filtered result including reports with provided export type. |


| invoicingState | string Enum: "INVOICED" "UNINVOICED" "ALL" If provided, you'll get filtered result including reports with provided invoicing state. |
| projects | object (ContainsArchivedFilterV1) |


| rounding | boolean Indicates whether the report filter is rounding |


| sortOrder | string Enum: "ASCENDING" "DESCENDING" If provided, you'll get sorted result by provided sort order. |


| summaryFilter | object (SummaryFilterV1) Represents summary report filter. |


| tags | object (ContainsTagFilterV1) Represents object for filtering entries by tags. |


| tasks | object (ContainsTaskFilterV1) Represents filter criteria for expenses associated with tasks. |


| timeFormat | string Provide time in format THH:MM:SS.ssssss |


| timeZone | string If provided, you'll get filtered result including reports with provided time zone. |
| userGroups | object (ContainsUsersFilterV1) |


| userLocale | string If provided, you'll get filtered result including reports with provided user locale. |
| users | object (ContainsUsersFilterV1) |


| weekStart | string Enum: "MONDAY" "TUESDAY" "WEDNESDAY" "THURSDAY" "FRIDAY" "SATURDAY" "SUNDAY" If provided, you'll get filtered result including reports with provided week start. |


| weeklyFilter | object (WeeklyFilterV1) Represents weekly report filter. |


| withoutDescription | boolean If set to 'true', report will only include entries with empty description |


| zoomLevel | string Enum: "WEEK" "MONTH" "YEAR" If provided, you'll get filtered result including reports with provided zoom level. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/reports/detailedhttps://reports.api.clockify.me/v1/workspaces/{workspaceId}/reports/detailed

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "amountShown": "COST",
- "amounts": [
  - "[EARNED, COST]"
],
- "approvalState": "APPROVED",
- "archived": false,
- "attendanceFilter": {
  - "breakFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "50"
}
],
  - "capacityFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "750"
}
],
  - "endFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "17:00"
}
],
  - "hasTimeOff": true,
  - "overtimeFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "150"
}
],
  - "page": 1,
  - "pageSize": 1,
  - "sortColumn": "NAME",
  - "startFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "15:00"
}
],
  - "workFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "750"
}
]
},
- "billable": true,
- "clients": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "currency": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "customFields": [
  - {
    - "id": "5b71544ab0798751107918b3",
    - "isEmpty": false,
    - "numberCondition": "EQUAL",
    - "type": "NUMBER",
    - "value": 2000
}
],
- "dateFormat": "2018-11-01",
- "dateRangeEnd": "2018-11-30T23:59:59.999Z",
- "dateRangeStart": "2018-11-01T00:00:00Z",
- "dateRangeType": "LAST_MONTH",
- "description": "some description keyword",
- "detailedFilter": {
  - "auditFilter": {
    - "duration": 2,
    - "durationShorter": false,
    - "withoutProject": false,
    - "withoutTask": true
},
  - "options": {
    - "totals": "CALCULATE"
},
  - "page": 1,
  - "pageSize": 20,
  - "sortColumn": "ID"
},
- "exportType": "JSON",
- "invoicingState": "INVOICED",
- "projects": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "rounding": false,
- "sortOrder": "ASCENDING",
- "summaryFilter": {
  - "groups": "\"[5b715448b07987511071111\", \"5b715448b079875110792222\"]",
  - "sortColumn": "GROUP",
  - "summaryChartType": "PROJECT"
},
- "tags": {
  - "containedInTimeentry": "CONTAINS_ONLY",
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "tasks": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "timeFormat": "T00:00:00",
- "timeZone": "Europe/Belgrade",
- "userGroups": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "userLocale": "en",
- "users": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "weekStart": "MONDAY",
- "weeklyFilter": {
  - "group": "5b715448b079875110791111",
  - "subgroup": "5b715448b079875110792222"
},
- "withoutDescription": false,
- "zoomLevel": "WEEK"
}`

## [](#tag/Time-Entry-Report/operation/generateSummaryReport)Summary report

Summary report data on FREE subscription plan is limited to a maximum interval length of one year (366 days).


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ecxxxxRepresents workspace identifier across the system. |


##### Request Body schema: application/json


| amountShown | string Enum: "EARNED" "COST" "PROFIT" "HIDE_AMOUNT" "EXPORT" If provided, you'll get filtered result including reports with provided amount shown. |
| amounts | Array of stringsItems Enum: "EARNED" "COST" "PROFIT" "HIDE_AMOUNT" "EXPORT" |


| approvalState | string Enum: "APPROVED" "UNAPPROVED" "ALL" If provided, you'll get filtered result including reports with provided approval state. |


| archived | boolean Indicates whether the report is archived |


| attendanceFilter | object (AttendanceFilterV1) Represents attendance report filter. |


| billable | boolean Indicates whether the report is billable |
| clients | object (ContainsArchivedFilterV1) |
| currency | object (ContainsArchivedFilterV1) |
| customFields | Array of objects (CustomFieldFilterV1) |


| dateFormat | string Provide date in format YYYY-MM-DD |


| dateRangeEndrequired | string non-empty Provide date in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| dateRangeStartrequired | string non-empty Provide date in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| dateRangeType | string Enum: "ABSOLUTE" "TODAY" "YESTERDAY" "THIS_WEEK" "LAST_WEEK" "PAST_TWO_WEEKS" "THIS_MONTH" "LAST_MONTH" "THIS_YEAR" "LAST_YEAR" Provide date range type |


| description | string Represents search term for filtering report entries by description |


| detailedFilter | object (DetailedFilterV1) Represents detailed report filter. |


| exportType | string Enum: "JSON" "JSON_V1" "PDF" "CSV" "XLSX" "ZIP" If provided, you'll get filtered result including reports with provided export type. |


| invoicingState | string Enum: "INVOICED" "UNINVOICED" "ALL" If provided, you'll get filtered result including reports with provided invoicing state. |
| projects | object (ContainsArchivedFilterV1) |


| rounding | boolean Indicates whether the report filter is rounding |


| sortOrder | string Enum: "ASCENDING" "DESCENDING" If provided, you'll get sorted result by provided sort order. |


| summaryFilterrequired | object (SummaryFilterV1) Represents summary report filter. |


| tags | object (ContainsTagFilterV1) Represents object for filtering entries by tags. |


| tasks | object (ContainsTaskFilterV1) Represents filter criteria for expenses associated with tasks. |


| timeFormat | string Provide time in format THH:MM:SS.ssssss |


| timeZone | string If provided, you'll get filtered result including reports with provided time zone. |
| userGroups | object (ContainsUsersFilterV1) |


| userLocale | string If provided, you'll get filtered result including reports with provided user locale. |
| users | object (ContainsUsersFilterV1) |


| weekStart | string Enum: "MONDAY" "TUESDAY" "WEDNESDAY" "THURSDAY" "FRIDAY" "SATURDAY" "SUNDAY" If provided, you'll get filtered result including reports with provided week start. |


| weeklyFilter | object (WeeklyFilterV1) Represents weekly report filter. |


| withoutDescription | boolean If set to 'true', report will only include entries with empty description |


| zoomLevel | string Enum: "WEEK" "MONTH" "YEAR" If provided, you'll get filtered result including reports with provided zoom level. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/reports/summaryhttps://reports.api.clockify.me/v1/workspaces/{workspaceId}/reports/summary

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "amountShown": "COST",
- "amounts": [
  - "[EARNED, COST]"
],
- "approvalState": "APPROVED",
- "archived": false,
- "attendanceFilter": {
  - "breakFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "50"
}
],
  - "capacityFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "750"
}
],
  - "endFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "17:00"
}
],
  - "hasTimeOff": true,
  - "overtimeFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "150"
}
],
  - "page": 1,
  - "pageSize": 1,
  - "sortColumn": "NAME",
  - "startFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "15:00"
}
],
  - "workFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "750"
}
]
},
- "billable": true,
- "clients": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "currency": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "customFields": [
  - {
    - "id": "5b71544ab0798751107918b3",
    - "isEmpty": false,
    - "numberCondition": "EQUAL",
    - "type": "NUMBER",
    - "value": 2000
}
],
- "dateFormat": "2018-11-01",
- "dateRangeEnd": "2018-11-30T23:59:59.999Z",
- "dateRangeStart": "2018-11-01T00:00:00Z",
- "dateRangeType": "LAST_MONTH",
- "description": "some description keyword",
- "detailedFilter": {
  - "auditFilter": {
    - "duration": 2,
    - "durationShorter": false,
    - "withoutProject": false,
    - "withoutTask": true
},
  - "options": {
    - "totals": "CALCULATE"
},
  - "page": 1,
  - "pageSize": 20,
  - "sortColumn": "ID"
},
- "exportType": "JSON",
- "invoicingState": "INVOICED",
- "projects": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "rounding": false,
- "sortOrder": "ASCENDING",
- "summaryFilter": {
  - "groups": "\"[5b715448b07987511071111\", \"5b715448b079875110792222\"]",
  - "sortColumn": "GROUP",
  - "summaryChartType": "PROJECT"
},
- "tags": {
  - "containedInTimeentry": "CONTAINS_ONLY",
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "tasks": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "timeFormat": "T00:00:00",
- "timeZone": "Europe/Belgrade",
- "userGroups": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "userLocale": "en",
- "users": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "weekStart": "MONDAY",
- "weeklyFilter": {
  - "group": "5b715448b079875110791111",
  - "subgroup": "5b715448b079875110792222"
},
- "withoutDescription": false,
- "zoomLevel": "WEEK"
}`

## [](#tag/Time-Entry-Report/operation/generateWeeklyReport)Weekly report

Weekly report data on FREE subscription plan is limited to a maximum interval length of one year (366 days).


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ecxxxxRepresents workspace identifier across the system. |


##### Request Body schema: application/json


| amountShown | string Enum: "EARNED" "COST" "PROFIT" "HIDE_AMOUNT" "EXPORT" If provided, you'll get filtered result including reports with provided amount shown. |
| amounts | Array of stringsItems Enum: "EARNED" "COST" "PROFIT" "HIDE_AMOUNT" "EXPORT" |


| approvalState | string Enum: "APPROVED" "UNAPPROVED" "ALL" If provided, you'll get filtered result including reports with provided approval state. |


| archived | boolean Indicates whether the report is archived |


| attendanceFilter | object (AttendanceFilterV1) Represents attendance report filter. |


| billable | boolean Indicates whether the report is billable |
| clients | object (ContainsArchivedFilterV1) |
| currency | object (ContainsArchivedFilterV1) |
| customFields | Array of objects (CustomFieldFilterV1) |


| dateFormat | string Provide date in format YYYY-MM-DD |


| dateRangeEndrequired | string non-empty Provide date in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| dateRangeStartrequired | string non-empty Provide date in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| dateRangeType | string Enum: "ABSOLUTE" "TODAY" "YESTERDAY" "THIS_WEEK" "LAST_WEEK" "PAST_TWO_WEEKS" "THIS_MONTH" "LAST_MONTH" "THIS_YEAR" "LAST_YEAR" Provide date range type |


| description | string Represents search term for filtering report entries by description |


| detailedFilter | object (DetailedFilterV1) Represents detailed report filter. |


| exportType | string Enum: "JSON" "JSON_V1" "PDF" "CSV" "XLSX" "ZIP" If provided, you'll get filtered result including reports with provided export type. |


| invoicingState | string Enum: "INVOICED" "UNINVOICED" "ALL" If provided, you'll get filtered result including reports with provided invoicing state. |
| projects | object (ContainsArchivedFilterV1) |


| rounding | boolean Indicates whether the report filter is rounding |


| sortOrder | string Enum: "ASCENDING" "DESCENDING" If provided, you'll get sorted result by provided sort order. |


| summaryFilter | object (SummaryFilterV1) Represents summary report filter. |


| tags | object (ContainsTagFilterV1) Represents object for filtering entries by tags. |


| tasks | object (ContainsTaskFilterV1) Represents filter criteria for expenses associated with tasks. |


| timeFormat | string Provide time in format THH:MM:SS.ssssss |


| timeZone | string If provided, you'll get filtered result including reports with provided time zone. |
| userGroups | object (ContainsUsersFilterV1) |


| userLocale | string If provided, you'll get filtered result including reports with provided user locale. |
| users | object (ContainsUsersFilterV1) |


| weekStart | string Enum: "MONDAY" "TUESDAY" "WEDNESDAY" "THURSDAY" "FRIDAY" "SATURDAY" "SUNDAY" If provided, you'll get filtered result including reports with provided week start. |


| weeklyFilterrequired | object (WeeklyFilterV1) Represents weekly report filter. |


| withoutDescription | boolean If set to 'true', report will only include entries with empty description |


| zoomLevel | string Enum: "WEEK" "MONTH" "YEAR" If provided, you'll get filtered result including reports with provided zoom level. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/reports/weeklyhttps://reports.api.clockify.me/v1/workspaces/{workspaceId}/reports/weekly

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "amountShown": "COST",
- "amounts": [
  - "[EARNED, COST]"
],
- "approvalState": "APPROVED",
- "archived": false,
- "attendanceFilter": {
  - "breakFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "50"
}
],
  - "capacityFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "750"
}
],
  - "endFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "17:00"
}
],
  - "hasTimeOff": true,
  - "overtimeFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "150"
}
],
  - "page": 1,
  - "pageSize": 1,
  - "sortColumn": "NAME",
  - "startFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "15:00"
}
],
  - "workFilters": [
    - {
      - "filtrationType": "EXACTLY",
      - "value": "750"
}
]
},
- "billable": true,
- "clients": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "currency": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "customFields": [
  - {
    - "id": "5b71544ab0798751107918b3",
    - "isEmpty": false,
    - "numberCondition": "EQUAL",
    - "type": "NUMBER",
    - "value": 2000
}
],
- "dateFormat": "2018-11-01",
- "dateRangeEnd": "2018-11-30T23:59:59.999Z",
- "dateRangeStart": "2018-11-01T00:00:00Z",
- "dateRangeType": "LAST_MONTH",
- "description": "some description keyword",
- "detailedFilter": {
  - "auditFilter": {
    - "duration": 2,
    - "durationShorter": false,
    - "withoutProject": false,
    - "withoutTask": true
},
  - "options": {
    - "totals": "CALCULATE"
},
  - "page": 1,
  - "pageSize": 20,
  - "sortColumn": "ID"
},
- "exportType": "JSON",
- "invoicingState": "INVOICED",
- "projects": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "rounding": false,
- "sortOrder": "ASCENDING",
- "summaryFilter": {
  - "groups": "\"[5b715448b07987511071111\", \"5b715448b079875110792222\"]",
  - "sortColumn": "GROUP",
  - "summaryChartType": "PROJECT"
},
- "tags": {
  - "containedInTimeentry": "CONTAINS_ONLY",
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "tasks": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "timeFormat": "T00:00:00",
- "timeZone": "Europe/Belgrade",
- "userGroups": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "userLocale": "en",
- "users": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "weekStart": "MONDAY",
- "weeklyFilter": {
  - "group": "5b715448b079875110791111",
  - "subgroup": "5b715448b079875110792222"
},
- "withoutDescription": false,
- "zoomLevel": "WEEK"
}`

## [](#tag/Expense-Report)Expense Report

## [](#tag/Expense-Report/operation/generateDetailedReportV1)Generate expense report

Expense report data on FREE subscription plan is limited to a maximum interval length of one year (366 days).


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec6bbbRepresents workspace identifier across the system. |


##### Request Body schema: application/json


| approvalState | string Enum: "APPROVED" "UNAPPROVED" "ALL" Represents approval state |


| billable | boolean Indicates whether report is billable |
| categories | object (ContainsArchivedFilterV1) |
| clients | object (ContainsArchivedFilterV1) |
| currency | object (ContainsArchivedFilterV1) |


| dateRangeEndrequired | string non-empty Provide date in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| dateRangeStartrequired | string non-empty Provide date in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| dateRangeType | string Enum: "ABSOLUTE" "TODAY" "YESTERDAY" "THIS_WEEK" "LAST_WEEK" "PAST_TWO_WEEKS" "THIS_MONTH" "LAST_MONTH" "THIS_YEAR" "LAST_YEAR" Represents date range type of expense report |


| exportType | string Enum: "JSON" "JSON_V1" "PDF" "CSV" "XLSX" "ZIP" Represents export type |


| invoicingState | string Enum: "INVOICED" "UNINVOICED" "ALL" Represents invoicing state |


| note | string Represents search term for filtering report entries by note |


| page | integer <int32> >= 1 Page number. |


| pageSize | integer <int32> >= 1 Page size. |
| projects | object (ContainsArchivedFilterV1) |


| sortColumn | string Enum: "ID" "PROJECT" "USER" "CATEGORY" "DATE" "AMOUNT" Represents expenses sort column |


| sortOrder | string Enum: "ASCENDING" "DESCENDING" Represents sort order |


| tasks | object (ContainsTaskFilterV1) Represents filter criteria for expenses associated with tasks. |


| timeZone | string Represents time zone |
| userGroups | object (ContainsUsersFilterV1) |


| userLocale | string Represents user locale |
| users | object (ContainsUsersFilterV1) |


| weekStart | string Enum: "MONDAY" "TUESDAY" "WEDNESDAY" "THURSDAY" "FRIDAY" "SATURDAY" "SUNDAY" Represents week start |


| withoutNote | boolean If set to 'true', report will only include entries with empty note |


| zoomLevel | string Enum: "WEEK" "MONTH" "YEAR" Represents zoom level |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/reports/expenses/detailedhttps://reports.api.clockify.me/v1/workspaces/{workspaceId}/reports/expenses/detailed

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "approvalState": "APPROVED",
- "billable": true,
- "categories": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "clients": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "currency": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "dateRangeEnd": "2021-10-27T23:59:59.999Z",
- "dateRangeStart": "2021-10-27T00:00:00Z",
- "dateRangeType": "TODAY",
- "exportType": "JSON",
- "invoicingState": "INVOICED",
- "note": "some note keyword",
- "page": 1,
- "pageSize": 50,
- "projects": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "sortColumn": "ID",
- "sortOrder": "ASCENDING",
- "tasks": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "timeZone": "Europe/Budapest",
- "userGroups": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "userLocale": "en",
- "users": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715448b079875110792222",
    - "5b715448b079875110791111"
],
  - "status": "ACTIVE"
},
- "weekStart": "MONDAY",
- "withoutNote": false,
- "zoomLevel": "WEEK"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "expenses": [
  - {
    - "amount": 0.1,
    - "approvalRequestId": "5b715612b079875110791336",
    - "billable": true,
    - "categoryHasUnitPrice": true,
    - "categoryId": "5b715612b079875110791334",
    - "categoryName": "string",
    - "categoryUnit": "string",
    - "date": "2021-10-27T00:00:00Z",
    - "exportFields": [
      - "PROJECT"
],
    - "fileId": "5b715612b079875110791335",
    - "fileName": "string",
    - "id": "5b715612b079875110791122",
    - "invoicingInfo": {
      - "invoiceId": "string",
      - "manuallyInvoiced": true
},
    - "locked": true,
    - "notes": "Expenses Note",
    - "projectColor": "string",
    - "projectId": "5b715612b079875110791333",
    - "projectName": "string",
    - "quantity": 10,
    - "reportName": "string",
    - "time": "string",
    - "userEmail": "string",
    - "userId": "5b715612b079875110791121",
    - "userName": "string",
    - "userStatus": "string",
    - "workspaceId": "5b715612b079875110791121"
}
],
- "totals": {
  - "expensesCount": 2,
  - "totalAmount": 20,
  - "totalAmountBillable": 20
}
}`

## [](#tag/Balance-(Deprecated))Balance (Deprecated)

This endpoint group is deprecated. It will be available until 1st of July 2025. Use [Balance](#tag/Balance) instead.


## [](#tag/Balance-(Deprecated)/operation/getPtoBalancesForPolicy)Get balance by policy  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Balance](#tag/Balance/operation/getBalancesForPolicy) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| policyIdrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


##### query Parameters

| page | string <= 1000 Default: "1" Example: page=1 |
| page-size | string [ 1 .. 200 ] Default: "50" Example: page-size=50 |


| sort | string Enum: "USER" "POLICY" "USED" "BALANCE" "TOTAL" Example: sort=USERIf provided, you'll get result sorted by sort column. |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGSort results in ascending or descending order. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/balance/policy/{policyId}http://localhost:5050/v1/workspaces/{workspaceId}/balance/policy/{policyId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "balances": [
  - {
    - "balance": 20,
    - "id": "5b715448b079875110792222",
    - "negativeBalanceAmount": 2,
    - "negativeBalanceLimit": true,
    - "policyArchived": false,
    - "policyId": "5b715448b079875110793333",
    - "policyName": "Days",
    - "policyTimeUnit": "DAYS",
    - "total": 18,
    - "used": 2,
    - "userId": "5b715448b079875110791234",
    - "userName": "nicholas",
    - "workspaceId": "5b715448b079875110791111"
}
],
- "count": 2
}`

## [](#tag/Balance-(Deprecated)/operation/updateBalancesForUsers)Update balance  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Balance](#tag/Balance/operation/updateBalance) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| policyIdrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


##### Request Body schema: application/jsonrequired


| note | string Represents note attached to updating balance. |


| userIdsrequired | Array of strings unique Represents list of users' identifiers whose balance is to be updated. |


| valuerequired | number <double> [ -10000 .. 10000 ] Represents new balance value. |


### Responses
**204 **

No Content

 patch/v1/workspaces/{workspaceId}/balance/policy/{policyId}http://localhost:5050/v1/workspaces/{workspaceId}/balance/policy/{policyId}

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "note": "Bonus days added.",
- "userIds": [
  - "5b715448b079875110792222",
  - "5b715448b079875110791111"
],
- "value": 22
}`

## [](#tag/Balance-(Deprecated)/operation/getPtoBalancesForUser)Get balance by user  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Balance](#tag/Balance/operation/getBalancesForUser) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| userIdrequired | string Example: 60f924bafdaf031696ec6218Represents user identifier across the system. |


##### query Parameters


| page | integer <int32> <= 1000 Default: 1 Example: page=1Page number. |


| page-size | integer <int32> [ 1 .. 200 ] Default: 50 Example: page-size=50Page size. |


| sort | string Enum: "USER" "POLICY" "USED" "BALANCE" "TOTAL" Example: sort=POLICYSort result based on given criteria |


| sort-order | string Enum: "ASCENDING" "DESCENDING" Example: sort-order=ASCENDINGSort result by providing sort order. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/balance/user/{userId}http://localhost:5050/v1/workspaces/{workspaceId}/balance/user/{userId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "balances": [
  - {
    - "balance": 20,
    - "id": "5b715448b079875110792222",
    - "negativeBalanceAmount": 2,
    - "negativeBalanceLimit": true,
    - "policyArchived": false,
    - "policyId": "5b715448b079875110793333",
    - "policyName": "Days",
    - "policyTimeUnit": "DAYS",
    - "total": 18,
    - "used": 2,
    - "userId": "5b715448b079875110791234",
    - "userName": "nicholas",
    - "workspaceId": "5b715448b079875110791111"
}
],
- "count": 2
}`

## [](#tag/Policy-(Deprecated))Policy (Deprecated)

This endpoint group is deprecated. It will be available until 1st of July 2025. Use [Policy](#tag/Policy) instead.


## [](#tag/Policy-(Deprecated)/operation/findPtoPoliciesForWorkspace)Get policies on workspace  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Policy](#tag/Policy/operation/findPoliciesForWorkspace) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


##### query Parameters


| page | integer <int32> <= 1000 Default: 1 Example: page=1Page number. |


| page-size | string [ 1 .. 200 ] Example: page-size=50Page size. |


| name | string Example: name=HolidaysIf provided, you'll get a filtered list of policies that contain the provided string in their name. |


| status | string Enum: "ACTIVE" "ARCHIVED" "ALL" Example: status=ACTIVEIf provided, you'll get a filtered list of policies with the corresponding status. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/policieshttp://localhost:5050/v1/workspaces/{workspaceId}/policies

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "allowHalfDay": false,
  - "allowNegativeBalance": true,
  - "approve": {
    - "requiresApproval": true,
    - "specificMembers": false,
    - "teamManagers": false,
    - "userIds": [
      - "6579d126c2fe3b25f20ea001",
      - "6579d126c2fe3b25f20ea002"
]
},
  - "archived": true,
  - "automaticAccrual": {
    - "amount": 20,
    - "period": "YEAR",
    - "timeUnit": "DAYS"
},
  - "automaticTimeEntryCreation": {
    - "defaultEntities": {
      - "projectId": "string",
      - "taskId": "string"
},
    - "enabled": true
},
  - "everyoneIncludingNew": false,
  - "id": "5b715612b079875110791111",
  - "name": "Days",
  - "negativeBalance": {
    - "amount": 0.1,
    - "period": "MONTH",
    - "timeUnit": "DAYS"
},
  - "projectId": "string",
  - "timeUnit": "DAYS",
  - "userGroupIds": [
    - "5b715612b079875110791342",
    - "5b715612b079875110791324",
    - "5b715612b079875110793142"
],
  - "userIds": [
    - "5b715612b079875110791432",
    - "5b715612b079875110791234"
],
  - "workspaceId": "5b715612b079875110792222"
}
]`

## [](#tag/Policy-(Deprecated)/operation/createPtoPolicy)Create time off policy  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Policy](#tag/Policy/operation/createPolicy) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| allowHalfDay | boolean Indicates whether policy allows half days. |


| allowNegativeBalance | boolean Indicates whether policy allows negative balances. |


| approverequired | object (Approve) Provide approval settings. |


| archived | boolean Indicates whether policy is archived. |


| automaticAccrual | object (PtoAutomaticAccrualRequest) Provide automatic accrual settings. |


| automaticTimeEntryCreation | object (AutomaticTimeEntryCreationRequest) Provides automatic time entry creation settings. |


| color | string^#(?:[0-9a-fA-F]{6}){1}$ Provide color in format ^#(?:[0-9a-fA-F]{6}){1}$. Explanation: A valid color code should start with '#' and consist of six hexadecimal characters, representing a color in hexadecimal format. Color value is in standard RGB hexadecimal format. |


| everyoneIncludingNew | boolean Indicates whether the policy is to be applied to future new users. |


| namerequired | string Represents name of new policy. |


| negativeBalance | object (NegativeBalanceRequest) Provide the negative balance data you would like to use for updating the policy. |


| timeUnit | string Enum: "DAYS" "HOURS" Indicates time unit of the policy. |


| userGroups | object (PTOUserGroupIdsSchema) Provide list with user group ids and corresponding status. |


| users | object (PTOUserIdsSchema) Provide list with user ids and corresponding status. |


### Responses
**201 **

Created

 post/v1/workspaces/{workspaceId}/policieshttp://localhost:5050/v1/workspaces/{workspaceId}/policies

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowHalfDay": false,
- "allowNegativeBalance": true,
- "approve": {
  - "requiresApproval": true,
  - "specificMembers": false,
  - "teamManagers": false,
  - "userIds": [
    - "6579d126c2fe3b25f20ea001",
    - "6579d126c2fe3b25f20ea002"
]
},
- "archived": true,
- "automaticAccrual": {
  - "amount": 2,
  - "period": "MONTH",
  - "timeUnit": "DAYS"
},
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "color": "#8BC34A",
- "everyoneIncludingNew": false,
- "name": "Mental health days",
- "negativeBalance": {
  - "amount": 2,
  - "amountValidForTimeUnit": true,
  - "period": "MONTH",
  - "timeUnit": "DAYS"
},
- "timeUnit": "DAYS",
- "userGroups": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715612b079875110791111",
    - "5b715612b079875110791222"
],
  - "membershipStatuses": [
    - 0
],
  - "status": "ALL"
},
- "users": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715612b079875110791111",
    - "5b715612b079875110791222"
],
  - "membershipStatuses": [
    - 0
],
  - "status": "ALL"
}
}`

###  Response samples
- 201
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowHalfDay": false,
- "allowNegativeBalance": true,
- "approve": {
  - "requiresApproval": true,
  - "specificMembers": false,
  - "teamManagers": false,
  - "userIds": [
    - "6579d126c2fe3b25f20ea001",
    - "6579d126c2fe3b25f20ea002"
]
},
- "archived": true,
- "automaticAccrual": {
  - "amount": 20,
  - "period": "YEAR",
  - "timeUnit": "DAYS"
},
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "everyoneIncludingNew": false,
- "id": "5b715612b079875110791111",
- "name": "Days",
- "negativeBalance": {
  - "amount": 0.1,
  - "period": "MONTH",
  - "timeUnit": "DAYS"
},
- "projectId": "string",
- "timeUnit": "DAYS",
- "userGroupIds": [
  - "5b715612b079875110791342",
  - "5b715612b079875110791324",
  - "5b715612b079875110793142"
],
- "userIds": [
  - "5b715612b079875110791432",
  - "5b715612b079875110791234"
],
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Policy-(Deprecated)/operation/deletePtoPolicy)Delete policy  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Policy](#tag/Policy/operation/deletePolicy) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| idrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/policies/{id}http://localhost:5050/v1/workspaces/{workspaceId}/policies/{id}

## [](#tag/Policy-(Deprecated)/operation/getPtoPolicy)Get time off policy  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Policy](#tag/Policy/operation/getPolicy) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| idrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/policies/{id}http://localhost:5050/v1/workspaces/{workspaceId}/policies/{id}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowHalfDay": false,
- "allowNegativeBalance": true,
- "approve": {
  - "requiresApproval": true,
  - "specificMembers": false,
  - "teamManagers": false,
  - "userIds": [
    - "6579d126c2fe3b25f20ea001",
    - "6579d126c2fe3b25f20ea002"
]
},
- "archived": true,
- "automaticAccrual": {
  - "amount": 20,
  - "period": "YEAR",
  - "timeUnit": "DAYS"
},
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "everyoneIncludingNew": false,
- "id": "5b715612b079875110791111",
- "name": "Days",
- "negativeBalance": {
  - "amount": 0.1,
  - "period": "MONTH",
  - "timeUnit": "DAYS"
},
- "projectId": "string",
- "timeUnit": "DAYS",
- "userGroupIds": [
  - "5b715612b079875110791342",
  - "5b715612b079875110791324",
  - "5b715612b079875110793142"
],
- "userIds": [
  - "5b715612b079875110791432",
  - "5b715612b079875110791234"
],
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Policy-(Deprecated)/operation/updatePtoPolicyStatus)Change policy status  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Policy](#tag/Policy/operation/updatePolicyStatus) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| idrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


##### Request Body schema: application/jsonrequired


| statusrequired | string Enum: "ACTIVE" "ARCHIVED" "ALL" Provide the status you would like to use for changing the policy. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/policies/{id}http://localhost:5050/v1/workspaces/{workspaceId}/policies/{id}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "status": "ACTIVE"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowHalfDay": false,
- "allowNegativeBalance": true,
- "approve": {
  - "requiresApproval": true,
  - "specificMembers": false,
  - "teamManagers": false,
  - "userIds": [
    - "6579d126c2fe3b25f20ea001",
    - "6579d126c2fe3b25f20ea002"
]
},
- "archived": true,
- "automaticAccrual": {
  - "amount": 20,
  - "period": "YEAR",
  - "timeUnit": "DAYS"
},
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "everyoneIncludingNew": false,
- "id": "5b715612b079875110791111",
- "name": "Days",
- "negativeBalance": {
  - "amount": 0.1,
  - "period": "MONTH",
  - "timeUnit": "DAYS"
},
- "projectId": "string",
- "timeUnit": "DAYS",
- "userGroupIds": [
  - "5b715612b079875110791342",
  - "5b715612b079875110791324",
  - "5b715612b079875110793142"
],
- "userIds": [
  - "5b715612b079875110791432",
  - "5b715612b079875110791234"
],
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Policy-(Deprecated)/operation/updatePtoPolicy)Update policy  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Policy](#tag/Policy/operation/updatePolicy) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| idrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


##### Request Body schema: application/jsonrequired


| allowHalfDayrequired | boolean Indicates whether policy allows half day. |


| allowNegativeBalancerequired | boolean Indicates whether policy allows negative balance. |


| approverequired | object (Approve) Provide approval settings. |


| archivedrequired | boolean Indicates whether policy is archived. |


| automaticAccrual | object (PtoAutomaticAccrualRequest) Provide automatic accrual settings. |


| automaticTimeEntryCreation | object (AutomaticTimeEntryCreationRequest) Provides automatic time entry creation settings. |


| color | string^#(?:[0-9a-fA-F]{6}){1}$ Provide color in format ^#(?:[0-9a-fA-F]{6}){1}$. Explanation: A valid color code should start with '#' and consist of six hexadecimal characters, representing a color in hexadecimal format. Color value is in standard RGB hexadecimal format. |


| everyoneIncludingNewrequired | boolean Indicates whether the policy is shown to new users. |


| namerequired | string Provide the name you would like to use for updating the policy. |


| negativeBalance | object (NegativeBalanceRequest) Provide the negative balance data you would like to use for updating the policy. |


| userGroupsrequired | object (PTOUserGroupIdsSchema) Provide list with user group ids and corresponding status. |


| usersrequired | object (PTOUserIdsSchema) Provide list with user ids and corresponding status. |


### Responses
**200 **

OK

 put/v1/workspaces/{workspaceId}/policies/{id}http://localhost:5050/v1/workspaces/{workspaceId}/policies/{id}

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowHalfDay": true,
- "allowNegativeBalance": false,
- "approve": {
  - "requiresApproval": true,
  - "specificMembers": false,
  - "teamManagers": false,
  - "userIds": [
    - "6579d126c2fe3b25f20ea001",
    - "6579d126c2fe3b25f20ea002"
]
},
- "archived": false,
- "automaticAccrual": {
  - "amount": 2,
  - "period": "MONTH",
  - "timeUnit": "DAYS"
},
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "color": "#8BC34A",
- "everyoneIncludingNew": false,
- "name": "Days",
- "negativeBalance": {
  - "amount": 2,
  - "amountValidForTimeUnit": true,
  - "period": "MONTH",
  - "timeUnit": "DAYS"
},
- "userGroups": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715612b079875110791111",
    - "5b715612b079875110791222"
],
  - "membershipStatuses": [
    - 0
],
  - "status": "ALL"
},
- "users": {
  - "contains": "CONTAINS",
  - "ids": [
    - "5b715612b079875110791111",
    - "5b715612b079875110791222"
],
  - "membershipStatuses": [
    - 0
],
  - "status": "ALL"
}
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "allowHalfDay": false,
- "allowNegativeBalance": true,
- "approve": {
  - "requiresApproval": true,
  - "specificMembers": false,
  - "teamManagers": false,
  - "userIds": [
    - "6579d126c2fe3b25f20ea001",
    - "6579d126c2fe3b25f20ea002"
]
},
- "archived": true,
- "automaticAccrual": {
  - "amount": 20,
  - "period": "YEAR",
  - "timeUnit": "DAYS"
},
- "automaticTimeEntryCreation": {
  - "defaultEntities": {
    - "projectId": "string",
    - "taskId": "string"
},
  - "enabled": true
},
- "everyoneIncludingNew": false,
- "id": "5b715612b079875110791111",
- "name": "Days",
- "negativeBalance": {
  - "amount": 0.1,
  - "period": "MONTH",
  - "timeUnit": "DAYS"
},
- "projectId": "string",
- "timeUnit": "DAYS",
- "userGroupIds": [
  - "5b715612b079875110791342",
  - "5b715612b079875110791324",
  - "5b715612b079875110793142"
],
- "userIds": [
  - "5b715612b079875110791432",
  - "5b715612b079875110791234"
],
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Time-Off-(Deprecated))Time Off (Deprecated)

This endpoint group is deprecated. It will be available until 1st of July 2025. Use [Time Off](#tag/Time-Off) instead.


## [](#tag/Time-Off-(Deprecated)/operation/createPtoTimeOffRequest)Create time off request  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Time Off](#tag/Time-Off/operation/createTimeOffRequest) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| policyIdrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


##### Request Body schema: application/jsonrequired


| note | string Provide the note you would like to use for creating the time off request. |


| timeOffPeriodrequired | object (PtoTimeOffRequestPeriodV1Request) Provide the period you would like to use for creating the time off request. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/policies/{policyId}/requestshttp://localhost:5050/v1/workspaces/{workspaceId}/policies/{policyId}/requests

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "note": "Create Time Off Note",
- "timeOffPeriod": {
  - "halfDayPeriod": "NOT_DEFINED",
  - "isHalfDay": false,
  - "period": {
    - "days": 3,
    - "end": "2022-08-25",
    - "start": "2022-08-26"
}
}
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "balance": 1,
- "balanceDiff": 1,
- "createdAt": "2022-08-26T08:32:01.640708Z",
- "id": "5b715612b079875110791111",
- "note": "Time Off Request Note",
- "policyId": "5b715612b079875110792333",
- "policyName": "Days",
- "requesterUserId": "5b715612b0798751107925555",
- "requesterUserName": "John",
- "status": {
  - "changedAt": "2022-08-26T08:32:06.281873Z",
  - "changedByUserId": "5b715612b079875110799999",
  - "changedByUserName": "Sara",
  - "note": "Time Off Request Status Note",
  - "statusType": "APPROVED"
},
- "timeOffPeriod": {
  - "halfDay": true,
  - "halfDayHours": {
    - "end": "2022-08-26T21:59:59.999Z",
    - "start": "2022-08-25T22:00:00Z"
},
  - "halfDayPeriod": "string",
  - "period": {
    - "end": "2022-08-26T21:59:59.999Z",
    - "start": "2022-08-25T22:00:00Z"
}
},
- "timeUnit": "DAYS",
- "userId": "5b715612b079875110794444",
- "userName": "Nicholas",
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Time-Off-(Deprecated)/operation/deletePtoTimeOffRequest)Delete request  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Time Off](#tag/Time-Off/operation/deleteTimeOffRequest) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| policyIdrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


| requestIdrequired | string Example: 6308850156b7d75ea8fd3fbdRepresents time off request identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/policies/{policyId}/requests/{requestId}http://localhost:5050/v1/workspaces/{workspaceId}/policies/{policyId}/requests/{requestId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "balanceDiff": 1,
- "createdAt": "2022-08-26T08:32:01.640708Z",
- "id": "5b715612b079875110791111",
- "note": "Time Off Request Note",
- "policyId": "5b715612b079875110792333",
- "status": {
  - "changedAt": "2022-08-26T08:32:06.281873Z",
  - "changedByUserId": "5b715612b079875110799999",
  - "changedByUserName": "Sara",
  - "note": "Time Off Request Status Note",
  - "statusType": "APPROVED"
},
- "timeOffPeriod": {
  - "halfDay": true,
  - "halfDayHours": {
    - "end": "2022-08-26T21:59:59.999Z",
    - "start": "2022-08-25T22:00:00Z"
},
  - "halfDayPeriod": "string",
  - "period": {
    - "end": "2022-08-26T21:59:59.999Z",
    - "start": "2022-08-25T22:00:00Z"
}
},
- "userId": "5b715612b079875110794444",
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Time-Off-(Deprecated)/operation/changePtoTimeOffRequestStatus)Change time off request status  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Time Off](#tag/Time-Off/operation/changeTimeOffRequestStatus) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| policyIdrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


| requestIdrequired | string Example: 6308850156b7d75ea8fd3fbdRepresents time off request identifier across the system. |


##### Request Body schema: application/jsonrequired


| note | string Provide the note you would like to use for changing the time off request. |


| status | string Enum: "APPROVED" "REJECTED" Provide the status you would like to use for changing the time off request. |


### Responses
**200 **

OK

 patch/v1/workspaces/{workspaceId}/policies/{policyId}/requests/{requestId}http://localhost:5050/v1/workspaces/{workspaceId}/policies/{policyId}/requests/{requestId}

###  Request samples
- Payload
Content typeapplication/jsonCopy`{
- "note": "Time Off Request Note",
- "status": "APPROVED"
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "balanceDiff": 1,
- "createdAt": "2022-08-26T08:32:01.640708Z",
- "id": "5b715612b079875110791111",
- "note": "Time Off Request Note",
- "policyId": "5b715612b079875110792333",
- "status": {
  - "changedAt": "2022-08-26T08:32:06.281873Z",
  - "changedByUserId": "5b715612b079875110799999",
  - "changedByUserName": "Sara",
  - "note": "Time Off Request Status Note",
  - "statusType": "APPROVED"
},
- "timeOffPeriod": {
  - "halfDay": true,
  - "halfDayHours": {
    - "end": "2022-08-26T21:59:59.999Z",
    - "start": "2022-08-25T22:00:00Z"
},
  - "halfDayPeriod": "string",
  - "period": {
    - "end": "2022-08-26T21:59:59.999Z",
    - "start": "2022-08-25T22:00:00Z"
}
},
- "userId": "5b715612b079875110794444",
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Time-Off-(Deprecated)/operation/createPtoTimeOffRequestForOther)Create time off request for user  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Time Off](#tag/Time-Off/operation/createTimeOffRequestForOther) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


| policyIdrequired | string Example: 63034cd0cb0fb876a57e93adRepresents policy identifier across the system. |


| userIdrequired | string Example: 60f924bafdaf031696ec6218Represents user identifier across the system. |


##### Request Body schema: application/jsonrequired


| note | string Provide the note you would like to use for creating the time off request. |


| timeOffPeriodrequired | object (PtoTimeOffRequestPeriodV1Request) Provide the period you would like to use for creating the time off request. |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/policies/{policyId}/users/{userId}/requestshttp://localhost:5050/v1/workspaces/{workspaceId}/policies/{policyId}/users/{userId}/requests

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "note": "Create Time Off Note",
- "timeOffPeriod": {
  - "halfDayPeriod": "NOT_DEFINED",
  - "isHalfDay": false,
  - "period": {
    - "days": 3,
    - "end": "2022-08-25",
    - "start": "2022-08-26"
}
}
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "balance": 1,
- "balanceDiff": 1,
- "createdAt": "2022-08-26T08:32:01.640708Z",
- "id": "5b715612b079875110791111",
- "note": "Time Off Request Note",
- "policyId": "5b715612b079875110792333",
- "policyName": "Days",
- "requesterUserId": "5b715612b0798751107925555",
- "requesterUserName": "John",
- "status": {
  - "changedAt": "2022-08-26T08:32:06.281873Z",
  - "changedByUserId": "5b715612b079875110799999",
  - "changedByUserName": "Sara",
  - "note": "Time Off Request Status Note",
  - "statusType": "APPROVED"
},
- "timeOffPeriod": {
  - "halfDay": true,
  - "halfDayHours": {
    - "end": "2022-08-26T21:59:59.999Z",
    - "start": "2022-08-25T22:00:00Z"
},
  - "halfDayPeriod": "string",
  - "period": {
    - "end": "2022-08-26T21:59:59.999Z",
    - "start": "2022-08-25T22:00:00Z"
}
},
- "timeUnit": "DAYS",
- "userId": "5b715612b079875110794444",
- "userName": "Nicholas",
- "workspaceId": "5b715612b079875110792222"
}`

## [](#tag/Time-Off-(Deprecated)/operation/getPtoTimeOffRequests)Get all time off requests on workspace  Deprecated

This endpoint is deprecated. It will be available until 1st of July 2025. Use [Time Off](#tag/Time-Off/operation/getTimeOffRequest) instead.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 60f91b3ffdaf031696ec61a8Represents workspace identifier across the system. |


##### Request Body schema: application/jsonrequired


| end | string <date-time> Return time off requests created before the specified time in requester's time zone. Provide end in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| page | integer <int32> <= 1000 Default: 1 Page number. |


| pageSize | integer <int32> [ 1 .. 200 ] Default: 50 Page size. |


| start | string <date-time> Return time off requests created after the specified time in requester's time zone. Provide start in format YYYY-MM-DDTHH:MM:SS.ssssssZ |


| statuses | string Enum: "PENDING" "APPROVED" "REJECTED" "ALL" Filters time off requests by status. |


| userGroups | Array of strings unique Provide the user group ids of time off requests. |


| users | Array of strings unique Provide the user ids of time off requests.If empty will return time off requests of all users (with a maximum of 5000 users). |


### Responses
**200 **

OK

 post/v1/workspaces/{workspaceId}/requestshttp://localhost:5050/v1/workspaces/{workspaceId}/requests

###  Request samples
- Payload
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "end": "2022-08-26T23:55:06.281873Z",
- "page": 1,
- "pageSize": 50,
- "start": "2022-08-26T08:00:06.281873Z",
- "statuses": "[\"APPROVED\",\"PENDING\"]",
- "userGroups": [
  - "5b715612b079875110791342",
  - "5b715612b079875110791324",
  - "5b715612b079875110793142"
],
- "users": [
  - "5b715612b079875110791432",
  - "b715612b079875110791234"
]
}`

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "count": 1,
- "requests": [
  - {
    - "balance": 10,
    - "balanceDiff": 1,
    - "createdAt": "2022-08-26T08:32:01.640708Z",
    - "id": "5b715612b079875110791111",
    - "note": "Time Off Request Note",
    - "policyId": "5b715612b079875110792333",
    - "policyName": "Days",
    - "requesterUserId": "5b715612b0798751107925555",
    - "requesterUserName": "John",
    - "status": {
      - "changedAt": "2022-08-26T08:32:06.281873Z",
      - "changedByUserId": "5b715612b079875110799999",
      - "changedByUserName": "Sara",
      - "note": "Time Off Request Status Note",
      - "statusType": "APPROVED"
},
    - "timeOffPeriod": {
      - "halfDay": true,
      - "halfDayHours": {
        - "end": "2022-08-26T21:59:59.999Z",
        - "start": "2022-08-25T22:00:00Z"
},
      - "halfDayPeriod": "string",
      - "period": {
        - "end": "2022-08-26T21:59:59.999Z",
        - "start": "2022-08-25T22:00:00Z"
}
},
    - "timeUnit": "DAYS",
    - "userEmail": "nicholas@clockify.com",
    - "userId": "5b715612b079875110794444",
    - "userName": "Nicholas",
    - "userTimeZone": "Europe/Budapest",
    - "workspaceId": "5b715612b079875110792222"
}
]
}`

## [](#tag/Scheduling-(Deprecated))Scheduling (Deprecated)

This endpoint group contains deprecated endpoints from the [Scheduling](#tag/Scheduling) endpoint group.


## [](#tag/Scheduling-(Deprecated)/operation/getProjectTotals)Get all scheduled assignments per project  Deprecated

##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| search | string Default: "" Example: search=Project nameRepresents term for searching projects and clients by name. |


| startrequired | string Example: start=2020-01-01T00:00:00ZRepresents start date in yyyy-MM-ddThh:mm:ssZ format. |


| endrequired | string Example: end=2021-01-01T00:00:00ZRepresents end date in yyyy-MM-ddThh:mm:ssZ format. |


| page | integer <int32> Default: 1 Example: page=1Page number. |


| page-size | integer <int32> >= 1 Default: 50 Example: page-size=50Page size. |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/scheduling/assignments/projects/totalshttps://api.clockify.me/api/v1/workspaces/{workspaceId}/scheduling/assignments/projects/totals

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "assignments": [
    - {
      - "date": "2019-08-24T14:15:22Z",
      - "hasAssignment": true
}
],
  - "clientName": "Software Development",
  - "milestones": [
    - {
      - "date": "2020-01-01T08:00:00Z",
      - "id": "34a687e29ae1f428e7ebe303",
      - "name": "Q3",
      - "projectId": "5b641568b07987035750505e",
      - "workspaceId": "64a687e29ae1f428e7ebe303"
}
],
  - "projectArchived": true,
  - "projectBillable": true,
  - "projectColor": "#000000",
  - "projectId": "56b687e29ae1f428e7ebe504",
  - "projectName": "Software Development",
  - "totalHours": 490.5,
  - "workspaceId": "64a687e29ae1f428e7ebe303"
}
]`

## [](#tag/Workspace-(Deprecated))Workspace (Deprecated)

This endpoint group contains deprecated endpoints from the [Workspace](#tag/Workspace) endpoint group.


## [](#tag/Workspace-(Deprecated)/operation/removeMember)Remove user from workspace  Deprecated

This endpoint is not functional and has been deprecated. A user can be removed/deleted on the CAKE.com Account Members page after deactivating all their existing memberships on all workspaces within an organization.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


| userIdrequired | string Example: 89b687e29ae1f428e7ebe912Represents user identifier across the system. |


### Responses
**200 **

OK

 delete/v1/workspaces/{workspaceId}/users/{userId}https://api.clockify.me/api/v1/workspaces/{workspaceId}/users/{userId}

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "cakeOrganizationId": "67d471fb56aa9668b7bfa295",
- "costRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "currencies": [
  - {
    - "code": "USD",
    - "id": "5b641568b07987035750505e",
    - "isDefault": true
}
],
- "featureSubscriptionType": "PREMIUM",
- "features": [
  - "ADD_TIME_FOR_OTHERS",
  - "ADMIN_PANEL",
  - "ALERTS",
  - "APPROVAL"
],
- "hourlyRate": {
  - "amount": 10500,
  - "currency": "USD"
},
- "id": "64a687e29ae1f428e7ebe303",
- "imageUrl": "[https://www.url.com/imageurl-1234567890.jpg](https://www.url.com/imageurl-1234567890.jpg)",
- "memberships": [
  - {
    - "costRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "hourlyRate": {
      - "amount": 10500,
      - "currency": "USD"
},
    - "membershipStatus": "PENDING",
    - "membershipType": "PROJECT",
    - "targetId": "64c777ddd3fcab07cfbb210c",
    - "userId": "5a0ab5acb07987125438b60f"
}
],
- "name": "Cool Company",
- "subdomain": {
  - "enabled": true,
  - "name": "coolcompany"
},
- "workspaceSettings": {
  - "activeBillableHours": true,
  - "adminOnlyPages": "[\"PROJECT\",\"TEAM\",\"REPORTS\"]",
  - "automaticLock": {
    - "changeDay": "FRIDAY",
    - "dayOfMonth": 15,
    - "firstDay": "MONDAY",
    - "olderThanPeriod": "DAYS",
    - "olderThanValue": 5,
    - "type": "WEEKLY"
},
  - "canSeeTimeSheet": true,
  - "canSeeTracker": true,
  - "currencyFormat": "CURRENCY_SPACE_VALUE",
  - "defaultBillableProjects": true,
  - "durationFormat": "FULL",
  - "entityCreationPermissions": {
    - "whoCanCreateProjectsAndClients": "EVERYONE",
    - "whoCanCreateTags": "EVERYONE",
    - "whoCanCreateTasks": "EVERYONE"
},
  - "forceDescription": true,
  - "forceProjects": true,
  - "forceTags": true,
  - "forceTasks": true,
  - "isProjectPublicByDefault": true,
  - "lockTimeEntries": "2024-02-25T23:00:00Z",
  - "lockTimeZone": "Europe/Belgrade",
  - "multiFactorEnabled": true,
  - "numberFormat": "COMMA_PERIOD",
  - "onlyAdminsCanChangeBillableStatus": true,
  - "onlyAdminsCreateProject": true,
  - "onlyAdminsCreateTag": true,
  - "onlyAdminsCreateTask": true,
  - "onlyAdminsSeeAllTimeEntries": true,
  - "onlyAdminsSeeBillableRates": true,
  - "onlyAdminsSeeDashboard": true,
  - "onlyAdminsSeePublicProjectsEntries": true,
  - "projectFavorites": true,
  - "projectGroupingLabel": "Project Label",
  - "projectPickerSpecialFilter": true,
  - "round": {
    - "minutes": "15",
    - "round": "Round to nearest"
},
  - "timeRoundingInReports": true,
  - "timeTrackingMode": "DEFAULT",
  - "trackTimeDownToSecond": true
}
}`

## [](#tag/Entity-changes-(Experimental))Entity changes (Experimental)

For use case see [Entity Changes Use Cases](#tag/Entity-Changes-Use-Cases)


## [](#tag/Entity-changes-(Experimental)/operation/getDeletedEntityInfo)Deleted entities (Experimental)

This endpoint retrieves information of database collection(s) that have been deleted within the specified date range. The date range is determined by two parameters: start and end. Please note that deleted entities will be updated and reflected approximately one minute after deletion.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system (Experimental) |


##### query Parameters


| typerequired | Array of strings Example: type=TIME_ENTRYSpecifies the type of document to be retrieved. Expected values are TIME_ENTRY, TIME_ENTRY_CUSTOM_FIELD_VALUE and TIME_ENTRY_RATE.This parameter can accept multiple values, and at least one option must be provided. Based on the input, the application will return results corresponding to the selected document types. |


| start | string Example: start=2024-10-29T10:00:00ZRepresents the start date in yyyy-MM-ddThh:mm:ssZ format. This parameter is optional; if no start date is provided, the application will set a default start date that matches the end date to create a date range of 30 days. If the end date is not specified either, the default behavior will apply from the current date. |


| end | string Example: end=2024-11-28T10:00:00ZRepresents the end date in yyyy-MM-ddThh:mm:ssZ format. This parameter is optional; if no end date is provided, the application will set a default end date that matches the start date to create a date range of 30 days. |
| page | string Default: "0" |
| limit | string Default: "50" |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/entities/deletedhttps://api.clockify.me/api/v1/workspaces/{workspaceId}/entities/deleted

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `{
- "response": [
  - {
    - "deletedAt": "2019-08-24T14:15:22Z",
    - "deletionBinId": "string",
    - "document": { },
    - "documentType": "TIME_ENTRY",
    - "eligibleForRestore": true,
    - "id": "string"
}
]
}`

## [](#tag/Entity-changes-(Experimental)/operation/getUpdatedEntityInfo)Updated entities (Experimental)

This endpoint retrieves records from the database collection that have been updated within the specified date range. The date range is determined by two parameters: start and end.


##### Authorizations:
*ApiKeyAuth**AddonKeyAuth*

##### path Parameters


| workspaceIdrequired | string Example: 64a687e29ae1f428e7ebe303Represents workspace identifier across the system. |


##### query Parameters


| typerequired | Array of strings Example: type=TIME_ENTRYSpecifies the type of document to be retrieved. Expected values are TIME_ENTRY, TIME_ENTRY_CUSTOM_FIELD_VALUE and TIME_ENTRY_RATE.This parameter can accept multiple values, and at least one option must be provided. Based on the input, the application will return results corresponding to the selected document types. |


| start | string Example: start=2024-10-29T10:00:00ZRepresents the start date in yyyy-MM-ddThh:mm:ssZ format. This parameter is optional; if no start date is provided, the application will set a default start date that matches the end date to create a date range of 30 days. If the end date is not specified either, the default behavior will apply from the current date. |


| end | string Example: end=2024-11-28T10:00:00ZRepresents the end date in yyyy-MM-ddThh:mm:ssZ format. This parameter is optional; if no end date is provided, the application will set a default end date that matches the start date to create a date range of 30 days. |
| page | string Default: "0" |
| limit | string Default: "50" |


### Responses
**200 **

OK

 get/v1/workspaces/{workspaceId}/entities/updatedhttps://api.clockify.me/api/v1/workspaces/{workspaceId}/entities/updated

###  Response samples
- 200
Content typeapplication/jsonCopy Expand all  Collapse all `[
- {
  - "approvalStatus": "PENDING",
  - "auditMetadata": {
    - "createdAt": "2019-08-24T14:15:22Z",
    - "updatedAt": "2019-08-24T14:15:22Z"
},
  - "billable": true,
  - "description": "string",
  - "documentType": "TIME_ENTRY",
  - "id": "string",
  - "kioskId": "string",
  - "projectId": "string",
  - "tagIds": [
    - "string"
],
  - "taskId": "string",
  - "timeInterval": {
    - "duration": "PT1H30M",
    - "end": "2019-08-24T14:15:22Z",
    - "offsetEnd": 0,
    - "offsetStart": 0,
    - "start": "2019-08-24T14:15:22Z",
    - "timeZone": {
      - "id": "string",
      - "rules": {
        - "fixedOffset": true,
        - "transitionRules": [
          - {
            - "dayOfMonthIndicator": 0,
            - "dayOfWeek": "MONDAY",
            - "localTime": {
              - "hour": 0,
              - "minute": 0,
              - "nano": 0,
              - "second": 0
},
            - "midnightEndOfDay": true,
            - "month": "JANUARY",
            - "offsetAfter": {
              - "id": "string",
              - "totalSeconds": 0
},
            - "offsetBefore": {
              - "id": "string",
              - "totalSeconds": 0
},
            - "standardOffset": {
              - "id": "string",
              - "totalSeconds": 0
},
            - "timeDefinition": "UTC"
}
],
        - "transitions": [
          - {
            - "dateTimeAfter": "2019-08-24T14:15:22Z",
            - "dateTimeBefore": "2019-08-24T14:15:22Z",
            - "duration": {
              - "nano": 0,
              - "negative": true,
              - "positive": true,
              - "seconds": 0,
              - "units": [
                - {
                  - "dateBased": null,
                  - "durationEstimated": null,
                  - "timeBased": null
}
],
              - "zero": true
},
            - "gap": true,
            - "instant": "2019-08-24T14:15:22Z",
            - "offsetAfter": {
              - "id": "string",
              - "totalSeconds": 0
},
            - "offsetBefore": {
              - "id": "string",
              - "totalSeconds": 0
},
            - "overlap": true
}
]
}
},
    - "zonedEnd": "2019-08-24T14:15:22Z",
    - "zonedStart": "2019-08-24T14:15:22Z"
},
  - "type": "string",
  - "userId": "string",
  - "workspaceId": "string"
}
]`

## [](#tag/Entity-Changes-Use-Cases)Entity Changes Use Cases

This section presents a step-by-step use case of the Entity Changes API endpoints. While only a single use case is available at the moment, additional scenarios may be added in the future.


This documentation is intended to show developers how these endpoints can be integrated and used within their systems.


## [](#tag/Entity-Changes-Use-Cases/Entity-Changes-Based-on-Detailed-Report)Entity Changes Based on Detailed Report

This use case describes how to retrieve the detailed report as a starting point, then incrementally get changes of custom field values or [other type](#tag/Entity-Changes-Use-Cases/Entity-Changes-Based-on-Detailed-Report/Note)) (inserts, updates, and deletions) to keep data of time entry in sync.


## [](#tag/Entity-Changes-Use-Cases/Entity-Changes-Based-on-Detailed-Report/Step-1:-Get-Initial-Data-Using-the-Detailed-Report-API)Step 1: Get Initial Data Using the Detailed Report API

Use the Detailed Report API to fetch time entries for a specified date range. This initial data serves as the base dataset, which will be incrementally updated in subsequent steps without the need to refetch the entire detailed report.


Below is an example that fetches data from `May 1 to May 20, 2025`.


- **Use the `curl` command below:**


```
curl --location 'http://localhost:9090/workspaces/{WORKSPACE_ID}/reports/detailed' \
--header 'Accept: application/json' \
--data '{
    "dateRangeStart": "2025-05-01T00:00:00.000Z",
    "dateRangeEnd": "2025-05-20T23:59:59.999Z"
}'
```


- **Sample response:**


```
    {
      "timeentries": [
        {
          "_id": "1",
          "description": "Time entry 1",
          "timeInterval": {
            "start": "2025-05-18T01:00:00Z",
            "end": "2025-05-18T09:00:00.000Z"
          },
          "customFields": [
            {
              "customFieldId": "6808e9a6b77db953ea0d3f73",
              "value": "custom field value 1"
            }
          ]
        },
        {
          "_id": "2",
          "description": "Time entry 2",
          "timeInterval": {
            "start": "2025-05-19T01:00:00Z",
            "end": "2025-05-19T09:00:00.000Z"
          },
          "customFields": [
            {
              "customFieldId": "6808e9a6b77db953ea0d3f73",
              "value": "Custom field value 2"
            }
          ]
        }
      ]
    }
```


The response contains a detailed report of time entries from the specified date range. This data can be saved in a database and serve as the baseline for tracking incremental updates. From this baseline, you can retrieve updates at your preferred frequency—daily, weekly, or monthly—depending on your system’s requirements.


## [](#tag/Entity-Changes-Use-Cases/Entity-Changes-Based-on-Detailed-Report/Step-2:-Retrieve-Custom-Field-Value-Changes-for-Subsequent-Days)Step 2: Retrieve Custom Field Value Changes for Subsequent Days

Fetch incremental changes (inserts, updates) on custom field values of time entries for the days following the initial data range. For API specification see [Updated entities - Custom field values ](#tag/Entity-changes-(Experimental)/operation/getUpdatedEntityInfo)


After fetching the initial dataset in [`Step 1`](#tag/Entity-Changes-Use-Cases/Entity-Changes-Based-on-Detailed-Report/Step-1:-Get-Initial-Data-Using-the-Detailed-Report-API), use this step to retrieve any changes to custom field values on time entries for the days that follow.


Below is an example that fetches the changes occurring after the last date retrieved in the detailed report (e.g., after May 20, 2025).


- **Use the `curl` command below:**


```
curl -X GET
"http://localhost:8080/v1/workspaces/{WORKSPACE_ID}/entities/updated?type=TIME_ENTRY_CUSTOM_FIELD_VALUE&start=2025-05-21T00:00:00Z&end=2025-05-22T00:00:00Z&limit=30&page=1"
```


- **Sample response:**


```
  [
    {
      "auditMetadata": {
        "updatedAt": "2025-05-21T04:51:20Z",
        "createdAt": "2025-05-19T04:51:10Z"
      },
      "documentType": "TIME_ENTRY_CUSTOM_FIELD_VALUE",
      "id": "...",
      "customFieldId": "6808e9a6b77db953ea0d3f73",
      "timeEntryId": "2",
      "value": "Custom field value 2 - Updated"
        "sourceType": "TIMEENTRY"
    }
  ]
```


The response will include only custom field values that were created or updated within the specified date range. Each change is associated with a `timeEntryId`, indicating which time entries have been affected.


In the example response above, only the time entry with id=2 has been updated. This record should be updated in the previously stored dataset from [`Step 1`](#tag/Entity-Changes-Use-Cases/Entity-Changes-Based-on-Detailed-Report/Step-1:-Get-Initial-Data-Using-the-Detailed-Report-API)— to keep your data in sync without needing to refetch the full detailed report.


## [](#tag/Entity-Changes-Use-Cases/Entity-Changes-Based-on-Detailed-Report/Step-3:-Retrieve-or-Identify-Deleted-Custom-Field-Values)Step 3: Retrieve or Identify Deleted Custom Field Values

In addition to fetching created and updated custom field values, you also need to handle deletions. This step involves retrieving records of custom field values that were deleted after the initial detailed report date range.


The response will include references (such as timeEntryId and custom field identifiers) for the deleted entries. These indicate which custom field values should be removed from your previously stored dataset to maintain accurate and up-to-date records.


For more information about this API, see [Deleted entities - Custom field values ](#tag/Entity-changes-(Experimental)/operation/getDeletedEntityInfo)


Below is an example that fetches the deleted records after the last date retrieved in the detailed report in the [`Step 1`](#tag/Entity-Changes-Use-Cases/Entity-Changes-Based-on-Detailed-Report/Step-1:-Get-Initial-Data-Using-the-Detailed-Report-API) (e.g., after May 20, 2025).


- **Use the `curl` command below:**


```
curl -X GET "http://localhost:8080/v1/workspaces/{WORKSPACE_ID}/entities/deleted?type=TIME_ENTRY_CUSTOM_FIELD_VALUE&start=2025-05-21T00:00:00Z&end=2025-05-22T00:00:00Z&limit=30&page=1"
```


- **Sample response:**


```
  [
    {
      "id": "...",
      "deletionBinId": "....",
      "deletedAt": "2025-05-21T23:15:54.790Z",
      "documentType": "TIME_ENTRY_CUSTOM_FIELD_VALUE",
      "document": {
        "customFieldId": "6808e9a6b77db953ea0d3f73",
        "timeEntryId": "1",
        "value": "custom field value 1",
        "sourceType": "TIMEENTRY"
      }
    }
  ]
```


The response above shows which custom field values have been deleted. In this case, a specific custom field value for the `time entry with id=1` has been removed. This change should now be reflected in your system by updating the data initially fetched in [`Step 1`](#tag/Entity-Changes-Use-Cases/Entity-Changes-Based-on-Detailed-Report/Step-1:-Get-Initial-Data-Using-the-Detailed-Report-API)—either by deleting or archiving the corresponding record, based on your implementation.


## [](#tag/Entity-Changes-Use-Cases/Entity-Changes-Based-on-Detailed-Report/Note)Note

The above steps demonstrate how to retrieve incremental changes specifically for custom field values `(type=TIME_ENTRY_CUSTOM_FIELD_VALUE)`.


 The same approach can be applied to other data types by simply replacing the type parameter. Below are the currently supported types that follow the same incremental pattern:


- `TIME_ENTRY`

- `TIME_ENTRY_RATE`

- `TIME_ENTRY_CUSTOM_FIELD_VALUE`


 More types may be supported in the future as the system evolves.
