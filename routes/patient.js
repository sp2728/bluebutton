var express = require('express');
var router = express.Router();
const Action = require('../action.js');
var action = new Action();
const axios = require("axios");
const logger = require('../log.js');

router.get('/eob', (req, realres) => {
    var url = 'https://sandbox.bluebutton.cms.gov/v1/fhir/ExplanationOfBenefit';
  
    axios.defaults.headers.common.authorization = `Bearer ` + req.token.accessToken;
  
    axios
      .get(url)
      .then(response => {
        var data = response.data;
        var result=[];
for(var i=0;i<data.entry.length;i++){
    var res = data.entry[i].resource
    var diagnos=[]
    for(var j=0;j<res.diagnosis.length-1;j++){
        var dis = res.diagnosis[j].diagnosisCodeableConcept.coding[0].display
        diagnos.push(dis)
    }
    result.push({id:res.id, billablePeriod:res.billablePeriod,status:res.status, insuranceId:res.insurance.coverage.reference, payment:res.payment.amount.value,diagnosis:diagnos})
}
        realres.json({result});
      });
});

router.get('/coverage', (req, realres) => {
    var url = 'https://sandbox.bluebutton.cms.gov/v1/fhir/Coverage';

    axios.defaults.headers.common.authorization = `Bearer ` + req.token.accessToken;

    axios
      .get(url)
      .then(response => {
        var data = response.data;
        var result=[];
        var disease = [];
        var res = (data.entry[0]).resource.extension
        for (var i=0;i<res.length;i++){
          if(res[i].hasOwnProperty('valueCoding') && res[i].valueCoding.display!=undefined && !disease.includes(res[i].valueCoding.display)) {
              disease.push(res[i].valueCoding.display)
              
          }
        }
        var res1 = (data.entry[0]).resource
        console.log(res1.contract[0].id)
        result.push({coverage1Id:res1.id,coverage1beneficiary:res1.beneficiary.reference, coverage1start:res1.period.start, coverage1:res1.grouping})
        var res2 = (data.entry[1]).resource
        result.push({coverage2Id:res2.id,coverage2beneficiary:res2.beneficiary.reference, coverage2start:res2.period.start, coverage2:res2.grouping})
        var res3 = (data.entry[2]).resource
        result.push({coverage3Id:res3.id,coverage3beneficiary:res3.beneficiary.reference, coverage3:res3.grouping})
        result.push({diseases:disease})
        realres.json({result})
      });
  });

  router.get('/profile', (req, res)=> {
    var url = 'https://sandbox.bluebutton.cms.gov/v1/fhir/Patient';
    axios.defaults.headers.common.authorization = `Bearer ` + req.token.accessToken;

      axios
      .get(url)
      .then(response => {
      var result =[];
      var data = response.data;
      var entry = (data.entry[0]).resource
      result.push({id:entry.id, name:entry.name[0].given+" "+entry.name[0].family, gender: entry.gender, dateofbirth:entry.birthDate, race:entry.extension[0].valueCoding.display, deceasedDate: entry.deceasedDateTime, address: entry.address })
      res.json(result);
    });
  })

router.get('/entireData', (req, realres) => {
    var url = 'https://sandbox.bluebutton.cms.gov/v1/fhir/ExplanationOfBenefit';
  
    axios.defaults.headers.common.authorization = `Bearer ` + req.token.accessToken;
  var eob;
  var coverage;
    axios
      .get(url)
      .then(response => {
        var data = response.data;
        var result1=[];
for(var i=0;i<data.entry.length;i++){
    var res = data.entry[i].resource
    var diagnos=[]
    for(var j=0;j<res.diagnosis.length-1;j++){
        var dis = res.diagnosis[j].diagnosisCodeableConcept.coding[0].display
        diagnos.push(dis)
    }
    result1.push({id:res.id, billablePeriod:res.billablePeriod,status:res.status, insuranceId:res.insurance.coverage.reference, payment:res.payment.amount.value,diagnosis:diagnos})
}
        eob=result1;
      });

      var url1 = 'https://sandbox.bluebutton.cms.gov/v1/fhir/Coverage';
      axios
      .get(url1)
      .then(response => {
        var data = response.data;
        var result=[];
        var disease = [];
        var res = (data.entry[0]).resource.extension
        for (var i=0;i<res.length;i++){
          if(res[i].hasOwnProperty('valueCoding') && res[i].valueCoding.display!=undefined && !disease.includes(res[i].valueCoding.display)) {
              disease.push(res[i].valueCoding.display)
              
          }
        }
        var res1 = (data.entry[0]).resource
        console.log(res1.contract[0].id)
        result.push({coverage1Id:res1.id,coverage1beneficiary:res1.beneficiary.reference, coverage1start:res1.period.start, coverage1:res1.grouping})
        var res2 = (data.entry[1]).resource
        result.push({coverage2Id:res2.id,coverage2beneficiary:res2.beneficiary.reference, coverage2start:res2.period.start, coverage2:res2.grouping})
        var res3 = (data.entry[2]).resource
        result.push({coverage3Id:res3.id,coverage3beneficiary:res3.beneficiary.reference, coverage3:res3.grouping})
        result.push({diseases:disease})
        coverage=result
      });

      var url = 'https://sandbox.bluebutton.cms.gov/v1/fhir/Patient';
    axios.defaults.headers.common.authorization = `Bearer ` + req.token.accessToken;

      axios
      .get(url)
      .then(response => {
      var result =[];
      var data = response.data;
      var entry = (data.entry[0]).resource
      result.push({id:entry.id, name:entry.name[0].given+" "+entry.name[0].family, gender: entry.gender, dateofbirth:entry.birthDate, race:entry.extension[0].valueCoding.display, deceasedDate: entry.deceasedDateTime, address: entry.address})
      result.push({cover:coverage,explanation:eob})
      realres.json({result});
    });
  
});
module.exports = router;
