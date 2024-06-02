import {CorsOptions, HttpMethod, setupAuthPath, setupExpress, setupNoAuthPath} from "@smartbonds/smartbonds-api-lib";
import {renewSecrets} from "./secrets.js";

export const smartbonds_secrets_api = setupExpress(setup);

function setup() {
    const permissiveCors: CorsOptions = {
        methods: "POST",
        origin: "*"
    }

    setupNoAuthPath(HttpMethod.POST, "/secrets/renew", renewSecrets, permissiveCors);
}
