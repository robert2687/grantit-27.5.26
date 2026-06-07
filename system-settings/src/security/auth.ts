import type { NextFunction, Request, Response } from "express";
import type { JwtClaims, RoleName } from "../types";

declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId: string;
                roles: RoleName[];
                twoFactorEnabled: boolean;
            };
        }
    }
}

const VALID_ROLES: RoleName[] = ["admin", "evaluator", "copywriter", "reviewer", "viewer"];

function decodeBase64Url(value: string): string {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const pad = normalized.length % 4;
    const input = pad ? normalized + "=".repeat(4 - pad) : normalized;
    return Buffer.from(input, "base64").toString("utf8");
}

function decodeJwt(token: string): Partial<JwtClaims> | null {
    const parts = token.split(".");
    if (parts.length < 2) {
        return null;
    }
    try {
        return JSON.parse(decodeBase64Url(parts[1])) as Partial<JwtClaims>;
    } catch {
        return null;
    }
}

function extractClaims(req: Request): Partial<JwtClaims> {
    const authorization = req.header("authorization") ?? "";
    if (authorization.toLowerCase().startsWith("bearer ")) {
        const decoded = decodeJwt(authorization.slice(7).trim());
        if (decoded) {
            return decoded;
        }
    }

    const roles = String(req.header("x-roles") ?? "viewer")
        .split(",")
        .map((role) => role.trim().toLowerCase())
        .filter((role): role is RoleName => VALID_ROLES.includes(role as RoleName));

    return {
        sub: String(req.header("x-user-id") ?? "anonymous"),
        roles: roles.length ? roles : ["viewer"],
        two_factor: String(req.header("x-2fa") ?? "false").toLowerCase() === "true"
    };
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
    const claims = extractClaims(req);
    req.auth = {
        userId: claims.sub ?? "anonymous",
        roles: (claims.roles?.length ? claims.roles : ["viewer"]) as RoleName[],
        twoFactorEnabled: Boolean(claims.two_factor)
    };
    next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): Response | void {
    if (!req.auth?.roles.includes("admin")) {
        return res.status(403).json({ message: "Admin role required" });
    }
    if (!req.auth.twoFactorEnabled) {
        return res.status(403).json({ message: "2FA required for admin action" });
    }
    next();
}
