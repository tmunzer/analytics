/*!
 * letiny-core
 * Copyright(c) 2015 AJ ONeal <aj@daplie.com> https://daplie.com
 * Apache-2.0 OR MIT (and hence also MPL 2.0)
*/
'use strict';

var crypto = require('crypto');
var ursa = require('ursa');
var forge = require('node-forge');

function binstrToB64(binstr) {
  return new Buffer(binstr, 'binary').toString('base64');
}

/*
function b64ToBinstr(b64) {
  return new Buffer(b64, 'base64').toString('binary');
}
*/

function privatePemToJwk(privkeyPem) {
  var forgePrivkey = forge.pki.privateKeyFromPem(privkeyPem);

  // required in node.js 4.2.2 (but not io.js 1.6.3)
  Object.keys(forgePrivkey).forEach(function (k) {
    var val = forgePrivkey[k];
    if (val && val.toByteArray) {
      forgePrivkey[k] = val.toByteArray();
    }
  });

  return {
    kty: "RSA"
  , n: binstrToB64(forgePrivkey.n)
  , e: binstrToB64(forgePrivkey.e)
  , d: binstrToB64(forgePrivkey.d)
  , p: binstrToB64(forgePrivkey.p)
  , q: binstrToB64(forgePrivkey.q)
  , dp: binstrToB64(forgePrivkey.dP)
  , dq: binstrToB64(forgePrivkey.dQ)
  , qi: binstrToB64(forgePrivkey.qInv)
  };
}

function generateRsaKeypair(bitlen, exp, cb) {
  var keypair = ursa.generatePrivateKey(bitlen || 2048, exp || 6553);
  var pems = {
    publicKeyPem: keypair.toPublicPem().toString('ascii')   // ascii PEM: ----BEGIN...
  , privateKeyPem: keypair.toPrivatePem().toString('ascii') // ascii PEM: ----BEGIN...
  };

  // for account id
  pems.publicKeySha256 = crypto.createHash('sha256').update(pems.publicKeyPem).digest('hex');
  // for compat with python client account id
  pems.publicKeyMd5 = crypto.createHash('md5').update(pems.publicKeyPem).digest('hex');
  // json { n: ..., e: ..., iq: ..., etc }
  pems.privateKeyJwk = privatePemToJwk(pems.privateKeyPem);
  pems.privateKeyJson = pems.privateKeyJwk;

  // TODO thumbprint

  cb(null, pems);
}

function privateJwkToPems(pkj, cb) {
  Object.keys(pkj).forEach(function (key) {
    pkj[key] = new Buffer(pkj[key], 'base64');
  });

  var priv;
  var pems;

  try {
    priv = ursa.createPrivateKeyFromComponents(
      pkj.n // modulus
    , pkj.e // exponent
    , pkj.p
    , pkj.q
    , pkj.dp
    , pkj.dq
    , pkj.qi
    , pkj.d
    );
  } catch(e) {
    cb(e);
    return;
  }

  pems = {
    privateKeyPem: priv.toPrivatePem().toString('ascii')
  , publicKeyPem: priv.toPublicPem().toString('ascii')
  };

  // for account id
  pems.publicKeySha256 = crypto.createHash('sha256').update(pems.publicKeyPem).digest('hex');
  // for compat with python client account id
  pems.publicKeyMd5 = crypto.createHash('md5').update(pems.publicKeyPem).digest('hex');
  // json { n: ..., e: ..., iq: ..., etc }
  pems.privateKeyJwk = privatePemToJwk(pems.privateKeyPem);
  pems.privateKeyJson = pems.privateKeyJwk;

  cb(null, pems);
}

module.exports.generateRsaKeypair = generateRsaKeypair;
module.exports.privateJwkToPems = privateJwkToPems;
module.exports.privatePemToJwk = privatePemToJwk;
