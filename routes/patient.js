var express = require('express');
var router = express.Router();
const Action = require('../action.js');
var action = new Action();
const axios = require("axios");
const logger = require('../log.js');

router.get('/eob', (req, res) => {
    var url = 'https://sandbox.bluebutton.cms.gov/v1/fhir/ExplanationOfBenefit';
  
    axios.defaults.headers.common.authorization = `Bearer ` + req.token.accessToken;
  
    axios
      .get(url)
      .then(response => {
        var data = response.data;
        var links = data.link;
  
        if (links !== undefined) {
          logger.debug(JSON.stringify(links, null, 2));
          eobs = action.createEobDict(links);
        }
  
        res.json({eobs, data});
      });
});

router.get('/coverage', (req, res) => {
    var url = 'https://sandbox.bluebutton.cms.gov/v1/fhir/Coverage';

    axios.defaults.headers.common.authorization = `Bearer ` + req.token.accessToken;

    axios
      .get(url)
      .then(response => {
        var data = response.data;
        var links = data.link;
        var entry = data.entry[0];
        var resource = entry.resource;
        var results, html, table;
  
        // if (resource !== undefined) {
        //   html = '<h2>Here is your Benefit Balance Information</h2>';
        //   table = action.createBenefitBalanceRecord(resource);
        // }
        // else {
        //   html = '<h2>No benefit balance records found!</h2>';
        // }
        // // render results
        // res.json({
        //   token: req.token.json,
        //   customHtml: html + table
        // });

        console.log(resource)
      });
  });

  router.get('/profile', (req, res)=> {
    var url = 'https://sandbox.bluebutton.cms.gov/v1/fhir/Profile';
    if (resource !== undefined) {
        html = '<h2>Here is your Patient Record</h2>';
        table = action.createPatientRecord(resource);
      }
      else {
        html = '<h2>No patient record found!</h2>';
      }

      axios
      .get(url)
      .then(response => {
        var data = response.data;
        var links = data.link;
        var entry = data.entry[0];
        var resource = entry.resource;
        var results, html, table;
      // render results
      res.render('results', {
        token: token.json,
        customHtml: html + table.table
      });

    });
  })


module.exports = router;
