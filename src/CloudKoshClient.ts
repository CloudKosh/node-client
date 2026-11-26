import { hash } from "node:crypto";
import mime from "mime-types";
import FetchBuilder from "@web-atoms/fetch-builder";
import { Readable } from "node:stream";
import CryptoService from "./CryptoService.js";
import { createReadStream, openAsBlob, statSync } from "node:fs";
import { parse } from "node:path";

export default class CloudKoshClient {

    client: FetchBuilder;

    public static async connect({
        host,
        namespace,
        bucket,
        accessKey,
        secretAccessKey,
    }) {
        const c = new CloudKoshClient(`https://${host}/v1/api`, namespace, bucket);
        await c.login(accessKey, secretAccessKey);
        return c;
    }

    constructor(
        public readonly baseUrl: string,
        public readonly namespace: string,
        public readonly bucket: string
    ) {

    }

    async upload(path: string, body: Readable) {
        // create sha256
    }

    async uploadFile(path: string, filePath: string) {

        // const { size } = statSync(filePath);

        const sha256Base64 = await CryptoService.instance.hashBuffer(createReadStream(filePath));

        const { base } = parse(path);

        

        const blob = await openAsBlob(filePath, { type: mime.lookup(base) || "application/octet-stream" });

        // break file into smaller slices of 256mb
        await this.client
            .post(`files/${this.namespace}/${this.bucket}/${path}`)
            .form("sha256Base64", sha256Base64)
            .form("file" , blob, "file.dat")
            .asJson();
        
    }

    // private async uploadBlock(path, body: Readable) {
    // }

    private async login(key: any, secretAccessKey: any) {
        const nonce = await FetchBuilder.get("auth/nonce").asText();
        const sha256Base64 = hash("sha256", nonce + secretAccessKey, "base64"); 
        const { authorization } = await FetchBuilder.post("auth/login").jsonBody({ key, nonce , sha256Base64 }).asJson<{ authorization }>();
        this.client = FetchBuilder.header("Authorization", `Bearer ${authorization}`);
    }
    
}