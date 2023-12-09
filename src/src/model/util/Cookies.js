
export default class Cookies { 

    // Função para converter um objeto para uma string JSON
    objectToJsonString(obj) {
        return JSON.stringify(obj);
    }

    // Função para converter uma string JSON de volta para um objeto
    jsonStringToObject(str) {
        return JSON.parse(str);
    }

    // Exemplo de como adicionar um objeto JSON a um cookie
    setJsonInCookie(cookieName, jsonObject, expirationDays) {
        const jsonString = this.objectToJsonString(jsonObject);

        const date = new Date();
        date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();

        document.cookie = `${cookieName}=${jsonString};${expires};path=/`;
    }

    // Exemplo de como obter um objeto JSON de um cookie
    getJsonFromCookie(cookieName) {
        const name = cookieName + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');

        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i].trim();
            if (cookie.indexOf(name) === 0) {
                const jsonString = cookie.substring(name.length, cookie.length);
                return this.jsonStringToObject(jsonString);
            }
        }

        return null;
    }

    criaCookies(key, values, time) {
        const myJsonObject = { values: values }
        this.setJsonInCookie(key, myJsonObject, time)
    }

    getCookie(key) {
        return this.getJsonFromCookie(key) || null
    }
}
