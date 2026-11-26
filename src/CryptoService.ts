import Stream from "node:stream";
import crypto from "node:crypto";

export default class CryptoService {

    public static instance = new CryptoService();

    public hashBuffer(buffer: Buffer | Stream, encode: BufferEncoding = "hex") {
        const sha256 = crypto.createHash("sha256");
        if (buffer instanceof Stream) {
            return new Promise<string>((resolve, reject) => {
                buffer.on("end", () => {
                    sha256.end(() => {
                        resolve(sha256.digest(encode));
                    });
                });
                buffer.pipe(sha256);
            });
        }
        return sha256.update(buffer).digest(encode);
    }


}