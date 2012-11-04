ScheduleCMU Application Directory
=================================

Cloud Foundry Node.js Express web application for ScheduleCMU.

Use CloudFoundry's vmc CLI tool to deploy the application to production. More specifically, CMU is currently deploying to AppFog, which has a variant of the tool called af. Go here for more information:

http://docs.appfog.com/getting-started/af-cli

Only the CloudFoundry administrator should need to push the app to deployment. Use the following commands to login and push:

$ af login
$ af update schedulecmu
