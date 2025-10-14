# Clockify Marketplace — Consolidated Notes

_Generated 2025-10-05 22:27_

## Table of Contents

1. [Clockify Add-on Quick Start Guide](#clockify-add-on-quick-start-guide)
2. [Getting Started](#getting-started)
3. [Authentication & authorization](#authentication-authorization)
4. [Environments](#environments)
5. [Window messages](#window-messages)
6. [Structured settings](#structured-settings)
7. [Lifecycle](#lifecycle)
8. [Lifecycle](#lifecycle)
9. [Definition](#definition)
10. [point to the user's interaction with your add-on.](#point-to-the-user-s-interaction-with-your-add-on)

# Clockify Add-on Quick Start Guide

_Source file: `dev-docs.marketplace.cake.com_clockify_build_manifest_lifecycle.html (2).txt`_

cakKe.com/| developers Q Developer portal More resources

Clockify Add-on Quick Start Guide

Developer account

Before starting our development process, we will need to create a CAKE.com developer account. A developer
account will allow us to publish, manage and monetize our add-ons as well as provide us with a testing
environment and workspace where the add-on can be installed and tested during development. You can learn

more about how to get started with the developer account

Let's get started with developing a simple add-on.
In this guide we'll build a new add-on from scratch and go through the development steps one by one, but first
we have to define what an add-on is.

Add-ons are software components that can be used to extend the functionalities of CAKE.com products. They
are technology-agnostic, meaning they can be developed using the languages and frameworks of your choice.

For this guide we will be writing our add-on in Java, using the CAKE.com and

Defining our add-on and its scope

Before starting our development process, we'll need to define how our add-on will look like and what it aims to

achieve.

For this guide, we will create a simple add-on which will add a new page to the Clockify's sidebar and will display
a statistic of the time tracked by the current user. As part of the guide we will implement and host a backend

service and also integrate our add-on into Clockify's Ul.

Setting up a new project

We'll start our development flow by creating a new project for our add-on. Let's call it “Time Reports”.

1. We'll create our first file named TimeReportsAddon.java, containing the following code:

package com.cake.marketplace.examples.timereports;
public class TimeReportsAddon {

public static void main(String[] args) {

bs

2. We'll need to set up our Maven dependencies. This step consists of three parts:

Configure and authenticate Github with maven as described in the following

Configure our package repository in the pom.xml file by adding the following snippet:

<repositories>
<repository>
<id>github</id>
<url>https://maven.pkg.github.com/clockify/addon-java-sdk</url>
</repository>
</repositories>

Configure our package dependency in the pom.xml file by adding the following snippet:

<dependencies>
<dependency>
<groupId>com.cake.clockify</groupId>
<artifactId>addon-sdk</artifactId>
<version>1.4.0</version>
</dependency>
</dependencies>

Building our manifest

Now that we have successfully set up our project and dependencies we can start working on the add-on itself.

First, let's briefly explain what a manifest is.

A manifest is a file which describes an add-on and its functionalities. Through the manifest you can define how

your add-on integrates with CAKE.com products.

The format of the manifest file depends on the CAKE.com product your add-on is targeting, but in general will
contain information about the add-on such as its identifier, name, permission scopes and other definitions that
describe how it will interact with the product. You can read more about the manifest, its syntax and various

options on the section of the documentation.

The Addon SDK provides a simple way to build and host our manifest file dynamically. Let's start by defining the

manifest object, and then we'll go over the details.

Our main() method will look like this:

public static void main(String[] args) throws Exception {
var manifest = ClockifyManifest.vl_3Builder()

.key("time-reports—-example")
.name ("Time Reports")
.baseUr1("")
.requireFreePlan()
.description ("Example add-on that displays time statistics")
.scopes(List.of(ClockifyScope.TIME_ENTRY_READ))
Lbuild();

Let's go over the lines step by step.
Builder interface

We'll start by using the builder interface to guide us through the steps needed to construct our manifest. The
manifest builder interface exposes one method for each supported schema version. In this guide we will use

version 1.3 of the manifest schema.
* Key

The add-on key acts as an identifier for our add-on and must be a unique value among all add-ons published on

the CAKE.com marketplace.
e Name

The add-on name is also a required field and must match the name under which the add-on gets published to

the CAKE.com marketplace. In the Ul, the name will be displayed on Clockify's add-on settings tab.
e Base URL

The base URL is the URL that will act as the base location for our add-on. Other paths will be defined relative to
this URL. We're setting it to an empty value at this point as we do not yet have a publicly available URL we can

use.
» Subscription plan

The minimal subscription plan is the minimum plan that Clockify workspaces must have in order to be able to
install and use our add-on. The requireFreePlan() method is a helper which sets the minimum required plan

value to ‘FREE’ Other supported values for the plan can be found on the manifest section.
* Description

The description field is an optional field, and can be populated with a short description of the add-on. The text

will be visible on Clockify's add-on settings tab.
e Scopes

Scopes are optional, but have to be defined if we intend to use certain features of the Clockify API. For our
example we need to request the TIME_ENTRY_READ scope since we will be making requests to the time entries

endpoint.

Building our Ul component

Now that we've built the manifest object, the next step will be to define and serve our Ul component. Let's start

by defining our component first, and then we'll get to the HTML part of the Ul.

var uiComponent = ClockifyComponent.builder()
.sidebar()
.allowEveryone()
.path("/sidebar-component")
.label("Time Reports")
.build();

In this guide we will be defining a single Ul component which will be shown as a separate entry on the sidebar.
» Builder

Similar to the manifest, we will use a builder interface to construct our component.

» Location

Specifies where the entry point where our component will be located. We've chosen the sidebar location for this
example, but there is a wide range of options that can be chosen depending on your use case. For more

information on the location field, visit the manifest’'s components section.
e Access

Specifies the type of permission the user must have in order to access our component. Supported values are
admins, or everyone. We will be showing our add-on to every user of the workspace. For more information on the

access field, visit the manifest's components section.
* Path

The path is a value relative to the base URL defined in the manifest. A GET request will be made to this location

every time the Ul component is loaded in Ul.

Ul components are loaded inside iframes and will always be supplied with an authentication token query
parameter, named as auth_token . This token can be used to identify and authenticate the user who is viewing

our component. For more information on the component's authentication, visit the section.
eo Label

The label is a text field whose value will be shown on the component's defined location - the sidebar in our case.

You can read more about the label under the manifest's components section.

Building our Ul

To build our Ul we will use the CAKE.com . Let's start by creating an empty sidebar-
component.html file under our resources folder.

* Import dependencies

Let's add the required imports for the Add-on Ul kit. For the purpose of this guide we will also be importing the

library which will be used to process time values.

<html>
<head>
<link
rel=" =
href=" =
/>
<script src=" "></scr
<script src=" "></script>
</head>
</html>

* Define Ul elements

Now that we've imported the Ul kit, our next step is to create a body tag and then define our Ul elements.

<body>

<div class="
<div class="
<div class=" " data-tab=" ">Time Reports</div>
</div>

<div class="

<div class= >

<p>Your total tracked time is: <span id=" "></span></p>
</div>
</div>
</div>

</body>

» Retrieving and decoding the authentication token

Our next goal will be to retrieve our time entries data through Clockify’s API and present a simple overview of the

total time tracked. The first thing that we need to do is to create a script section at the end of our file.

<script>

</script>

Next, we'll retrieve the authentication token that Clockify provides to our and use that token to make

a call to the

const token = new URLSearchParams (window. location.search).get('auth_token');

Clockify's add-ons can be installed on a wide range of environments, be it on a regional instance or even on

development test workspaces.

To ensure that add-ons can work independent of the environment where they are installed, we have to retrieve
all the environment-related information from the authentication token - which is in fact a . You can learn

more about the claims present in the JWT token on the following
For our component, we're mostly interested in the following three claims:

* backendUrl - the URL of the backend (environment) where our API calls will be made
« workspaceld - the ID of the workspace where our add-on was installed

o user - the ID of the user that is currently viewing our component

It should be noted that each authentication token that is supplied to the iframe only references a specific add-

on install on a single workspace.

This example will bypass the verification step and only retrieve the claims from the token, but it's strongly

recommended that production add-ons perform the proper validations before accepting the token as valid.

The JWT is signed with RSA256. The public key used to verify the token can be accessed on the following

const tokenPayload = .parse(atob(token.split('."')[1]));
const backendUrl = tokenPayload['backendUrl']

const workspaceId = tokenPayload['workspaceId']

const userId = tokenPayload['user']

« Interacting with the API
Now, it's time to make the API call.

While Clockify provides endpoints for generating reports, to keep it simple we're going to call the time entries

endpoint which can be found

Note that we're using the values we retrieved from the claims to construct the endpoint we're calling.

const oneWeekAgo = dateFns.subWeeks (new Date(), 1)

fetch (" ${backendUrl}/vl/workspaces/${workspaceId}/user/${userId}/time-entries?’ + new URL
headers: {"x-addon-token": token}, method: "GET"
+
).then(response => {
if (response.status !== 200) {
console. log ("Received status " + response.status)
return

let totalDurationSeconds = 0;

response. json().forEach(entry => {
const start = entry["timeInterval®]["start"]
const end = entry["timeInterval"]["end"]

const durationSeconds = dateFns.differenceInSeconds(dateFns.parseIS0(end), da
totalDurationSeconds += durationSeconds;

17

const element = document.getElementById("tracked-time");

if (totalDurationSeconds !== 0) {
const duration = dateFns.intervalToDuration({ start: @, end: totalDurationSec
element. textContent = dateFns.formatDuration(duration);

} else {

CT omrmmimd md ommdmmd  Mpmm Atm mmm mA

# Getting Started

_Source file: `dev-docs.marketplace.cake.com_clockify_build_manifest_lifecycle.html (8).txt`_

cakKe.com/| developers Q Developer portal More resources

Getting Started

Creating an account

Although you can start building your add-on prior to creating a developer account, you'll need the account to
make the first add-on version and start the add-on lifecycle, from creating to publishing. Go to the

page, create account and make new and exciting products with us.

How to create developer account?

In order to create an add-on version, or submit any piece of code for a review, you need to have a CAKE.com

Developer account.
To create an account:

1. Go to the Developer page
2. Choose Sign up
3. Enter email address in the box

4. Click Sign up

Verify your email by clicking on the verification link you received on your email address.
Verification link expires after 24 hours.

After your email is verified, you'll jump to the modal prompting you to create an account.

Create your CAKE.com Developer account

By creating an account, you accept our Terms of Use

Enter the following:

e Email
* Name

» Password
Accept our and click Create account to complete the process.

Use your account to create and edit your ) and access your

# Authentication & authorization

_Source file: `dev-docs.marketplace.cake.com_clockify_build_manifest_lifecycle.html (9).txt`_

cakKe.com/| developers Q Developer portal More resources

Authentication & authorization

Basics

In order to build add-ons for the Clockify app, CAKE.com Marketplace API needs to interact with the
. For an add-on to have access to the Clockify API, every request needs to have an X-Addon-Token header

with a valid add-on token.

Tokens and API keys that are provided to add-ons by Clockify are collectively called add-on tokens . Your add-
on tokens along with your API keys should be kept secret. There are several types of add-on tokens that an add-

on can receive, depending on the context. Each specific token type has its own use cases, as described below.

Rate limits

Requests to the Clockify API are rate limited. Please note that the limit is subject to change in the future. You can

read more about rate limits on the

If the limit is exceeded, a ‘Too many requests’ error will be returned.

Tokens

Installation token

The installation token is supplied as part of the installation payload if the add-on has defined an installed
lifecycle in its . For more information about lifecycle requests sent to add-ons, check out the

section.

This token is unique and is specific for each add-on installation on a given workspace. Each time an add-on gets
reinstalled a new payload will be provided. You can obtain this token by reading authToken property of

installed lifecycle hook payload. This token has admin privileges in the workspace and does not expire.

You must ensure the token value is kept a secret and is not leaked externally as it has full access over the

workspace.
If the add-on is uninstalled from the workspace, the installation token will no longer be valid.

Example usages

Installation tokens are intended to be used by the add-on's backend. They can be used in cases where full
access over the workspace is required, long-running operations, reporting etc. Installation tokens can also be

exchanged for for fine-grained access over a specific user.
Exchanging for a user token

There may be cases where you might want to use a rather than an installation token, for instance

when interacting with a user's profile.

To do so, Clockify exposes the following endpoint:

Request Headers:
Content-Type: application/json
X-Addon-Token: {installation token}

Request Endpoint:
{backendUr1}/addon/user/{userId}/token

The response body will be a string which will be the user token for the user specified by the ID. The generated

user token will work the same way as the that are supplied to iframes.

User token

The user token is supplied as a query parameter whenever a Ul component or a custom settings Ul is loaded into
Clockify. Ul components are loaded and rendered inside an iframe and the loaded URL will always contain a

query parameter named auth_token . This token is unique to each user of the add-on on a given workspace.

The user token acts on behalf of a single user, the user that is currently viewing the Ul component, and has a

lifespan of 30 minutes. After a token expires, a new one can be requested by dispatching the

As the token acts on behalf of a workspace user, it will have the same access and permissions as the user

does.

Differently from the installation token, the user token will also contain claims pertaining to the user such as role,

language, theme etc.
Example usages
User tokens can be used on both the add-on frontend and the add-on backend.

On the frontend, through Ul components, it can be used to interact and make requests to the Clockify API. All
requests made to the Clockify API will be on behalf of the current user and will share the same rate-limiting

quota.

On the backend, the user token can either be retrieved through the frontend or it can be retrieved by exchanging

the for a user token.

Webhook signature

A webhook signature is a type of token that is provided as a signature to verify the authenticity of webhook

requests.

Unlike the installation or user tokens, it cannot be used to authenticate and interact with the Clockify API. Its

purpose is strictly to be used for request verification.

This token contains a reduced set of claims which can be used to identify the workspace and the add-on

installation for which the event was triggered. Some of the available claims for this type of token are:

sub
workspaceId
addonId

You can read more about the above claims on the section

Claims

To provide more context on the where the add-on has been installed, both the installation and
user tokens will contain a set of claims that can be used to determine the location of the Clockify API

endpoints or retrieve more information about the installation.

The following set of claims is present in both installation and user token types:

"backendUrl": "https://api.clockify.me/api",
"reportsUrl": "https://reports.api.clockify.me",
"locationsUrl": "https://locations.api.clockify.me",
"screenshotsUrl": "https://screenshots.api.clockify.me",

"sub": "{add-on key}",
"workspaceId": "{workspace id}",
"user": "{user id}",

"addonId": "{add-on id}",

URL claims - the location of the API endpoints for the environment where the add-on is installed

sub - the sub field will be the same as the key that is defined in the add-on manifest. The sub is used to verify

that the token is signed on behalf of your add-on.

workspaceld - the ID of the workspace where the add-on is installed

user - the ID of the workspace owner (for installation tokens), or the ID of the user who is currently logged in

and viewing a Ul component (for user tokens)
¢ addonld - the ID of the add-on installation on the workspace
The following set of claims is present only in the user token type:
"language": "EN",

"theme": "DEFAULT",
"workspaceRole": "OWNER",

* language - the for the current user. You may use this to support multiple languages and

localized content for you add-on.

* theme - the for the current user. It is strongly recommended that your add-on uses the same

theme colors the user has configured on Clockify.

+ workspaceRole - the role of the current user on this workspace. Learn more about roles on the Clockify API

Token verification

All tokens signed by Clockify are tokens which are signed with the RSA256 algorithm

Tokens that Clockify may sign include:

« lifecycle signature
The following is a checklist of the steps that need to be taken to verify that an add-on token is valid:
1. Verify signature

Before accepting the token or any of its claims as valid, the signature should first be verified. To verify the

token's signature, you have to use the following X509 public key which is provided below in PEM format:

MIIBIjANBgkqhkiGO9w@BAQEFAAOCAQSAMIIBCgKCAQEAubktufFNO/op+E5WBWLG
/Y9QRZGSGGCsVOOFmMPR15AOmMS fQu3yq2Yaq47INOzgFy9IUG8/J]fwiehsmbrKa
49t/xSkpGlu9wlGUyY@g4eKDUwo fHKAt3IPwOSt4qsWLKIMO+koUo56CGQOEpTuUi
5bMfmefVBBfShXTaZ0tXPB349FdzSuY1U/503L12zVWMutNhiJCKyGfsuu2uXa9+
6uQnZBwlw03/QEci7i4TbC+ZXqW1lrCcbogSMORQHAP6qSACTFRmrjFAEsOWiUUhZ
rLDg2QJ8VTDghFnUhYkINTI1Ggfo80qEWeINLIwvZjOh3bWRfrqZHsD/Yjhoduké
yQIDAQAB

2. Verify token expiration
The token expiration should be checked and expired tokens should be rejected.
3. Verify token claims

The following claims must always match these values to verify that the token is being used for its intended

purpose:

iss=clockify
type=addon

The iss claim denotes that the issuer is Clockify and the type claim denotes that the intended usage for this

token is to be used by add-ons.

The sub claim must also be verified to match the expected value, which must always be the key defined in the

add-on

sub={add-on key}

Additional verification

signatures require an to verify that the provided signature is the correct one for the

expected event.

# Environments

_Source file: `dev-docs.marketplace.cake.com_clockify_build_manifest_lifecycle.html (10).txt`_

cakKe.com/| developers Q Developer portal More resources

Environments

Add-ons should be able to be installed on every Clockify workspace, irrespective of environment where the

workspace is located.

To ensure that add-ons will work on all environments, you should avoid making use of hardcoded values for API

endpoints and Ul locations and instead always retrieve environment-specific values from the token claims.
Different environments where a workspace can be located are:
* regions

Clockify workspaces can be located in each of the available regions. If a workspace is located on a region, the

entirety of the data for that workspace is also located in that region. Each region exposes its own API locations.
* subdomains

A Clockify workspace can also be located on a subdomain. Workspaces that are located on subdomains have

custom Ul locations. A workspace that is located on a subdomain can also be located on a specific region.
+ development environments

When , you may notice that the environment on which you have installed the add-on is a

completely separate one. The development environments use their own separate locations for all API endpoints.

Ensuring add-ons will work irrespective of the environment

To ensure that add-ons can work independent of the environment where they are installed, we have to retrieve

all the environment-related information from the - which is in fact a

The following claims can be used to determine the locations where API calls must be made for a specific

workspace:

"backendUrl": "https://api.clockify.me/api",
"reportsUrl": "https://reports.api.clockify.me",
"locationsUrl": "https://locations.api.clockify.me",
"screenshotsUrl": "https://screenshots.api.clockify.me",

The above claims represent the locations of the backend, reports, locations and screenshots API services.

Retrieving information related to the add-on installation

The add-on token contains other claims which may be used to identify the add-on installation and retrieve other

useful information such as the workspace where the add-on is installed, or the user that is currently logged in.

The following claims can be used to retrieve more info related to the add-on installation:

"sub": "{add-on key}",
"workspaceId": "{workspace id}",
"user": "{user id}",

"addonId": "{add-on id}",

sub - the sub field will be the same as the key that is defined in the add-on manifest. The sub is used to verify

that the token is signed on behalf of your add-on.

workspaceld - the ID of the workspace where the add-on is installed

user - the ID of the workspace owner (for installation tokens), or the ID of the user who is currently logged in

and viewing a Ul component (for user tokens)

addonld - the ID of the add-on installation on the workspace

The above claims are available for both and tokens.

Retrieving information related to the add-on user
Apart from the claims which provide information related to the environment where the add-on is installed, there
are also claims which provide information related to the user who is interacting with your add-on.

The following claims can be used to retrieve more info related to the user who is interacting with the add-on

"language": "EN",
"theme": "DEFAULT",
"workspaceRole": "OWNER",

* language - the for the current user. You may use this to support multiple languages and

localized content for you add-on.

* theme - the for the current user. It is strongly recommended that your add-on uses the same

theme colors the user has configured on Clockify.

+ workspaceRole - the role of the current user on this workspace. Learn more about roles on the Clockify API

The above claims are only available for

# Window messages

_Source file: `dev-docs.marketplace.cake.com_clockify_build_manifest_lifecycle.html (11).txt`_

cakKe.com/| developers Q Developer portal More resources

Window messages
Clockify uses the in order to allow add-on developers receive messages about specific

events and react accordingly.

Clockify supports two-way event communications, where the add-on can subscribe to specific events as well as

dispatch events that should trigger actions on the Clockify site.

Event subscription

Below is a sample snippet showing how to register a listener for an event:

handleWindowMessage = (message) => {
console. log(message.data. title)

}

window.addEventListener("message", (event) => handleWindowMessage(event))

Events
Events will contain the following fields:

message.data.title
message.data.body

The title field will be the name of the event. The body field will be an optional payload which depends on the

event type.
Current events that can be listened for are:

e URL_CHANGED

message.data.body={the URL}

ME_ENTRY_STARTED
ME_ENTRY_CREATED
ME_ENTRY_STOPPED

ME_ENTRY_DELETED

T
T
T
T
TIME_ENTRY_UPDATED
T

ME_TRACKING_SETTINGS_UPDATED

WORKSPACE_SETTINGS_UPDATED

PROFILE_UPDATED

USER_SETTINGS_UPDATED

The above events are not final and are subject to change in the future.

Event dispatch

In addition to listening for events that Clockify dispatches, the add-on can also interact with Clockify by

triggering its own events.
Current events that can be dispatched from the add-on are:

» refreshAddonToken - asks Clockify to refresh the add-on token for the user that is currently viewing the Ul

component. Learn more about tokens and their contexts on the section.

» preview - if dispatched from an add-on, it will ask Clockify to open a modal with the add-on's marketplace

listing.

* navigate - asks Clockify to navigate to the location specified by the type parameter. It requires the following

payload:

"type": "tracker"

bs

The following is a list of supported navigation locations:

— tracker

« toastrPop - asks Clockify to show custom toast messages on the Ul. It requires the following payload:

"type": "info" | "warning" | "success" | "error",
"message": "your message"

Toast messages will be shown on the bottom-right section of the screen. The color of the background depends

on the message type.

The following screenshot displays how an error toast would look like in the Ul:

Javascript Example

The following code example asks Clockify to display an error toast message like in the screenshot above.

window. top?.postMessage( .stringify({ action: "toastrPop", payload: { type: "error", mes

# Structured settings

_Source file: `dev-docs.marketplace.cake.com_clockify_build_manifest_lifecycle.html (7).txt`_

cakKe.com/| developers Q Developer portal More resources

Structured settings

Definition

TAB ONE

Tab one header

Tab one
Flat tab setting

flat tab setting value

Group nested in tab header

Group nested in tab

Group nested in tab link

Group nested in tab link

Structured settings are a way for you to easily and declaratively create a Ul for the settings of your add-on.

Structured settings are a great way to get started with building the settings for your add-on while ensuring they
integrate flawlessly with Clockify's Ul and follow the same as Clockify does. The structure of

the settings is flexible and capable of building and supporting complex settings structures and Uls.

Interactions
«Ul

Clockify handles building and rendering the Ul for the add-on settings, as well as persisting the settings

whenever they are updated.
* APIs

Clockify exposes a that add-ons can use to retrieve and update their settings for a particular

workspace.
« Lifecycle

Add-ons can subscribe to the lifecycle event to be notified whenever the settings are updated.

Properties

This section will briefly describe the structure of the settings definition. More details and possible values for a
particular field can be found under the definitions list of the for the manifest version that

you are targeting.

Settings are organized by nesting tabs and groups. Values and types of the settings must be compatible.

Tabs
Tabs are at the top level of hierarchy when defining settings.

Tabs cannot be nested in other tabs or groups, and they need to have at least one type of settings defined. If the

groups property is defined, it needs to have at least one settings property defined in it. For more information

on groups , check out the section.
Property Required Description
id yes Tab identifier
name yes Tab name, will be displayed on the Ul
header no Text shown on the settings header
settings no List of contained in the tab
groups no List of contained in the tab
Example
"settings": {
"tabs": [
{
"id": "Tab id",
"name": "Tab one title",
"header": {

"title": "Title text"

3
"groups": [
{
"id": "Group id",
"title": "Group one title",
"description": "Group description",
"header": {
"title": "Header title"
3
"settings": [
{
"id": "Setting id",
"name": "Default setting",
"description": "Description of default setting",
"placeholder": "Default setting here...",
"type": "TXT",
"value": "Value of default setting",
"required": true,
"copyable": true,
"readOnly": false,
"accessLevel": "ADMINS"
}
|
}
1h
"settings": [
{
"id": "Tab setting",
"name": "Tab setting",
"type": "TXT",
"value": "Some value",
"required": true,
"accessLevel": "EVERYONE"
}
|
bs
I}
|
Groups

Groups are a way to link related settings. Group can be part of tabs, and one tab can contain multiple groups.

Property Required Description
id yes Group identifier
title yes Group title, will be displayed on the Ul
description no Brief description the settings group
header no Text shown on the group header
settings yes List of contained in the group
Example
"groups": [
{

"id": "Group id",
"title": "Group one title",
"description": "Group description",
"header": {
"title": "Header title"
3
"settings": [
{
"id": "Setting id",
"name": "Default setting",
"description": "Description of default setting",
"placeholder": "Default setting here...",
"type": "TXT",
"value": "Value of default setting",
"required": true,
"copyable": true,
"readOnly": false,
"accessLevel": "ADMINS"

Settings

This is the actual settings object which defines the individual setting elements.

Property Required Description
id yes Unique identifier for the settings property
name yes Property name, will be displayed on the UI
description no Brief description of the property
placeholder no Placeholder that will be displayed if the value empty
type yes Settings’ type. Each type is displayed differently on the Ul
key no Serves as the key for the settings when retrieved as key value pairs

Settings’ value. It must match with the type of settings defined in the
value yes
type property

List of allowed values for settings of the dropdown type. *Required if type
allowedValues no*

of settings is DROPDOWN_SINGLE or DROPDOWN_MULTIPLE
required no Defines if the setting is required
copyable no Defines if a ‘Copy’ button will be added next to the setting value on the Ul
readOnly no Defines if the setting value is read-only
accesslLevel yes Defines the access level a user must have in order to access this setting

Example

"settings": [
{

"id": "Setting id",
"name": "Default setting",
"description": "Description of default setting",
"placeholder": "Default setting here...",
"type": "TXT",
"value": "Value of default setting",
"required": true,
"copyable": true,
"readOnly": false,
"accessLevel": "ADMINS"

Endpoints

Clockify exposes the following API endpoints which can be used to interact with the stored settings of an add-

on:
The requests to these APIs must be

Retrieving Settings

Headers:
X-Addon-Token: {token}

GET /addon/workspaces/{workspaceId}/settings

The endpoint requires the following parameters:

« workspaceld — ID of workspace where the add-on is installed, can be retrieved from the

The settings are specific to an add-on installation on a given workspace.

Sample Response:

"tabs": [

"name": "Tab one title",
"id": "tab one id",
"groups": [
{
"id": "group nested in tab",
"title": "Group title",
"description": "group description",
"header": {
"title": "Header title"
+
"settings": [
{
"id": "Setting id",
"name": "Default setting",
"description": "Description of default setting",
"placeholder": "Default setting here...",
"type": "TXT",
"value": "Value of default setting",
"required": true,
"copyable": true,
"readOnly": false,
"accessLevel": "ADMINS"

1
"header": {
"title": "title header 2"
H
"settings": [
{
"id": "Setting id 2",
"name": "Default setting",
"description": "Description of default setting",
"placeholder": "Default setting here...",
"type": "TXT",
"value": "Value of default setting 2",
"required": true,
"copyable": true,
"readOnly": false,
"accessLevel": "ADMINS"

Updating settings

The following endpoint can be used to update one or more add-on settings by providing the unique settings IDs.

Headers:
X-Addon-Token: {token}

PATCH /addon/workspaces/{workspaceId}/settings

{
"id": "settingId",
"value": "New value of setting"
bs
|

# Lifecycle

_Source file: `dev-docs.marketplace.cake.com_clockify_build_manifest_lifecycle.html (4).txt`_

caKe.com| developers Q Developer portal More resources

Lifecycle

Definition

The lifecycle of an add-on consists of all the steps beginning from when it's installed until when the add-on gets

uninstalled.
Throughout its lifecycle whe add-on may be in one of the two states:

« active - it's loaded on the Clockify Ul, receives events and can interact with the Clockify API
« inactive - it's not loaded and cannot interact with Clockify, but it's still installed and all the user data are still
kept

A general lifecycle of an add-on includes the following events:

* Installed
» Status changed
» Settings updated

* Deleted

Types

Installed
Add-on is installed on a workspace.

To receive this event, the add-on must declare the INSTALLED lifecycle hook as part of its lifecycles. During

installation, a lifecycle event is triggered and the add-on is provided with the installation context and a set of

It is important to note that this payload will only be supplied once for each add-on installation.

We recommend persisting the installation payload in your database if your add-on meets, or plans to meet in the

future, the use cases where an may be needed.

Example of a payload that is sent as part of the INSTALLED event:

Request Headers
Content-Type : application/json
X-Addon-Lifecycle-Token : {{token}}

"addonId": "62ddf9b201f42e74228efa3c",
"authToken": "{{token}}",
"workspaceId": "60332d61ff30282b1f23e624",
"asUser": "60348d63df70d82b7183e635",
"apiurl": "{{apiUrl}}",
"addonUserId": "la2b3c4d5e6f7g8h9i0j1k21",
"webhooks": [{
"path": "https://example.com/webhook"
"webhookType": "ADDON"
"authToken": "{{token}}"
H,

The authToken is an API token that can be used to make authenticated requests to the Clockify API. For more

information, read the sectuib.

Status changed
After installation, the add-on is automatically enabled and becomes active.

There are cases where the user may choose to deactivate an add-on instead of uninstalling it, for instance if they

do not wish to use the add-on at the present but still want to preserve their settings and configurations.
To receive this event, the add-on must declare the STATUS_CHANGED lifecycle hook as part of its lifecycles.
Example of a payload that is sent as part of the STATUS_CHANGED event:

Request Headers

Content-Type : application/json
X-Addon-Lifecycle-Token : {{token}}

{
"addonId": "62ddf9b201f42e74228efa3c",
"workspaceId": "60332d61ff30282b1f23e624",
"status": "INACTIVE"

}

The status values can be either ACTIVE or INACTIVE

Settings updated

An add-on can have its defined inside the manifest. In these cases, the add-on can subscribe
to the SETTINGS_UPDATED lifecycle hook to be notified anytime one of its users updates the settings for the

add-on.
Example of a payload that is sent as part of the SETTINGS_UPDATED event:
Request Headers

Content-Type : application/json
X-Addon-Lifecycle-Token : {{token}}

{
"workspaceId": "60332d61ff30282b1f23e624",
"addonId": "62ddf9b201f42e74228efa3c",
"settings": [
{
"id": "txt-setting",
"name": "Txt setting",
"value": "Some text"
}
{
"id": "link-setting",
"name": "Link setting",
"value": "https://clockify.me"
}
{
"id": "number-setting",
"name": "Number setting",
"value": 5
}
{
"id": "checkbox-setting",
"name": "Checkbox setting",
"value": true
}
{
"id": "dropdown-single-setting",
"name": "Dropdown single setting",
"value": "option 1"
}
{
"id": "dropdown-multiple-setting",
"name": "Dropdown multiple setting",
"value": [
"option 1",
"option 2"
]
}
|
}
Deleted

When an add-on is deleted from a workspace, a lifecycle event is triggered and the add-on is provided with the
context for the installation that is being uninstalled. All the that are provided to the add-on become
invalid and from that moment on, the add-on can no longer interact with the Clockify API on behalf of the

workspace user.
Example of a payload that is sent as part of the DELETED event:
DELETED
Request Headers

Content-Type : application/json
X-Addon-Lifecycle-Token : {{token}}

{
"addonId": "62ddf9b201f42e74228efa3c",
"workspaceId": "60332d61ff30282b1f23e624",
"asUser": '60348d63df70d82b7183e635"
}

# Lifecycle

_Source file: `dev-docs.marketplace.cake.com_clockify_build_manifest_lifecycle.html.txt`_

cake.com | developers

Quick Start
BUILD
Manifest v
Lifecycle
Ul Components
Webhooks
Settings
Developer Account
Authentication and Authorization
Environment and Regions
Window Events
PUBLISH
Development Checklist
Publishing and Guidelines

Private addon deployment
IS the visual representation ot an add-on that is displayed to users. Add-ons that don’t contain a Ul can also

be developed.

How does add-on hosting infrastructure work?

Add-on resources are not hosted by CAKE.com. You must host all the resources needed for an add-on to
function, including a manifest file, a database, a web server to handle communication with Clockify and any other

integral part of an add-on e.g. Ul.

You need to make sure that all the resources mentioned above are working and accessible.

How does the add-on interact with the Clockify API?

An add-on interacts with by supplying an as part of the X-Addon-Token

header. This authentication token will be commonly called the add-on token throughout the documentation.

There are several ways this token can be retrieved, as well as several that are available. The two

primary ways an add-on token can be retrieved are:

» during installation as part of the installed

* when a is loaded

How does the add-on Ul integrate with Clockify?
An add-on can define its Ul elements in the manifest by defining

Ul components are entry points to the Ul of the add-on. They are HTML pages which Clockify loads inside
in order to integrate them into Clockify's Ul. There are of Ul components, each with its

own locations, that can be configured.

How does the add-on Ul interact with Clockify?

Ul components can interact with Clockify in several ways:

* by calling the

by calling the add-on backend, which in turn interacts with the Clockify API
by listening to or dispatching

Ul components are loaded and rendered inside iframes. At the time they are loaded, the components are
provided with an that they can use in order to communicate with the Clockify API. This
authentication token will also contain a that can be used to retrieve information regarding the

environment, the workspace and the user that is currently viewing the Ul.

How do add-on settings work?
There are two ways an add-on can display an interface for its settings:
Using configurable no-code Ul

Add-on settings can be defined in the with Clockify taking care of both rendering them to the user and
storing the data. This approach is the fastest way to get started with building add-ons and supports building
customizable settings screens in a straightforward way. Visit the section for more

information.
» Using a custom settings Ul

An add-on can be configured to define and host its own settings screen. This setup can be beneficial if the Ul is
complex, if you'd like to store settings in your own infrastructure, or if the settings need to follow a specific

design. The settings Ul will work the same as any other

How does an add-on work?
After an add-on is installed, it's added to the workspace and loaded whenever a user loads the Clockify app.
There are several ways in which Clockify interacts with the add-on:

« Lifecycle events: Add-on receives events when installed, deleted, if its settings are updated, or status is

changed
* Webhooks: Add-on receives webhooks for all the events it has subscribed to on the manifest
+ Components: Add-on receives requests to render a component whenever a user navigates to it

» Components Window Messages: Add-on components can receive after they are loaded

An add-on can work in both interactive (responding to user interactions or events) and non-interactive

(responding to Clockify webhooks or processing server side jobs) ways.

Can new features be added after an add-on is published?
You can add new features or improve existing ones after an add-on is published.

However, there are certain changes that require updating the manifest and/or other data such as the add-on

name and the listing that are required to go through an approval process.

Changes to the manifest, such as adding or updating components, lifecycle webhooks or scopes, will only take

effect after a new version of the add-on is approved and published.

Developer Resources

Add-on code examples

are used to demonstrate how to use add-on's specific features or functionality. These
examples are tested and functional, therefore you can use them as a reference and build upon them to create

your own custom integrations.
Add-on SDK

is written in Java and aims to help you with the development of your add-ons. It contains various
modules to help you with the development, including schema models, validators, helpers, as well as support for

web frameworks.
Add-on web components

Add-on web components are a set of components and CSS styles aimed to help you develop your Uls, and, at
the same time maintain a design style that is consistent with the . For more information,

visit the Add-on web components

Next steps

For further information on how add-ons work in practice and how to develop an add-on you can read our

# Definition

_Source file: `dev-docs.marketplace.cake.com_clockify_build_manifest_lifecycle.html (6).txt`_

cakKe.com/| developers Q Developer portal More resources

Webhooks

Definition

Webhooks are a way for your add-on to respond to events and triggers in real-time without the user directly

interacting with the add-on Ul itself. They can be used to integrate your add-on with Clockify in a seamless way.

Webhook messages are automatically sent by Clockify whenever an event that the add-on has subscribed to is
triggered. Clockify provides a variety of that an add-on can subscribe to according to its

needs.

Types

There are different types of webhooks that your add-on can subscribe to. The webhooks that are available for

your add-on depend on the specific version of the that you choose.

Generally, the following webhooks are available to add-ons:

NEW_PROJECT
PROJECT_UPDATED
PROJECT_DELETED

NEW_TASK

TASK_UPDATED

TASK_DELETED

NEW_CLIENT

CLIENT_UPDATED
CLIENT_DELETED

NEW_TAG

TAG_UPDATED

TAG_DELETED
NEW_TIMER_STARTED
TIMER_STOPPED
TIME_ENTRY_UPDATED
TIME_ENTRY_DELETED
NEW_TIME_ENTRY
NEW_INVOICE
INVOICE_UPDATED
USER_JOINED_WORKSPACE
USER_DELETED_FROM_WORKSPACE
USER_DEACTIVATED_ON_WORKSPACE
USER_ACTIVATED_ON_WORKSPACE
USER_EMAIL_CHANGED
USER_UPDATED
NEW_APPROVAL_REQUEST
APPROVAL_REQUEST_STATUS_UPDATED
TIME_OFF_REQUESTED
TIME_OFF_REQUEST_APPROVED
TIME_OFF_REQUEST_REJECTED
TIME_OFF_REQUEST_WITHDRAWN
BALANCE_UPDATED
USER_GROUP_CREATED
USER_GROUP_UPDATED
USER_GROUP_DELETED
EXPENSE_CREATED
EXPENSE_UPDATED
EXPENSE_DELETED
ASSIGNMENT_CREATED
ASSIGNMENT_UPDATED
ASSIGNMENT_DELETED
ASSIGNMENT_PUBLISHED

You can test and visualize how the webhooks work and their respective payloads by triggering and listening for

the events on your

Requests

Webhook requests are POST requests that are sent to notify the add-on of events it has subscribed to. Each
specific event will contain its specific payload as well as an accompanying that can be used to verify
the request. After installing an add-on, you can view a list of all the registered webhooks by navigating to the

add-ons tab and clicking on the webhooks option.

fy Google meeting cancellation

A list of all the registered webhooks along with their endpoints will be displayed.

0) TIME TRACKER
Addons

Google meeting cancellation Webhooks

You can access a webhook's logs by clicking on the webhook event. The logs will contain information such as

the timestamp when the request was made, the HTTP status as well as the request and response bodies.

Add-ons / Webhaoks

TIME_OFF_REQUESTED

e off requested

Logs older than 7 days are deleted

Webhook logs are deleted after 7 days.

Signature

Each webhook that is dispatched by Clockify will contain a signature that can be used to verify its authenticity. A

typical webhook request will contain the following request headers:

clockify-signature — this represents the token that is signed on behalf of a single webhook tyj
clockify-webhook-event-type — this represents the event that triggered the webhook, must be one

Webhook token

The webhook token supplied as part of the clockify-signature headers does not expire. It contains the

following claims that can be used to verify its authenticity and determine its context:

iss": "clockify",

"sub": "{add-on key}",

"type": "addon",

"workspaceId": "{workspace id}",
"addonId": "{add-on id}"

iss - the issuer of a JWT will always be clockify

sub - the sub must be the same as the add-on key

type - the type of a JWT will always be addon

workspaceld - the ID where the add-on is installed and where the event was triggered

addonld - the ID of the add-on installation on the workspace

Authenticity

There are a couple of precautions that we must take to verify a webhook's authenticity and prevent request

spoofing.
1. Verify the JWT

The JWT token must be verified and the issuer and the sub claims must match the expected values for our add-

on. To learn more about the tokens, visit the section.
2. Assert the webhook type is the one you expect

You must assert that the webhook types and the payloads supplied with the request match the webhook types

that you expect for each endpoint.
3. Compare webhook tokens

When an add-on which has defined an gets installed on a workspace, an installation payload is
provided along with the installed event. If the add-on has defined webhooks in its manifest, the payload will

contain information regarding registered webhooks as well as the webhook token for each of them.

{
"webhooks": [
{
"authToken": "{IJWT for the webhook}",
"path": "{path defined in the manifest}",
"webhookType': "ADDON"
+
| ’
+

It is recommended that add-ons retrieve and store the authToken for each registered webhook, so that it can

later be used to verify the authenticity of the requests.

The webhook token does not expire, and the same token registered for a particular webhook will be sent as part

of the clockify-signature header for every webhook event of that type that is triggered on the workspace.

# point to the user's interaction with your add-on.

_Source file: `dev-docs.marketplace.cake.com_clockify_build_manifest_lifecycle.html (5).txt`_

cakKe.com/| developers Q Developer portal More resources

Ul Components

The Ul components are pages which are used to integrate your add-ons Ul with Clockify. They serve as an entry

point to the user's interaction with your add-on.

Ul components are served as HTML pages and loaded inside when redered on the Clockify site. At the
time of loading, components will be provided with the relevant context they need in order to function such as an

as well as information the current location on the app and

Entrypoints to your components can be added to a variety of available on the Clockify site.
Definition

Ul components must be defined in the . They contain information about the location, label, icon
and other component-specific attributes as detailed on the . Components
can be added, modified or removed in subsequent . Changes to an add-on components

will not take effect until the new version of the add-on is approved and published.

Settings UI

The is also a Ul component, with the only difference being that it's not defined as part of the

components but rather as part of the settings field of the manifest.

Interacting with the API

Ul components can interact with the in two ways:
* by calling the directly

All components are provided with an in the form of a query parameter. This token has the
same permissions and access as the user who is currently viewing the Ul. This token, which in case it's provided

to Ul components is called the user token , can be used to make authenticated requests to the
* by interacting with an add-on backend service

In this case it's up to the developer to implement the relevant authentication mechanisms and APIs. The add-on
will be provided with an in case the installed lifecycle has been configured, although you

may also choose to forward the to your backend service as part of the requests.

Types

There are three types of components in Clockify, each having its own location where the component will be

shown.

Sidebar

0 Ul examples

CLIENTS

> TAGS

> SIDEBAR

A sidebar entry is an entry that is added to the add-ons section of the Clockify sidebar, located on the left side
of the page. New entries always default to the add-ons section, although they can be manually moved according
to the user's preferences. Add-on can add new element in a sidebar automatically, or if user enables it through

Settings by clicking Show more and Add-ons.
Now, you can specify sidebar's properties:

* Added if at least one enabled add-on has "Sidebar" component specified in manifest
+ Not removed even if empty
» Users can put other elements in it (from other sections)

+ New add-on sidebar elements are always added to the Add-on section

Element can be moved from the Add-on to other sections and is removed from the Add-on section if it is

uninstalled or disabled in the optional add-on’s settings.

Widget

A widget is a small icon which is displayed at the bottom-right section of the page. It serves an entrypoint to Ul

components that are defined with the WIDGET type.

Widget

Support chat Active 5min ago

2 Alex

The widget icon will serve as an entrypoint to one or more Ul components according to the rules below:

Widget icon is displayed if at least one add-on with widget component is installed and enabled at the bottom

right corner of the page.

Widget list is displayed if more than one add-on with widget component is installed and enabled at the bottom

right corner of the page.

Widget is not visible if there are no installed add-ons that have widget as a component in the manifest, or if all

add-ons with widget component are disabled.

Tabs

A tab is a location that can be defined for components which extend the functionality of existing pages with tabs.

Add-on tabs will be added after the default tabs of the pages that support them.

MEMBERS GROUPS EM [0 TEAM TAB

88 pasHBoarD

Jil REPORTS

[J Some Label

() CLIENTS

Add-on can add new element in tab automatically, or if user enables it through Settings. Add-on tabs are added

after the existing tabs and are sorted by the date when they where added.
Tabs can be added to the following pages:

e Time off
e Schedule
* Approvals
* Reports

o Activity

e Team

* Project

Settings UI

The is technically also a Ul location, although it must be configured on the settings field rather than

as a component. The Ul can be accessed through the add-on options dropdown on the add-ons tab.

ACCOUNTS THENTICATION | CUSTOM FIELD:

Conky lean: Clase your tes data

Insights

Access

A component can be configured to be visible to everyone, or only to users with the admin role.
