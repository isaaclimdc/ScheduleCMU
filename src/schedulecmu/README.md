ScheduleCMU Application Directory
=================================

Cloud Foundry Node.js Express web application for ScheduleCMU.

Use CloudFoundry's vmc CLI tool to deploy the application to production. More specifically, CMU is currently deploying to AppFog, which has a variant of the tool called af. Go here for more information:

http://docs.appfog.com/getting-started/af-cli

Only the CloudFoundry administrator should need to push the app to deployment. Use the following commands to login and push:

$ af login
$ af update schedulecmu




How to use the API:
---------

All POST,PUT,DELETE requests follow the format
{
  auth_token: "***"|undefined,
  _method: "PUT"|"DELETE"|undefined
  data: {...}
}

- Sending PUT,DELETE requests involves sending a POST request with the
_method field set to "PUT", "DELETE"

- If accessing user data, the auth_token field is required.

- The data is the object being inserted or updated in the case of a PUT or
POST. The key is ALWAYS called "data."


All GET requests contain the auth_token in a query field:
http://www.schedulecmu.org/users/***?auth_token=*****


Available URLs

GET /api/users/*fbid*
PUT /api/users/*fbid*
DELETE /api/users/*fbid*
POST /api/users/*fbid*/schedules
DELETE /api/users/*fbid*/schedules/*schedID*
PUT /api/users/*fbid*/schedules/*schedID*/blocks/*courseID*
DELETE /api/users/*fbID*/schedules/*schedID*/blocks/*courseID*

POST /api/users/*fbid*/verify
  This is different in that the body need only contain "verify_code"
  - no data field, _method, or auth_token is needed

GET /api/courses?...
GET /api/courses/*courseID*
GET /api/courses/*courseID*/sections/*sectionID*
GET /api/courses/*courseID*/sections/*sectionID*/subsections/*subID*
POST /api/courses/*courseID*/events
DELETE /api/courses/*courseID*/events
DELETE /api/courses/*courseID*/events/*eventID*
PUT /api/courses/*courseID*/events/*eventID*



How to use schedule.js
---------

Important function calls in schedules.js
--

/* Populate the page with the user's courses */
fetchUserSchedule()

/* User presses enter in add course box */
requestAndAddCourse()

/* User clicks on row in the Accordion to change sections */
rowSelected()

/* User clicks on "delete" in the Accordion */
deleteCourse()

/* User clicks on "info" in the Accordion */
showInfoFromAccordion()

/* User searches in the CourseBrowser */
searchForCourseInCourseBrowser()
