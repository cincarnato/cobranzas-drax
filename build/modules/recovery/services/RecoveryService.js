import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { access, mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
class RecoveryService {
    constructor() {
        this.backupsDirectory = resolve(process.cwd(), "recovery-dumps");
    }
    async dump(masterPassword) {
        this.assertRecoveryEnabled();
        this.assertMasterPassword(masterPassword);
        const mongoUri = this.getMongoUri();
        await mkdir(this.backupsDirectory, { recursive: true });
        const filename = `mongo-dump-${this.getTimestamp()}.archive.gz`;
        const archivePath = resolve(this.backupsDirectory, filename);
        const output = await this.runMongoCommand("mongodump", [
            "--uri",
            mongoUri,
            "--archive=" + archivePath,
            "--gzip",
        ]);
        return {
            archivePath,
            filename,
            command: "mongodump",
            output,
        };
    }
    async restore(masterPassword, archivePath, drop = true) {
        this.assertRecoveryEnabled();
        this.assertMasterPassword(masterPassword);
        const mongoUri = this.getMongoUri();
        const resolvedArchivePath = this.resolveArchivePath(archivePath);
        const args = [
            "--uri",
            mongoUri,
            "--archive=" + resolvedArchivePath,
            "--gzip",
        ];
        if (drop) {
            args.push("--drop");
        }
        const output = await this.runMongoCommand("mongorestore", args);
        return {
            archivePath: resolvedArchivePath,
            filename: basename(resolvedArchivePath),
            command: "mongorestore",
            output,
        };
    }
    async saveUploadedArchive(fileStream, filename) {
        this.assertRecoveryEnabled();
        await mkdir(this.backupsDirectory, { recursive: true });
        const safeFilename = basename(filename || "uploaded-mongo-dump.archive.gz");
        const archivePath = resolve(this.backupsDirectory, `uploaded-mongo-dump-${this.getTimestamp()}-${safeFilename}`);
        await pipeline(fileStream, createWriteStream(archivePath));
        return archivePath;
    }
    async resolveDownloadPath(archivePath) {
        this.assertRecoveryEnabled();
        const resolvedArchivePath = this.resolveArchivePath(archivePath);
        await access(resolvedArchivePath);
        return resolvedArchivePath;
    }
    assertRecoveryEnabled() {
        const enabled = ["true", "1", "yes", "on"].includes((process.env.RECOVERY_ENABLED || "").toLowerCase());
        if (!enabled) {
            const error = new Error("Recovery esta deshabilitado. Configure RECOVERY_ENABLED=true para habilitarlo.");
            error.statusCode = 403;
            throw error;
        }
    }
    assertMasterPassword(masterPassword) {
        const configuredPassword = process.env.RECOVERY_MASTER_PASSWORD;
        if (!configuredPassword) {
            const error = new Error("RECOVERY_MASTER_PASSWORD no esta configurada.");
            error.statusCode = 500;
            throw error;
        }
        if (!masterPassword || masterPassword !== configuredPassword) {
            const error = new Error("Password maestra invalida.");
            error.statusCode = 403;
            throw error;
        }
    }
    getMongoUri() {
        const mongoUri = process.env.MONGO_URI || process.env.DRAX_MONGO_URI;
        if (!mongoUri) {
            const error = new Error("MONGO_URI o DRAX_MONGO_URI no esta configurada.");
            error.statusCode = 500;
            throw error;
        }
        return mongoUri;
    }
    resolveArchivePath(archivePath) {
        if (!archivePath) {
            const error = new Error("Debe indicar el archivo de dump a restaurar.");
            error.statusCode = 400;
            throw error;
        }
        const resolvedArchivePath = resolve(archivePath);
        const backupsDirectory = this.backupsDirectory + "/";
        if (!resolvedArchivePath.startsWith(backupsDirectory)) {
            const error = new Error("El archivo de restore debe estar dentro del directorio recovery-dumps.");
            error.statusCode = 400;
            throw error;
        }
        return resolvedArchivePath;
    }
    getTimestamp() {
        return new Date().toISOString().replace(/[:.]/g, "-");
    }
    runMongoCommand(command, args) {
        return new Promise((resolvePromise, rejectPromise) => {
            const child = spawn(command, args, { shell: false });
            const output = [];
            child.stdout.on("data", (data) => output.push(data.toString()));
            child.stderr.on("data", (data) => output.push(data.toString()));
            child.on("error", (error) => {
                if (error?.code === "ENOENT") {
                    error.message = `${command} no esta instalado o no esta disponible en PATH.`;
                }
                rejectPromise(error);
            });
            child.on("close", (code) => {
                const joinedOutput = output.join("").trim();
                if (code === 0) {
                    resolvePromise(joinedOutput);
                    return;
                }
                const error = new Error(joinedOutput || `${command} finalizo con codigo ${code}.`);
                error.statusCode = 500;
                rejectPromise(error);
            });
        });
    }
}
export default RecoveryService;
export { RecoveryService };
