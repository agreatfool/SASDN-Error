const fetch = require('node-fetch');

let url = 'http://traefik.gateway.shinezone.com:8580/api/providers/kubernetes/backends';

function fetchApi(url) {
    fetch(url)
        .then((response) => {
            response.json()
                .then((json) => {
                    console.log('promise get json = ', json);
                })
                .catch((e) => {
                    console.log('catch error = ', e);
                })
        })
        .catch((e) => {
            console.log('catch error = ', e);
        });
}

async function asyncApi(url) {
    try {
        let response = await fetch(url);
        let json = await response.json();
        console.log('async get json = ', json);
    } catch (e) {
        console.log('catch error = ', e);
    }
}

console.log('Sample to show: ...');
fetchApi(url);
asyncApi(url).then(_ => _);