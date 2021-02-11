var request = require('request');
var express = require('express');
var app = express();
var fs = require('fs');
var config = {
    webshareAPIKey: "webshareioapikey",
    onlinesimAPIKey: "onlinesimapikey",
    twocaptchaAPIKey: "2captchaapikey",
    apikeys: [
        "test"
    ],
    CapMonster: true,
    CaptchaBypassExploit: true
};

if (!fs.existsSync('./data/config.json')) {
    fs.writeFileSync('./data/config.json', JSON.stringify(config));
}

config = JSON.parse(fs.readFileSync('./data/config.json', "utf8"));

API = {
    SolvedCaptchas: [],
    PhoneIds: [],
    Emails: [],
    Domains: [
        "foreskin.market",
        "support.eplcgames.com",
        "eplcgames.com",
        "kahoot.best",
        "ra.pe",
        "beastialityis.fun",
        "buyorphans.today"
    ],
    GetProxies(callback) 
    {
        request.get('https://proxy.webshare.io/api/proxy/list/', 
        {
            headers: {
                'Authorization' : `Token ${config.webshareAPIKey}`
            }
        }, (err, res, body) => {
            callback(JSON.parse(body).results);
        });
    },
    GetEmails(email, callback)
    {
        request.get(`http://foreskin.market/api/${email}`, {}, (err, res, body) => {
            if (body == "[]") {
                callback(0); 
            } else {
                callback(JSON.parse(body));
            }
        });
    },
    GetEmailDomain() {
        return API.Domains[Math.floor(Math.random()*API.Domains.length)];
    },
    GetEmailAddress() {
        return `${API.RandomString(20)}@${API.GetEmailDomain()}`;
    },
    RandomString(length) {
        let radom13chars = function () {
            return Math.random().toString(16).substring(2, 15)
        }
        let loops = Math.ceil(length / 13)
        return new Array(loops).fill(radom13chars).reduce((string, func) => {
            return string + func()
        }, '').substring(0, length)
    },
    IsValidDomain(domain) {
        return API.Domains.includes(domain);
    },
    CheckBalance(apikey, callback) 
    {
        request.get(`https://onlinesim.ru/api/getBalance.php?apikey=${apikey}`, {}, (err, res, body) => {
            if (res.statusCode == 200 || res.statusCode == 204) {
                callback(JSON.parse(body).balance);
            }
            else {
                callback(0);
            }
        });
    },
    GetNumbers(apikey, callback) 
    {
        request.get(`https://onlinesim.ru/api/getNumbersStats.php?apikey=${apikey}`, {}, (err, res, body) => {
            if (res.statusCode == 200 || res.statusCode == 204) {
                callback(JSON.parse(body));
            }
            else {
                callback(null);
            }
        });
    },
    GetNumberStart(apikey, service, country, callback) 
    {
        request.get(`https://onlinesim.ru/api/getNum.php?apikey=${apikey}&service=${service}&country=${country}`, {}, (err, res, body) => {
            if (res.statusCode == 200 || res.statusCode == 204) {
                callback(JSON.parse(body).tzid);
            } else {
                callback(null);
            }
        });
    },
    GetNumberEnd(apikey, tzid, callback) 
    {
        request.get(`https://onlinesim.ru/api/getState.php?apikey=${apikey}&tzid=${tzid}`, {}, (err, res, body) => {
            if (res.statusCode == 200 || res.statusCode == 204) {
                var resp = JSON.parse(body);
                for(var i = 0; i < resp.length; i++) {
                    if (resp[i].response == "TZ_NUM_WAIT") {
                        callback(resp[i].number);
                    }
                }
                callback(0);
            }
            else {
                callback(0);
            }
        });
    },
    GetNumberCode(apikey, tzid, callback)
    {
        request.get(`https://onlinesim.ru/api/getState.php?apikey=${apikey}&tzid=${tzid}`, {}, (err, res, body) => {
            if (res.statusCode == 200 || res.statusCode == 204) {
                if (JSON.parse(body)[0].response == "TZ_NUM_ANSWER") {
                    callback(JSON.parse(body)[0].msg);
                }
                else {
                    callback(0);
                }
            }
            else {
                callback(0);
            }
        });
    },
    GetCaptchaStart(key, sitekey, pageurl, callback) 
    {
        request.get(`${config.CapMonster ? "http://127.0.0.3" : "https://2captcha.com"}/in.php?key=${key}&method=userrecaptcha&googlekey=${sitekey}&pageurl=${pageurl}&json=1`, {}, (err, res, body) => {
             if (res.statusCode == 200 || res.statusCode == 204) {
                 if (body == "ERROR_NO_SLOT_AVAILABLE") {
                    callback(0);
                 } else {
                    if (JSON.parse(body).status == 1) {
                        callback(JSON.parse(body).request);
                    } else {
                        callback(0);
                    }
                 }
             }
             else {
                 callback(0);
             }
        });
    },
    GetCaptchaEnd(key, id, callback) 
    {
        request.get(`${config.CapMonster ? "http://127.0.0.3" : "https://2captcha.com"}/res.php?key=${key}&action=get&id=${id}&json=1`, {}, (err, res, body) => {
            if (res.statusCode == 200 || res.statusCode == 204) {
				if (config.CapMonster) {
                    if (body == "CAPCHA_NOT_READY") {
                        callback(null);
                    } else {
                        if (body.includes("OK|")) {
                            callback(body.split('|')[1]);
                        } else {
                            callback(null);
                        }
                    }
                } else {
                    if (res.statusCode == 200 || res.statusCode == 204) {
                        if (JSON.parse(body).status == 1) {
                            callback(JSON.parse(body).request);
                        } else {
                            callback(null);
                        }
                    } else {
                        callback(null);
                    }
                }
            } else {
                callback(null);
            }
        });
    },
    GetProxy(callback)
    {
        API.GetProxies((proxies) => {
            var proxy = proxies[Math.floor(Math.random()*proxies.length)];
            callback(`http://${proxy.username}:${proxy.password}@${proxy.proxy_address}:${proxy.ports.http}`);
        });
    },
    GetURL(text) 
    {
        var matches = text.match(/\bhttps?:\/\/\S+/gi);
        return matches;
    },
    GetRedirect(url, callback)
    {
        request.get(url, {}, (err, res, body) => {
            callback(res.request.uri.href);
        });
    }
};

DiscordAPI = {
    GetFingerprint(proxy, callback)
    {
        request.get('https://discord.com/api/v8/experiments', {
            headers: {
                'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                'x-context-properties' : 'eyJsb2NhdGlvbiI6IkxvZ2luIn0=',
                'x-track' : 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzg1LjAuNDE4My4xMjEgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6Ijg1LjAuNDE4My4xMjEiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6Imh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vIiwicmVmZXJyaW5nX2RvbWFpbiI6Ind3dy5nb29nbGUuY29tIiwic2VhcmNoX2VuZ2luZSI6Imdvb2dsZSIsInJlZmVycmVyX2N1cnJlbnQiOiIiLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiIiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjo5OTk5LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==',
                'x-super-properties' : 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzg2LjAuNDI0MC4xODMgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6Ijg2LjAuNDI0MC4xODMiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6Imh0dHBzOi8vZGlzY29yZC5jb20vIiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjcxMDczLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ=='
            },
            proxy: proxy
        }, (err, res, body) => {
            if (body == undefined) {
                API.GetProxy((proxy) => {
                    DiscordAPI.GetFingerprint()
                });
            }
            else {
                if (res.statusCode == 200) {
                    callback(JSON.parse(body).fingerprint);
                } else {
                    callback(0);
                }
            }
        });
    },
    GetUserInformationWithProxy(proxy, token, callback) 
    {
        request.get('https://discord.com/api/v8/users/@me', {
            headers: {
                'authorization' : token,
                'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                'x-super-properties' : 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzg2LjAuNDI0MC4xODMgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6Ijg2LjAuNDI0MC4xODMiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6Imh0dHBzOi8vZGlzY29yZC5jb20vIiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjcxMDczLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==',
            },
            proxy: proxy
        }, (err, res, body) => {
            if (res.statusCode == 200) {
                callback(JSON.parse(body));
            } else {
                callback(0);
            }
        });
    },
    GetUserInformation(token, callback) 
    {
        request.get('https://discord.com/api/v8/users/@me', {
            headers: {
                'authorization' : token,
                'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                'x-super-properties' : 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzg2LjAuNDI0MC4xODMgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6Ijg2LjAuNDI0MC4xODMiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6Imh0dHBzOi8vZGlzY29yZC5jb20vIiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjcxMDczLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==',
            }
        }, (err, res, body) => {
            if (res.statusCode == 401) {
                callback(0);
            } else {
                callback(JSON.parse(body));
            }
        });
    },
    JoinServer(proxy, token, invitecode, callback) 
    {
        request.post(`https://discordapp.com/api/v8/invites/${invitecode}`, {
            headers: {
                'content-type' : 'application/json',
                'authorization' : token,
                'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                'x-super-properties' : 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzg2LjAuNDI0MC4xODMgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6Ijg2LjAuNDI0MC4xODMiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6Imh0dHBzOi8vZGlzY29yZC5jb20vIiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjcxMDczLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==',
            },
            body: `{}`,
            proxy: proxy
        }, (err, res, body) => {
            if (res.statusCode == 200) {
                callback();
            } else {
                callback(JSON.parse(body));
            }
        });
    },
    CreateAccount(proxy, fingerprint, email, username, password, captcha, callback)
    {
        request.post('https://discord.com/api/v8/auth/register', {
            headers: {
                'content-type' : 'application/json',
                'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                'x-fingerprint' : fingerprint,
                'x-super-properties' : 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzg2LjAuNDI0MC4xODMgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6Ijg2LjAuNDI0MC4xODMiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6Imh0dHBzOi8vZGlzY29yZC5jb20vIiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjcxMDczLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ=='
            },
            proxy: proxy,
            body: `{"fingerprint":"${fingerprint}","email":"${email}","username":"${username}","password":"${password}","invite":null,"consent":true,"date_of_birth":"1992-03-04","gift_code_sku_id":null,"captcha_key":"${captcha}"}`
        }, (err, res, body) => {
            if (res.statusCode == 201 || res.statusCode == 200 || res.statusCode == 204) {
                callback(JSON.parse(body).token);
            } else {
                callback(0);
            }
        });
    },
    SendPhone(proxy, token, phonenumber, callback) 
    {
        request.post('https://discordapp.com/api/v8/users/@me/phone', {
            headers: {
                'content-type' : 'application/json',
                'authorization' : token,
                'x-super-properties' : 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfdmVyc2lvbiI6IjAuMC4zMDgiLCJvc192ZXJzaW9uIjoiMTAuMC4xODM2MiIsIm9zX2FyY2giOiJ4NjQiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjo2NzY2NywiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
                'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.308 Chrome/78.0.3904.130 Electron/7.3.2 Safari/537.36',
                'cookie' : '__stripe_mid=1522859c-5228-45f4-9732-db589298d2816a27ea; __cfduid=df75ba37c98ca8f6ba52da7bf5a2f465e1600010164; locale=en-US'
            }, 
            proxy: proxy,
            body: `{"phone":"${phonenumber}"}`
        }, (err, res, body) => {
            if (res == undefined) {
                API.GetProxy((proxy) => {
                    DiscordAPI.SendPhone(proxy, token, phonenumber, callback);
                });
            } else {
                if (res.statusCode == 204) {
                    callback(true);
                }
                else if (res.statusCode == 429) {
                    API.GetProxy((proxy) => {
                        DiscordAPI.SendPhone(proxy, token, phonenumber, callback);
                    });
                }
                else {
                    callback(false);
                }
            }
        });
    },
    SendPhone2(proxy, token, password, phone_token, callback)
    {
        request.post('https://discord.com/api/v8/users/@me/phone', {
            headers: {
                'content-type' : 'application/json',
                'authorization' : token,
                'x-super-properties' : 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfdmVyc2lvbiI6IjAuMC4zMDgiLCJvc192ZXJzaW9uIjoiMTAuMC4xODM2MiIsIm9zX2FyY2giOiJ4NjQiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjo2NzY2NywiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0=',
                'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.308 Chrome/78.0.3904.130 Electron/7.3.2 Safari/537.36',
                'cookie' : '__stripe_mid=1522859c-5228-45f4-9732-db589298d2816a27ea; __cfduid=df75ba37c98ca8f6ba52da7bf5a2f465e1600010164; locale=en-US'
            }, 
            proxy: proxy,
            body: `{"phone_token":"${phone_token}", "password":"${password}"}`
        }, (err, res, body) => {
            if (res == undefined) {
                API.GetProxy((proxy) => {
                    DiscordAPI.SendPhone2(proxy, token, password, phone_token, callback);
                });
            } else {
                if (res.statusCode == 204) {
                    callback(true);
                }
                else if (res.statusCode == 429) {
                    API.GetProxy((proxy) => {
                        DiscordAPI.SendPhone2(proxy, token, password, phone_token, callback);
                    });
                }
                else {
                    callback(false);
                }
            }
        });
    },
    SendCode(proxy, token, phonenumber, code, callback) 
    {
        request.post('https://discord.com/api/v8/phone-verifications/verify', {
            headers: {
                'content-type' : 'application/json',
                'authorization' : token,
                'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.0.308 Chrome/78.0.3904.130 Electron/7.3.2 Safari/537.36',
                'cookie' : '__stripe_mid=1522859c-5228-45f4-9732-db589298d2816a27ea; __cfduid=df75ba37c98ca8f6ba52da7bf5a2f465e1600010164; locale=en-US',
                'x-super-properties' : 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfdmVyc2lvbiI6IjAuMC4zMDgiLCJvc192ZXJzaW9uIjoiMTAuMC4xODM2MiIsIm9zX2FyY2giOiJ4NjQiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjo2NzY2NywiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbH0='
            },
            proxy: proxy,
            body: `{"code":"${code}", "phone": "${phonenumber}"}`
        }, (err, res, body) => {
            if (res == undefined) {
                API.GetProxy((proxy) => {
                    DiscordAPI.SendCode(proxy, token, code, callback);
                });
            } else {
                if (res.statusCode == 200) {
                    callback(JSON.parse(body).token);
                }
                else if (res.statusCode == 429) {
                    API.GetProxy((proxy) => {
                        DiscordAPI.SendCode(proxy, token, code, callback);
                    });
                }
                else {
                    callback(false);
                }
            }
        });
    },
    VerifyEmail(proxy, captcha, token, emailtoken, callback)
    {
        request.post('https://discord.com/api/v8/auth/verify', {
            headers: {
                'content-type' : 'application/json',
                'authorization' : token,
                'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                'x-super-properties' : 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzg2LjAuNDI0MC4xODMgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6Ijg2LjAuNDI0MC4xODMiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6Imh0dHBzOi8vZGlzY29yZC5jb20vIiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjcxMDczLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==',
            },
            proxy: proxy,
            body: `{"token":"${emailtoken}","captcha_key":"${captcha}"}`
        }, (err, res, body) => {
            if (body == undefined) {
                API.GetProxy((proxy) => {
                    DiscordAPI.VerifyEmail(proxy, captcha, token, emailtoken, callback);
                });
            }
            else {
                if (res.statusCode == 200) {
                    callback(JSON.parse(body).token);
                } else {
                    callback(0);
                }
            }
        });
    },
    SendPasswordResetRequest(proxy, email, callback)
    {
        request.post('https://discord.com/api/v8/auth/forgot', {
            headers: {
                'content-type' : 'application/json',
                'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                'x-super-properties' : 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzg2LjAuNDI0MC4xODMgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6Ijg2LjAuNDI0MC4xODMiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6Imh0dHBzOi8vZGlzY29yZC5jb20vIiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjcxMDczLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ=='
            },
            proxy: proxy,
            body: `{"email":"${email}"}`
        }, (err, res, body) => {
            if (res == undefined) {
                API.GetProxy((proxy) => {
                    DiscordAPI.SendPasswordResetRequest(proxy, email, callback);
                });
            } else {
                if (res.statusCode == 204) {
                    callback(true);
                }
                else if (res.statusCode == 429) {
                    API.GetProxy((proxy) => {
                        DiscordAPI.SendPasswordResetRequest(proxy, email, callback);
                    });
                }
                else {
                    callback(false);
                }
            }
        });
    },
    ResetPassword(proxy, token, password, callback)
    {
        request.post('https://discord.com/api/v8/auth/reset', {
            headers: {
                'content-type' : 'application/json',
                'user-agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
                'x-super-properties' : 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzg2LjAuNDI0MC4xODMgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6Ijg2LjAuNDI0MC4xODMiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6Imh0dHBzOi8vZGlzY29yZC5jb20vIiwicmVmZXJyaW5nX2RvbWFpbiI6ImRpc2NvcmQuY29tIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjcxMDczLCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ=='
            },
            proxy: proxy,
            body: `{"token":"${token}","password":"${password}"}`
        }, (err, res, body) => {
            if (res == undefined) {
                API.GetProxy((proxy) => {
                    DiscordAPI.ResetPassword(proxy, token, password, callback);
                });
            } else {
                if (res.statusCode == 200) {
                    callback(true);
                }
                else if (res.statusCode == 429) {
                    API.GetProxy((proxy) => {
                        DiscordAPI.ResetPassword(proxy, token, password, callback);
                    });
                }
                else {
                    callback(false);
                }
            }
        });
    }
};

app.get('/', (req, res) => {
    res.json({code: 200, msg: "OK"});
});

app.get('/api', (req, res) => {
    res.json({code: 200, msg: "OK"});
});

app.get('/api/getproxy', (req, res) => {
    if (!req.headers["x-api-key"]) {
        res.status(401).json({code: 401, msg: "There is no present x-api-key header."})
        return;
    }

    var apikey = req.headers["x-api-key"]; 

    if (!config.apikeys.includes(apikey)) {
        res.status(401).json({code: 401, msg: "Invalid API Key."});
        return;
    }

    API.GetProxy((proxy) => {
        res.status(200).json({proxy: proxy});
    });
});

app.get('/api/getemail', (req, res) => {
    if (!req.headers["x-api-key"]) {
        res.status(401).json({code: 401, msg: "There is no present x-api-key header."})
        return;
    }

    var apikey = req.headers["x-api-key"];  
    var domain = req.query.domain;
    var length = req.query.length;

    if (!config.apikeys.includes(apikey)) {
        res.status(401).json({code: 401, msg: "Invalid API Key."});
        return;
    }

    if (!length) {
        res.status(200).json({email: `${API.RandomString(15)}@${API.GetEmailDomain()}`});
        return;
    }

    if (!domain) {
        res.status(200).json({email: `${API.RandomString(length)}@${API.GetEmailDomain()}`});
        return;
    }

    if (!API.IsValidDomain(domain)) {
        res.status(400).json({code: 400, msg: "Invalid Domain."});
        return;
    }

    res.status(200).json({email: `${API.RandomString(length)}@${domain}`});
});

app.get('/api/checkemail', (req, res) => {
    if (!req.headers["x-api-key"]) {
        res.status(401).json({code: 401, msg: "There is no present x-api-key header."})
        return;
    }

    var apikey = req.headers["x-api-key"];  
    var email = req.query.email;

    if (!config.apikeys.includes(apikey)) {
        res.status(401).json({code: 401, msg: "Invalid API Key."});
        return;
    }

    API.GetEmails(email, (emails) => {
        res.status(200).json(emails);
    });
});

app.get('/api/getphone', (req, res) => {
    if (!req.headers["x-api-key"]) {
        res.status(401).json({code: 401, msg: "There is no present x-api-key header."})
        return;
    }

    var apikey = req.headers["x-api-key"];  
    var areacode = req.query.code;

    if (!config.apikeys.includes(apikey)) {
        res.status(401).json({code: 401, msg: "Invalid API Key."});
        return;
    }

    API.CheckBalance(config.onlinesimAPIKey, (balance) => {
        if (balance > 10.00) {
            API.GetNumberStart(config.onlinesimAPIKey, "discord", areacode, (tzid) => {
                API.GetNumberEnd(config.onlinesimAPIKey, tzid, (number) => {
                    res.status(200).json({number: number, tzid: tzid});
                });
            });
        }
        else {
            res.status(400).json({code: 400, msg: "Insufficient funds."});
        }
    });
});

app.get('/api/checkphone', (req, res) => {
    if (!req.headers["x-api-key"]) {
        res.status(401).json({code: 401, msg: "There is no present x-api-key header."})
        return;
    }

    var apikey = req.headers["x-api-key"];  
    var tzid = req.query.tzid;

    if (!config.apikeys.includes(apikey)) {
        res.status(401).json({code: 401, msg: "Invalid API Key."});
        return;
    }

    API.GetNumberCode(config.onlinesimAPIKey, tzid, (code) => {
        res.status(200).json({code: code});
    });
});

app.get('/api/getcaptcha', (req, res) => {
    if (!req.headers["x-api-key"]) {
        res.status(401).json({code: 401, msg: "There is no present x-api-key header."})
        return;
    }

    var apikey = req.headers["x-api-key"];  
    var sitekey = req.query.sitekey;
    var url = req.query.url;

    if (!config.apikeys.includes(apikey)) {
        res.status(401).json({code: 401, msg: "Invalid API Key."});
        return;
    }

    API.GetCaptchaStart(config.twocaptchaAPIKey, sitekey, url, (request) => {
        if (request != 0) {
            res.status(200).json({id: request});
        } else {
            res.status(400).json({code: 400, msg: "Unexpected error occurred."});
        }
    });
});

app.get('/api/checkcaptcha', (req, res) => {
    if (!req.headers["x-api-key"]) {
        res.status(401).json({code: 401, msg: "There is no present x-api-key header."})
        return;
    }

    var apikey = req.headers["x-api-key"];  
    var id = req.query.id;

    if (!config.apikeys.includes(apikey)) {
        res.status(401).json({code: 401, msg: "Invalid API Key."});
        return;
    }

    API.GetCaptchaEnd(config.twocaptchaAPIKey, id, (response) => {
        if (response != null) {
            res.status(200).json({gresponsetoken: response});
        }
    });
});

app.get('/discord/api', (req, res) => {
    if (!req.headers["x-api-key"]) {
        res.status(401).json({code: 401, msg: "There is no present x-api-key header."})
        return;
    }

    var apikey = req.headers["x-api-key"];  

    if (!config.apikeys.includes(apikey)) {
        res.status(401).json({code: 401, msg: "Invalid API Key."});
        return;
    }
});

app.get('/discord/api/createaccount', (req, res) => {
    if (!req.headers["x-api-key"]) {
        res.status(401).json({code: 401, msg: "There is no present x-api-key header."})
        return;
    }

    var apikey = req.headers["x-api-key"];  
    var username = req.query.username;
    var password = req.query.password;
    var email = req.query.email;

    if (!config.apikeys.includes(apikey)) {
        res.status(401).json({code: 401, msg: "Invalid API Key."});
        return;
    }

    console.log('[LOG] Requesting proxy..');
    API.GetProxy((proxy) => {
        console.log('[LOG] Received proxy..');
        console.log('[LOG] Requesting Fingerprint..');
        DiscordAPI.GetFingerprint(proxy, (fingerprint) => {
            if (fingerprint == 0) {
                console.log('[FAIL] Could not receive fingerprint. Check the request.');
                res.status(400).json({code: 400, msg: "Unexpected error occurred."});
            }
            else {
                console.log('[LOG] Received Fingerprint. Starting captcha solving process..');
                API.GetCaptchaStart(config.twocaptchaAPIKey, "6Lef5iQTAAAAAKeIvIY-DeexoO3gj7ryl9rLMEnn", "https://discord.com/register", (requestid) => {
                    if (requestid != 0) {
                        console.log('[LOG] Waiting for captcha to be solved..');
                        setInterval(() => {
                            if (!API.SolvedCaptchas.includes(requestid))
                            {
                                API.GetCaptchaEnd(config.twocaptchaAPIKey, requestid, (token) => {
                                    if (token != null) {
                                        console.log('[LOG] Captcha solved. Creating Account.. ');
                                        DiscordAPI.CreateAccount(proxy, fingerprint, email, username, password, token, (account) => {
                                            if (account != 0) {
                                                console.log('[LOG] Created Account. Check response.');
                                                res.status(200).json({token: account});
                                            } else {
                                                console.log('[FAIL] Could not create account. Check the request.');
                                                res.status(400).json({code: 400, msg: "Unexpected error occurred."});
                                            }
                                        });
                                        API.SolvedCaptchas.push(requestid);
                                    }
                                });
                            }
                        }, 5000);
                    } else {
                        console.log('[FAIL] Could not start solving the captcha. Check the request.');
                        res.status(400).json({code: 400, msg: "Unexpected error occurred."});
                    }
                });
            }
        });
    });
});

app.get('/discord/api/verifyaccount', (req, res) => {
    if (!req.headers["x-api-key"]) {
        res.status(401).json({code: 401, msg: "There is no present x-api-key header."})
        return;
    }

    var apikey = req.headers["x-api-key"];  
    var token = req.query.token;
    var type = req.query.type;

    if (!config.apikeys.includes(apikey)) {
        res.status(401).json({code: 401, msg: "Invalid API Key."});
        return;
    }

    if (type == 1) {
        console.log('[LOG] Requesting proxy..');
        API.GetProxy((proxy) => {
            console.log('[LOG] Received proxy..');
            console.log('[LOG] Gathering Email..');
            DiscordAPI.GetUserInformationWithProxy(proxy, token, (info) => {
            if (info != 0) 
            {
                setInterval(() => {
                    if (!API.Emails.includes(info.email))
                    {
                        API.GetEmails(info.email, (emails) => 
                        {
                            if (emails != 0) 
                            {
                                console.log('[LOG] Received Emails.. Checking Emails..');
                                var discordemail = emails[0];
                                if (discordemail.from[0].name == "Discord") {
                                    console.log('[LOG] Scraping URLs from email body..');
                                    var urls = API.GetURL(discordemail.body.text);
                                    var discordurl = urls[0].replace('\n', '');
                                    console.log('[LOG] Scraped Email Verification URL -> ' + discordurl);
                                    API.GetRedirect(discordurl, (redirect) => {
                                        console.log('[LOG] Mitigating Redirect.. Redirected URL -> ' + redirect);
                                        var emailtoken = redirect.split('#')[1].replace('token=', '');
                                        console.log('[LOG] Verifying Email with Email Token -> ' + emailtoken);
                                        console.log('[LOG] Solving Captcha.. ');
                                        API.GetCaptchaStart(config.twocaptchaAPIKey, "6Lef5iQTAAAAAKeIvIY-DeexoO3gj7ryl9rLMEnn", "https://discord.com/register", (requestid) => {
                                            if (requestid != 0) {
                                                console.log('[LOG] Waiting for captcha to be solved..');
                                                setInterval(() => {
                                                    if (!API.SolvedCaptchas.includes(requestid))
                                                    {
                                                        API.GetCaptchaEnd(config.twocaptchaAPIKey, requestid, (captcha) => {
                                                            if (captcha != null) {
                                                                console.log('[LOG] Captcha solved. Verifying account.. ');
                                                                DiscordAPI.VerifyEmail(proxy, captcha, token, emailtoken, (verified) => {
                                                                    if (verified != 0) {
                                                                        console.log('[LOG] Verified Account. Check response.');
                                                                        res.status(200).json({token: verified});
                                                                    } else {
                                                                        console.log('[FAIL] Could not verify account. Check the request.');
                                                                        res.status(400).json({code: 400, msg: "Unexpected error occurred."});
                                                                    }
                                                                });
                                                                API.SolvedCaptchas.push(requestid);
                                                            }
                                                        });
                                                    }
                                                }, 5000);
                                            } else {
                                                console.log('[FAIL] Could not start solving the captcha. Check the request.');
                                                res.status(400).json({code: 400, msg: "Unexpected error occurred."});
                                            }
                                        });
                                    });
                                } else {
                                    console.log('[FAIL] Could not get the user information associated to the account, this could mean the account has been disabled.');
                                    res.status(400).json({code: 400, msg: "Unexpected error occurred."});
                                }
                                API.Emails.push(info.email);
                            }
                        });
                    }
                }, 2000);
              } 
              else {
                console.log('[FAIL] Could not get the user information associated to the account, this could mean the account has been disabled.');
                res.status(400).json({code: 400, msg: "Unexpected error occurred."});
              }
            });
        });
    } else if (type == 2) {
        console.log('[LOG] Requesting proxy..');
        API.GetProxy((proxy) => {
            console.log('[LOG] Received proxy..');
            console.log('[LOG] Requesting phone number..');
            API.CheckBalance(config.onlinesimAPIKey, (balance) => {
                if (balance > 10.00) {
                    API.GetNumberStart(config.onlinesimAPIKey, "discord", "44", (tzid) => {
                        API.GetNumberEnd(config.onlinesimAPIKey, tzid, (number) => {
                            if (number != 0) {
                                console.log('[LOG] Received Phone number -> ' + number);
                                console.log('[LOG] Sending Phone number to Discord..');
                                DiscordAPI.SendPhone(proxy, token, number, (sent) => {
                                    if (sent) {
                                        console.log('[LOG] Sent Phone number to Discord. Waiting for codes..');
                                        setInterval(() => {
                                            if (!API.PhoneIds.includes(tzid)) 
                                            {
                                                API.GetNumberCode(config.onlinesimAPIKey, tzid, (code) => {
                                                    if (code != 0) {
                                                        console.log(`[LOG] Received Code from Discord -> ${code}. Verifying Account..`);
                                                        DiscordAPI.SendCode(proxy, token, code, (sentcode) => {
                                                            if (sentcode) {
                                                                console.log('[LOG] Sent Code. Verified Account.');
                                                                res.status(200).json({token: token});
                                                            } else {
                                                                console.log('[FAIL] Failed to send code to discord.');
                                                                res.status(400).json({code: 400, msg: "Unexpected error occurred."});
                                                            }
                                                        });
                                                        API.PhoneIds.push(tzid);
                                                    }
                                                });
                                            } 
                                        }, 3000);
                                    } else {
                                        console.log('[FAIL] Failed sending phone number to Discord.. Check request');
                                        res.status(400).json({code: 400, msg: "Unexpected error occurred."});
                                    }
                                });
                            }
                        });
                    });
                }
                else {
                    res.status(400).json({code: 400, msg: "Insufficient funds."});
                }
            });
        });
    } else {
        res.status(400).json({code: 400, msg: "Invalid Verification Type."});
    }
});

app.get('/discord/api/userinformation', (req, res) => {
    if (!req.headers["x-api-key"]) {
        res.status(401).json({code: 401, msg: "There is no present x-api-key header."})
        return;
    }

    var apikey = req.headers["x-api-key"];  
    var token = req.query.token;

    if (!config.apikeys.includes(apikey)) {
        res.status(401).json({code: 401, msg: "Invalid API Key."});
        return;
    }

    DiscordAPI.GetUserInformation(token, (info) => {
        res.status(200).json({info: info});
    });
});

app.get('/discord/api/joinserver', (req, res) => {
    if (!req.headers["x-api-key"]) {
        res.status(401).json({code: 401, msg: "There is no present x-api-key header."})
        return;
    }

    var apikey = req.headers["x-api-key"];  
    var token = req.query.token;
    var serverinvite = req.query.invite;

    if (!config.apikeys.includes(apikey)) {
        res.status(401).json({code: 401, msg: "Invalid API Key."});
        return;
    }

    API.GetProxy((proxy) => {
        DiscordAPI.JoinServer(proxy, token, serverinvite, () => {
            res.status(200).json({success: 200, msg: "Joined."});
        });
    });
});

app.listen(1337, () => {
    console.log("[API] Listening on Port 1337");
});