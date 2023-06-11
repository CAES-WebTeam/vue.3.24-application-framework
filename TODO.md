# Rough Overview
1. Multi-select 4H activities
1. Store report/activity assn w/ name in DB
1. Report/acticvity web service
1. Duplicate activity? y/n
1. Enrichment report & web service
1. Create "unmatched" report
1. Location of agent field (nullable?)
1. Create "unmatched" api for steve

## Database Layer
- ~~association_report_enrollment_activity~~
	- ~~REPORT_ID~~
	- ~~ACTIVITY_ID~~
	- ~~ACTIVITY_NAME~~
	- ~~DATE_CREATED~~
- ~~new field for REPORT table~~
	- ~~"location of agent" (county id)~~
- ~~report api~~
	- ~~IS_ENRICHMENT criteria~~

## REST API
- ~~endpoint for association_report_enrollment_activity~~
 ~~endpoint for for "enrichment" reports~~

## Vue
- ~~multi-select~~
	- ~~4himport component~~
	- ~~get4HActivities request method~~
- ~~duplication~~

## Coldfusion
- "unmatched" report
- "enrichment" report


- ~~Activities x,y,z have been imported~~
- Grab associations from last year, flesh out list with info "you've already
	imported this one" etc.

- Add note "hold ctrl" to 4h import modal
- Detail column for report search "File Attachments"
- Filter to search for reports which do/do not have attachments
- Add file attachments to FAR
