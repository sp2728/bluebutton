var express = require('express');
var router = express.Router();
const Action = require('../action.js');
var action = new Action();
const axios = require("axios");
const logger = require('../log.js');

router.get('/eob', async (req, res) => {
  var url = 'https://sandbox.bluebutton.cms.gov/v1/fhir/ExplanationOfBenefit';

  axios.defaults.headers.common.authorization = `Bearer ` + req.token.accessToken;

  var eobResponse = await axios.get(url);

  var data = eobResponse.data;
  var eobResult = [];

  data.entry.map((obj) => {
    var result = obj.resource;
    var diagnos = [];

    result.diagnosis?.length > 0 && result.diagnosis.map((obj)=> {
      diagnos.push(obj.diagnosisCodeableConcept.coding[0]?.display)
    })

    var careTeamArr = [];
    result.careTeam?.length > 0 && result.careTeam.map((obj)=> {
      if(!careTeamArr.includes(obj.role.coding[0]?.display))
        careTeamArr.push(obj.role.coding[0]?.display);
    })

    eobResult.push({
      id: result.id,
      billablePeriod: result.billablePeriod,
      status: result.status,
      insuranceId: result.insurance.coverage.reference,
      payment: result.payment?.amount?.value || '',
      diagnosis: diagnos,
      careTeam: careTeamArr
    })
  })

  res.json({ result: eobResult });
});

router.get('/coverage', async (req, res) => {
  var url = 'https://sandbox.bluebutton.cms.gov/v1/fhir/Coverage';
  axios.defaults.headers.common.authorization = `Bearer ` + req.token.accessToken;

  var coverageResponse = await axios.get(url);

  var coverageData = coverageResponse.data;
  var coverageResult = [];

  var disease = [];
  var resourceExtension = (coverageData.entry[0]).resource.extension
  for (var i = 0; i < resourceExtension.length; i++) {
    if (resourceExtension[i].hasOwnProperty('valueCoding') && resourceExtension[i].valueCoding.display != undefined && !disease.includes(resourceExtension[i].valueCoding.display)) {
      disease.push(resourceExtension[i].valueCoding.display)
    }
  }

  coverageData.entry.map((obj) => {
    var result = obj.resource;
    coverageResult.push({ coverageId: result.id, coveragebeneficiary: result.beneficiary.reference, coveragestart: result.period?.start || '', coverage: result.grouping })
  })

  coverageResult.push({ diseases: disease })
  res.json({ result: coverageResult });
});

router.get('/profile', async (req, res) => {
  var url = 'https://sandbox.bluebutton.cms.gov/v1/fhir/Patient/';
  axios.defaults.headers.common.authorization = `Bearer ` + req.token.accessToken;

  var patientResponse = await axios.get(url);
  var patientResult = [];

  var data = patientResponse.data;
  var entry = (data.entry[0]).resource
  patientResult.push({ id: entry.id, name: entry.name[0].given + " " + entry.name[0].family, gender: entry.gender, dateofbirth: entry.birthDate, race: entry.extension[0].valueCoding.display, deceasedDate: entry.deceasedDateTime, address: entry.address })
  res.json({result: patientResult});
})

router.get('/entireData', async (req, res) => {
  var eobURL = 'https://sandbox.bluebutton.cms.gov/v1/fhir/ExplanationOfBenefit';
  axios.defaults.headers.common.authorization = `Bearer ` + req.token.accessToken;

  var eobResponse = await axios.get(eobURL);

  var data = eobResponse.data;
  var eobResult = [];

  data.entry.map((obj) => {
    var result = obj.resource;
    var diagnos = [];

    result.diagnosis?.length > 0 && result.diagnosis.map((obj)=> {
      if(obj.diagnosisCodeableConcept.coding[0].display)
        diagnos.push(obj.diagnosisCodeableConcept.coding[0].display)
    })

    var careTeamArr = [];
    result.careTeam?.length > 0 && result.careTeam.map((obj)=> {
      if(!careTeamArr.includes(obj.role.coding[0]?.display))
        careTeamArr.push(obj.role.coding[0]?.display);
    })

    eobResult.push({
      id: result.id,
      billablePeriod: result.billablePeriod,
      status: result.status,
      insuranceId: result.insurance.coverage.reference,
      payment: result.payment?.amount?.value || '',
      diagnosis: diagnos,
      careTeam: careTeamArr
    })
  });

  var coverageUrl = 'https://sandbox.bluebutton.cms.gov/v1/fhir/Coverage';
  var coverageResponse = await axios.get(coverageUrl);
  var coverageData = coverageResponse.data;
  var coverageResult = [];
  var disease = [];
  var resourceExtension = (coverageData.entry[0]).resource.extension
  for (var i = 0; i < resourceExtension.length; i++) {
    if (resourceExtension[i].hasOwnProperty('valueCoding') && resourceExtension[i].valueCoding.display != undefined && !disease.includes(resourceExtension[i].valueCoding.display)) {
      disease.push(resourceExtension[i].valueCoding.display)
    }
  }
  coverageData.entry.map((obj) => {
    var result = obj.resource;
    coverageResult.push({ coverageId: result.id, coveragebeneficiary: result.beneficiary.reference, coveragestart: result.period?.start || '', coverage: result.grouping })
  })
  coverageResult.push({ diseases: disease });


  var profileUrl = 'https://sandbox.bluebutton.cms.gov/v1/fhir/Patient';
  var patientResponse = await axios.get(profileUrl);
  var patientResult = [];

  var data = patientResponse.data;
  var entry = (data.entry[0]).resource
  patientResult.push({ id: entry.id, name: entry.name[0].given + " " + entry.name[0].family, gender: entry.gender, dateofbirth: entry.birthDate, race: entry.extension[0].valueCoding.display, deceasedDate: entry.deceasedDateTime, address: entry.address })

  res.json({ profile: patientResult, explanationOfBenefits: eobResult, coverage: coverageResult });
});
module.exports = router;
