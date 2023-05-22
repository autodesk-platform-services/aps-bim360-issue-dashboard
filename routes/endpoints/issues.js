/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Developer Acvocacy and Support
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

const express = require('express');
const router = express.Router();

const config = require('../../config');
const { authRefreshMiddleware } = require('../services/oauth');
const issues_services = require('../services/issues');
const admin_services = require('../services/admin');

router.post('/api/issueState/:projectId/:containerId', authRefreshMiddleware, async (req, res) => {

  config.credentials.token_3legged = req.internalOAuthToken.access_token;
  const { projectId, containerId } = req.params;
  const weekDueStart = req.body.weekDueStart;

  try {
    var allIssues = []
    allIssues = await issues_services.getIssues(containerId, allIssues, 0, 100)
    var subTypes = []
    subTypes = await issues_services.getSubTypes(containerId, subTypes, 0, 100)
    var rootCauses = []
    rootCauses = await issues_services.getRootCauses(containerId, rootCauses, 0, 100)
    var projectUsers = []
    projectUsers = await admin_services.getProjectUsers(projectId, projectUsers, 0, 100)

    var issue_stats_json = {
      overview: {},
      subType: {},
      rootCause: {},
      weekDue: {}
    }
    await Promise.all(allIssues.map(async (eachIssue) => {
      issueOverview(eachIssue.status, issue_stats_json);
      var subType = subTypes.find(i => i.id == eachIssue.issueSubtypeId);
      subType = subType ? subType.title : '<not found>';
      issueBySubtype(subType, issue_stats_json);
      if(eachIssue.dueDate)
        issueWeekDue(eachIssue.status, eachIssue.dueDate, weekDueStart, issue_stats_json);
      var rootCause = rootCauses.find(i => i.id == eachIssue.rootCauseId);
      rootCause = rootCause ? rootCause.title : '<not found>';
      issueByRootcause(rootCause, issue_stats_json);
    }));

    res.json(issue_stats_json).end();

  } catch (e) {
    console.error(`/api/issueState/:containerId:${e.message}`)
    res.end();
  }
});


function issueOverview(status, issue_stats_json) {
  if (status in issue_stats_json.overview)
    issue_stats_json.overview[status]++;
  else
    issue_stats_json.overview[status] = 1;
}
function issueBySubtype(subType, issue_stats_json) {
  if (subType in issue_stats_json.subType)
    issue_stats_json.subType[subType]++;
  else
    issue_stats_json.subType[subType] = 1;
}

function issueWeekDue(status, dueDate, weekDueStart, issue_stats_json) {
  var dateStart = new Date(weekDueStart);
  var dateStartTime = dateStart.getTime(); 
  var dateAtOneWeek = dateStart;
  dateAtOneWeek.setDate(dateStart.getDate() + 7);
  var dateAtOneWeekTime = dateAtOneWeek.getTime();
  var dueDateTime = new Date(dueDate).getTime();

  if (dueDateTime >= dateStartTime && dueDateTime <= dateAtOneWeekTime) {
    if (dueDateTime in issue_stats_json.weekDue) {
      status == 'closed' ?
        issue_stats_json.weekDue[dueDateTime]['isclosed']++ :
        issue_stats_json.weekDue[dueDateTime]['dueissue']++;
    }
    else {
      issue_stats_json.weekDue[dueDateTime] = {};
      issue_stats_json.weekDue[dueDateTime]['dueissue'] = 1;
      status == 'closed' ?
        issue_stats_json.weekDue[dueDateTime]['isclosed'] = 1 :
        issue_stats_json.weekDue[dueDateTime]['isclosed'] = 0;
    }
  }
}

function issueByRootcause(rootCause, issue_stats_json) {

  if (rootCause in issue_stats_json.rootCause)
    issue_stats_json.rootCause[rootCause]++;
  else
    issue_stats_json.rootCause[rootCause] = 1;
}




module.exports = router;
