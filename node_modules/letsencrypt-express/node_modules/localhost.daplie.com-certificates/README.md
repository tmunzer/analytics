# HTTPS certs for localhost development

HTTPS certificates for `localhost.daplie.com`, free for anyone to use in testing and development.

For the sake of keywords: most people (including myself) think of these as "SSL certificates" but they are, in fact, signed RSA keypairs used for TLS encryption.

## QuickStart

If you've done this kind of thing before:

```bash
git clone https://github.com/Daplie/localhost.daplie.com-certificates.git ./certs
```

**Misnomer Alert**: Most webservers and software call for a **keypair** consisting of **server.crt** and **server.key**.
In most cases these actually correspond to **fullchain.pem** (crt) and **privkey.pem** (key).

<https://localhost.daplie.com> is an alias for <https://localhost> or <https://127.0.0.1>.

The benefit of using this certificate for localhost development is that you will have the exact same security policies
and APIs available in development as you would have in production.

### Let's Encrypt Certificate Conventions

The certificates are named according to the [Let's Encrypt](https://letsencrypt.org) conventions:

* privkey.pem - the server private key
* cert.pem - includes the bare server certficate only
* chain.pem - includes intermediate certificates only
* fullchain.pem - includes cert.pem and chain.pem
* root.pem - (proposed) includes any Root CAs

This convention is still subject to change.
See <https://github.com/letsencrypt/letsencrypt/issues/608>
and <https://groups.google.com/a/letsencrypt.org/forum/#!topic/client-dev/jE5uK4lPx5g>
to follow the conversation.

## Screencast + Article

[![screencast thumbnail](https://i.imgur.com/F8aoJg5.png)](https://youtu.be/r92gqYHJc5c)

[Create a CSR in PEM format for your HTTPS cert](https://coolaj86.com/articles/how-to-create-a-csr-for-https-tls-ssl-rsa-pems/)

[Examine HTTPS Certs with OpenSSL in Terminal](https://coolaj86.com/articles/how-to-examine-an-ssl-https-tls-cert/)

## Examples

### node / io.js

**Quick and Dirty:**

```bash
npm install --save-dev localhost.daplie.com-certificates
```

```javascript
'use strict';

var https = require('https');
var server = https.createServer(require('localhost.daplie.com-certificates'));
var port = process.argv[2] || 8443;

server.on('request', function (req, res) {
  res.end('[' + req.method + ']' + ' ' + req.url);
});
server.listen(port, function () {
  console.log('Listening', server.address());
});
```

<https://localhost.daplie.com:8443/>

**DIY**

Instead of simply requiring `localhost.daplie.com-certificates` you will clone the certs yourself
and provide the options object.

```bash
git clone https://github.com/Daplie/localhost.daplie.com-certificates.git ./certs
```

```javascript
var fs = require('fs');
var path = require('path');
var certsPath = path.join(__dirname, 'certs');

//
// SSL Certificates
//
var options = {
  key: fs.readFileSync(path.join(certsPath, 'privkey.pem'), 'ascii')
, cert: fs.readFileSync(path.join(certsPath, 'fullchain.pem'), 'ascii')
/*
  // only for verification
, ca: [
    fs.readFileSync(path.join(certsPath, 'root.pem'))
  ]
, requestCert: true
*/
, rejectUnauthorized: true
, SNICallback: function (domainname, cb) {
    // normally we would check the domainname choose the correct certificate,
    // but for this demo we'll always use this one (the default) instead
    cb(null, require('tls').createSecureContext(options));
  }
, NPNProtcols: ['http/1.1']
};

var server = https.createServer(options);
```

### Caddy

* TODO


## How this was created

I created a directory `~/Code/localhost.daplie.com-certificates` (this repository, actually) and ran the following commands from that directory:



### 01 Create a Private Key

`01-create-key.sh`:
```bash
mkdir -p certs/server
openssl genrsa \
  -out certs/server/my-server.key.pem \
  2048
```

### 02 Create a Certificate Signing Request (CSR)

`02-create-csr.sh`:
```bash
mkdir -p certs/tmp
openssl req -new \
  -sha256 \
  -key certs/server/my-server.key.pem \
  -out certs/tmp/my-server.csr.pem \
  -subj "/C=US/ST=Utah/L=Provo/O=Daplie Inc/CN=localhost.daplie.com"
```

### 03 Copy and Paste the CSR to name.com's console

`cat certs/tmp/my-server.csr.pem`:
```
-----BEGIN CERTIFICATE REQUEST-----
MIICpTCCAY0CAQAwYDELMAkGA1UEBhMCVVMxDTALBgNVBAgTBFV0YWgxDjAMBgNV
BAcTBVByb3ZvMRMwEQYDVQQKEwpEYXBsaWUgSW5jMR0wGwYDVQQDExRsb2NhbGhv
c3QuZGFwbGllLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJ3j
1nY+5bJf2oWVRGCrwTQ7Mw/qzMMu62RgGZawN2d6QTDSYBSCZdyuEpwOiDy6AO9x
Wqo6WJx7yu6Yv04syZEbc5tLMtX77YROAF7GkRrBIkqPtSkKnDYQm0wW9I9escgy
GQ3itSSHU/Oijv6Lj8xUigM+WM+DE860U1K0QID/eQPYOWQhj/A6WQXxPWWDsDxD
3ZpVeLIgeZe5usd1PhuGvhhFvK+W0QHZ4D7PgsvKrP6Qwoc3VNiEwlQa6v8L8t7e
w2uEXa96o4J08GiZPClbAng8+Y3SSp5PQ3cPUIlWu3hSPxb03t8+yC5gB6Gzl7To
wJwBPcOXUSo00QnD96UCAwEAAaAAMA0GCSqGSIb3DQEBCwUAA4IBAQCP04HRbk1x
i9ESsClWoClyG8VZCPGcG2KooQ2tqKaCBRGG9hNz1vm1SzUyclKz1CMZgI5i+b02
h/zeJRHkQ9ztT07oRUmKK1/tDt88J3AH3wIcnMEyzT3kHRuJbrZ81hEz417tePhs
v4/NziQc8Xv8WJP6sjcg72L5jlV0qrc3BYkdOqgjIOMOJoo7pNCbmh0xCvW5FURc
uG1AUaFPaDcOshT3YOlH9MP5/SoYl5X8y1SJVbNDOrQzJo8Erw1HoxOX4tRTd3F+
BalBlrLZQMvgtOkMNErebgARAz6xlfzXpOf7G0AkvllHJAnzTmSalzR5hDWdfcbq
mnxzBDw4+wI+
-----END CERTIFICATE REQUEST-----
```

### 04 Follow Validation Procedure

I bought the domain on name.com so I could have used the automatic validation process,
but since I have my GLUE records and DNS management for the daplie.com DNS elsewhere and
I didn't want to go through the hassle of the validation records, I used the registered admin
email address (which I happened to already have setup through mailgun).

This is the email I got:

```
ORDER APPROVAL

Dear Domain Administrator,

You are receiving this email because you are the Domain Administrator for localhost.daplie.com and the person identified below has requested a RapidSSL certificate for:

localhost.daplie.com


Applicant Information:
     Name:   AJ ONeal
     Email:  coolaj86@gmail.com
     Phone:  +1.3174266525

AJ ONeal requests that you come to the URL below to review and approve this certificate request:

     https://products.geotrust.com/orders/A.do?p=Ac8lMXMpxHsbZVlWJwBcF

Please follow the above link and click either the I APPROVE or I DO NOT APPROVE button.

When you click I APPROVE the certificate will be issued and emailed to the Applicant, Approver, and Technical contacts.

If you click I DO NOT APPROVE the certificate application will be cancelled.

Thanks,

RapidSSL Customer Support
http://www.rapidssl.com/support
Hours of Operation: Mon - Fri 09:00 - 17:00 (EST)
Email:     orderprocessing@rapidssl.com
Live Chat: https://knowledge.rapidssl.com/support/ssl-certificate-support/index.html
```

And once I clicked the link, this was the confirmation email I got back:

```
Dear AJ ONeal,

Congratulations! RapidSSL has approved your request for a RapidSSL certificate. Your certificate is included at the end of this email.

INSTALLATION INSTRUCTIONS

1. INSTALL CERTIFICATE:
Install the X.509 version of your certificate included at the end of this e-mail.
For installation instructions for your SSL Certificate, go to:
https://knowledge.rapidssl.com/support/ssl-certificate-support/index?page=content&id=SO16226

2. INTERMEDIATE CERTIFICATE ADVISORY:
You MUST install the RapidSSL intermediate Certificate on your server together with your Certificate or it may not operate correctly.

** MICROSOFT IIS and TOMCAT USERS
Microsoft and Tomcat users are advised to download a PKCS #7 formatted certificate from the GeoTrust User Portal:
https://products.geotrust.com/orders/orderinformation/authentication.do. PKCS #7 is the default format used by these vendors during installation and includes the intermediate CA certificate.

You can get your RapidSSL Intermediate Certificates at:
https://knowledge.rapidssl.com/support/ssl-certificate-support/index?page=content&id=AR1548

3. CHECK INSTALLATION:
Ensure you have installed your certificate correctly at:
https://knowledge.rapidssl.com/support/ssl-certificate-support/index?page=content&id=AR1549

4. INSTALL THE RAPIDSSL SITE SEAL:
Additionally, as part of your SSL Certificate Service, you are entitled to display the RapidSSL Site Seal - recognized across the Internet and around the world as a symbol of authenticity, security, and trust - to build consumer confidence in your Web site.

Installation instructions for the RapidSSL Site Seal can be found on the following link:
https://knowledge.rapidssl.com/support/ssl-certificate-support/index?page=content&id=SO14424&actp=LIST&viewlocale=en_US

If you require additional technical support please contact Name.com.

Web Server CERTIFICATE
-----------------

-----BEGIN CERTIFICATE-----
MIIEqzCCA5OgAwIBAgIDBPiXMA0GCSqGSIb3DQEBCwUAMEcxCzAJBgNVBAYTAlVT
MRYwFAYDVQQKEw1HZW9UcnVzdCBJbmMuMSAwHgYDVQQDExdSYXBpZFNTTCBTSEEy
NTYgQ0EgLSBHMzAeFw0xNTA2MDkwOTI3NDJaFw0xNjA2MTEyMDA4MDdaMIGYMRMw
EQYDVQQLEwpHVDcyMjM4NTY5MTEwLwYDVQQLEyhTZWUgd3d3LnJhcGlkc3NsLmNv
bS9yZXNvdXJjZXMvY3BzIChjKTE1MS8wLQYDVQQLEyZEb21haW4gQ29udHJvbCBW
YWxpZGF0ZWQgLSBSYXBpZFNTTChSKTEdMBsGA1UEAxMUbG9jYWxob3N0LmRhcGxp
ZS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCd49Z2PuWyX9qF
lURgq8E0OzMP6szDLutkYBmWsDdnekEw0mAUgmXcrhKcDog8ugDvcVqqOlice8ru
mL9OLMmRG3ObSzLV++2ETgBexpEawSJKj7UpCpw2EJtMFvSPXrHIMhkN4rUkh1Pz
oo7+i4/MVIoDPljPgxPOtFNStECA/3kD2DlkIY/wOlkF8T1lg7A8Q92aVXiyIHmX
ubrHdT4bhr4YRbyvltEB2eA+z4LLyqz+kMKHN1TYhMJUGur/C/Le3sNrhF2veqOC
dPBomTwpWwJ4PPmN0kqeT0N3D1CJVrt4Uj8W9N7fPsguYAehs5e06MCcAT3Dl1Eq
NNEJw/elAgMBAAGjggFMMIIBSDAfBgNVHSMEGDAWgBTDnPP800YINLvORn+gfFvz
4gjLWTBXBggrBgEFBQcBAQRLMEkwHwYIKwYBBQUHMAGGE2h0dHA6Ly9ndi5zeW1j
ZC5jb20wJgYIKwYBBQUHMAKGGmh0dHA6Ly9ndi5zeW1jYi5jb20vZ3YuY3J0MA4G
A1UdDwEB/wQEAwIFoDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwHwYD
VR0RBBgwFoIUbG9jYWxob3N0LmRhcGxpZS5jb20wKwYDVR0fBCQwIjAgoB6gHIYa
aHR0cDovL2d2LnN5bWNiLmNvbS9ndi5jcmwwDAYDVR0TAQH/BAIwADBBBgNVHSAE
OjA4MDYGBmeBDAECATAsMCoGCCsGAQUFBwIBFh5odHRwczovL3d3dy5yYXBpZHNz
bC5jb20vbGVnYWwwDQYJKoZIhvcNAQELBQADggEBAGlPWTo4Z7oS6E5QPVhFr0kH
wdyGqFD3u93Nxa9L2Hfs2UrpJhhrliux/C9mxgk1O1bgVGhVvQNhiTUBSkJaIMCQ
aG5cQPBLV5u+vK+YFJHK8F+C0/vKU/xcEp4Ae1JNkIoXnfdPbGGbIS82HYp2uveD
dtv5/hqIdLfT6TRFZ7IbhCvTR0iYzPRsOB68PSWKHyVcolK2EHIHdo7Zjs/0tEF5
+4g/NKqX7zAMtMwQ9puPxm6M4BDnJjfiicH+4SeaRG72qpV56mHAeEOeIB4WQ61d
QyTmfubJfT/S1IBFfwqLln/Kf3PGyOvoOYocFpkfHvzFrviqljDDIyfVWx7hQpE=
-----END CERTIFICATE-----
```

### 05 Create Files from the provided Certificate (and intermediates)

#### Domain Name

`localhost.daplie.com`

#### Server Certificate

`my-server.crt.pem`:
```
-----BEGIN CERTIFICATE-----
MIIEqzCCA5OgAwIBAgIDBPiXMA0GCSqGSIb3DQEBCwUAMEcxCzAJBgNVBAYTAlVT
MRYwFAYDVQQKEw1HZW9UcnVzdCBJbmMuMSAwHgYDVQQDExdSYXBpZFNTTCBTSEEy
NTYgQ0EgLSBHMzAeFw0xNTA2MDkwOTI3NDJaFw0xNjA2MTEyMDA4MDdaMIGYMRMw
EQYDVQQLEwpHVDcyMjM4NTY5MTEwLwYDVQQLEyhTZWUgd3d3LnJhcGlkc3NsLmNv
bS9yZXNvdXJjZXMvY3BzIChjKTE1MS8wLQYDVQQLEyZEb21haW4gQ29udHJvbCBW
YWxpZGF0ZWQgLSBSYXBpZFNTTChSKTEdMBsGA1UEAxMUbG9jYWxob3N0LmRhcGxp
ZS5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCd49Z2PuWyX9qF
lURgq8E0OzMP6szDLutkYBmWsDdnekEw0mAUgmXcrhKcDog8ugDvcVqqOlice8ru
mL9OLMmRG3ObSzLV++2ETgBexpEawSJKj7UpCpw2EJtMFvSPXrHIMhkN4rUkh1Pz
oo7+i4/MVIoDPljPgxPOtFNStECA/3kD2DlkIY/wOlkF8T1lg7A8Q92aVXiyIHmX
ubrHdT4bhr4YRbyvltEB2eA+z4LLyqz+kMKHN1TYhMJUGur/C/Le3sNrhF2veqOC
dPBomTwpWwJ4PPmN0kqeT0N3D1CJVrt4Uj8W9N7fPsguYAehs5e06MCcAT3Dl1Eq
NNEJw/elAgMBAAGjggFMMIIBSDAfBgNVHSMEGDAWgBTDnPP800YINLvORn+gfFvz
4gjLWTBXBggrBgEFBQcBAQRLMEkwHwYIKwYBBQUHMAGGE2h0dHA6Ly9ndi5zeW1j
ZC5jb20wJgYIKwYBBQUHMAKGGmh0dHA6Ly9ndi5zeW1jYi5jb20vZ3YuY3J0MA4G
A1UdDwEB/wQEAwIFoDAdBgNVHSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwHwYD
VR0RBBgwFoIUbG9jYWxob3N0LmRhcGxpZS5jb20wKwYDVR0fBCQwIjAgoB6gHIYa
aHR0cDovL2d2LnN5bWNiLmNvbS9ndi5jcmwwDAYDVR0TAQH/BAIwADBBBgNVHSAE
OjA4MDYGBmeBDAECATAsMCoGCCsGAQUFBwIBFh5odHRwczovL3d3dy5yYXBpZHNz
bC5jb20vbGVnYWwwDQYJKoZIhvcNAQELBQADggEBAGlPWTo4Z7oS6E5QPVhFr0kH
wdyGqFD3u93Nxa9L2Hfs2UrpJhhrliux/C9mxgk1O1bgVGhVvQNhiTUBSkJaIMCQ
aG5cQPBLV5u+vK+YFJHK8F+C0/vKU/xcEp4Ae1JNkIoXnfdPbGGbIS82HYp2uveD
dtv5/hqIdLfT6TRFZ7IbhCvTR0iYzPRsOB68PSWKHyVcolK2EHIHdo7Zjs/0tEF5
+4g/NKqX7zAMtMwQ9puPxm6M4BDnJjfiicH+4SeaRG72qpV56mHAeEOeIB4WQ61d
QyTmfubJfT/S1IBFfwqLln/Kf3PGyOvoOYocFpkfHvzFrviqljDDIyfVWx7hQpE=
-----END CERTIFICATE-----
```

#### CA Certificates

#### INTERMEDIATE

`intermediate.crt.pem`:
```
-----BEGIN CERTIFICATE-----
MIIEJTCCAw2gAwIBAgIDAjp3MA0GCSqGSIb3DQEBCwUAMEIxCzAJBgNVBAYTAlVT
MRYwFAYDVQQKEw1HZW9UcnVzdCBJbmMuMRswGQYDVQQDExJHZW9UcnVzdCBHbG9i
YWwgQ0EwHhcNMTQwODI5MjEzOTMyWhcNMjIwNTIwMjEzOTMyWjBHMQswCQYDVQQG
EwJVUzEWMBQGA1UEChMNR2VvVHJ1c3QgSW5jLjEgMB4GA1UEAxMXUmFwaWRTU0wg
U0hBMjU2IENBIC0gRzMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCv
VJvZWF0eLFbG1eh/9H0WA//Qi1rkjqfdVC7UBMBdmJyNkA+8EGVf2prWRHzAn7Xp
SowLBkMEu/SW4ib2YQGRZjEiwzQ0Xz8/kS9EX9zHFLYDn4ZLDqP/oIACg8PTH2lS
1p1kD8mD5xvEcKyU58Okaiy9uJ5p2L4KjxZjWmhxgHsw3hUEv8zTvz5IBVV6s9cQ
DAP8m/0Ip4yM26eO8R5j3LMBL3+vV8M8SKeDaCGnL+enP/C1DPz1hNFTvA5yT2AM
QriYrRmIV9cE7Ie/fodOoyH5U/02mEiN1vi7SPIpyGTRzFRIU4uvt2UevykzKdkp
YEj4/5G8V1jlNS67abZZAgMBAAGjggEdMIIBGTAfBgNVHSMEGDAWgBTAephojYn7
qwVkDBF9qn1luMrMTjAdBgNVHQ4EFgQUw5zz/NNGCDS7zkZ/oHxb8+IIy1kwEgYD
VR0TAQH/BAgwBgEB/wIBADAOBgNVHQ8BAf8EBAMCAQYwNQYDVR0fBC4wLDAqoCig
JoYkaHR0cDovL2cuc3ltY2IuY29tL2NybHMvZ3RnbG9iYWwuY3JsMC4GCCsGAQUF
BwEBBCIwIDAeBggrBgEFBQcwAYYSaHR0cDovL2cuc3ltY2QuY29tMEwGA1UdIARF
MEMwQQYKYIZIAYb4RQEHNjAzMDEGCCsGAQUFBwIBFiVodHRwOi8vd3d3Lmdlb3Ry
dXN0LmNvbS9yZXNvdXJjZXMvY3BzMA0GCSqGSIb3DQEBCwUAA4IBAQCjWB7GQzKs
rC+TeLfqrlRARy1+eI1Q9vhmrNZPc9ZE768LzFvB9E+aj0l+YK/CJ8cW8fuTgZCp
fO9vfm5FlBaEvexJ8cQO9K8EWYOHDyw7l8NaEpt7BDV7o5UzCHuTcSJCs6nZb0+B
kvwHtnm8hEqddwnxxYny8LScVKoSew26T++TGezvfU5ho452nFnPjJSxhJf3GrkH
uLLGTxN5279PURt/aQ1RKsHWFf83UTRlUfQevjhq7A6rvz17OQV79PP7GqHQyH5O
ZI3NjGFVkP46yl0lD/gdo0p0Vk8aVUBwdSWmMy66S6VdU5oNMOGNX2Esr8zvsJmh
gP8L8mJMcCaY
-----END CERTIFICATE-----
```

#### ROOT

`root.crt.pem`:
```
-----BEGIN CERTIFICATE-----
MIIDVDCCAjygAwIBAgIDAjRWMA0GCSqGSIb3DQEBBQUAMEIxCzAJBgNVBAYTAlVT
MRYwFAYDVQQKEw1HZW9UcnVzdCBJbmMuMRswGQYDVQQDExJHZW9UcnVzdCBHbG9i
YWwgQ0EwHhcNMDIwNTIxMDQwMDAwWhcNMjIwNTIxMDQwMDAwWjBCMQswCQYDVQQG
EwJVUzEWMBQGA1UEChMNR2VvVHJ1c3QgSW5jLjEbMBkGA1UEAxMSR2VvVHJ1c3Qg
R2xvYmFsIENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2swYYzD9
9BcjGlZ+W988bDjkcbd4kdS8odhM+KhDtgPpTSEHCIjaWC9mOSm9BXiLnTjoBbdq
fnGk5sRgprDvgOSJKA+eJdbtg/OtppHHmMlCGDUUna2YRpIuT8rxh0PBFpVXLVDv
iS2Aelet8u5fa9IAjbkU+BQVNdnARqN7csiRv8lVK83Qlz6cJmTM386DGXHKTubU
1XupGc1V3sjs0l44U+VcT4wt/lAjNvxm5suOpDkZALeVAjmRCw7+OC7RHQWa9k0+
bw8HHa8sHo9gOeL6NlMTOdReJivbPagUvTLrGAMoUgRx5aszPeE4uwc2hGKceeoW
MPRfwCvocWvk+QIDAQABo1MwUTAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTA
ephojYn7qwVkDBF9qn1luMrMTjAfBgNVHSMEGDAWgBTAephojYn7qwVkDBF9qn1l
uMrMTjANBgkqhkiG9w0BAQUFAAOCAQEANeMpauUvXVSOKVCUn5kaFOSPeCpilKIn
Z57QzxpeR+nBsqTP3UEaBU6bS+5Kb1VSsyShNwrrZHYqLizz/Tt1kL/6cdjHPTfS
tQWVYrmm3ok9Nns4d0iXrKYgjy6myQzCsplFAMfOEVEiIuCl6rYVSAlk6l5PdPcF
PseKUgzbFbS9bZvlxrFUaKnjaZC2mqUPuLk/IH2uSrW4nOQdtqvmlKXBx4Ot2/Un
hw4EbNX/3aBd7YdStysVAq45pmp06drE57xNNB6pXE0zX5IJL4hmXXeXxx12E6nV
5fEWCRE11azbJHFwLJhWC9kXtNHjUStedejV0NxPNO3CBWaAocvmMw==
-----END CERTIFICATE-----
```

### 06 Bundle the certificates (for Caddy et al)

```bash
cat server/my-server.key.pem > privkey.pem

cat server/my-server.crt.pem > cert.pem

cat ca/intermediate.crt.pem > chain.pem

cat server/my-server.crt.pem ca/intermediate.crt.pem > fullchain.pem

cat server/root.crt.pem > root.pem
```

**Note**: The order *may* be important. I believe it *should* be from least to greatest authority as seen above.
