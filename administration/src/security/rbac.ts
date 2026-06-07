import type { NextFunction, Request, Response } from "express";
import type { JwtClaims, Permission, Role, RoleName } from "../types";

export interface AuthContext {
    userId: string;
    roles: RoleName[];
    permissions: Permission[];
    twoFactorEnabled: boolean;
}

declare global {
    namespace Express {
        interface Request {
            auth?: AuthContext;
        }
    }
}

export function defaultRolePermissions(): Record<RoleName, Permission[]> {
    return {
        admin: [
            "users.read",
            "users.write",
            "roles.read",
            "roles.write",
            "templates.read",
            "templates.write",
            "integrations.read",
            "integrations.write",
            "integrations.rotate",
            "audit.read",
            "metrics.read"
        ],
        evaluator: ["templates.read"],
        copywriter: ["templates.read"],
        reviewer: ["templates.read"],
        viewer: ["users.read", "roles.read", "templates.read", "integrations.read", "metrics.read"]
    };
}

const VALID_ROLES: RoleName[] = ["admin", "evaluator", "copywriter", "reviewer", "viewer"];

function decodeBase64Url(value: string): string {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4;
    const input = padding ? normalized + "=".repeat(4 - padding) : normalized;
    return Buffer.from(input, "base64").toString("utf8");
}

function decodeJwtPayload(token: string): Partial<JwtClaims> | null {
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
        const token = authorization.slice(7).trim();
        const decoded = decodeJwtPayload(token);
        if (decoded) {
            return decoded;
        }
    }

    const roleHeader = String(req.header("x-roles") ?? "viewer");
    const roles = roleHeader
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter((value): value is RoleName =>
            VALID_ROLES.includes(value as RoleName)
        );

    return {
        sub: String(req.header("x-user-id") ?? "anonymous"),
        roles: roles.length ? roles : ["viewer"],
        two_factor: String(req.header("x-2fa") ?? "false").toLowerCase() === "true"
    };
}

export function authMiddleware(rolesProvider: () => Role[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const claims = extractClaims(req);
        const resolvedRoles: RoleName[] =
            claims.roles && claims.roles.length ? (claims.roles as RoleName[]) : ["viewer"];
        const roleMap = new Map(rolesProvider().map((role) => [role.name, role.permissions]));

        const permissionSet = new Set<Permission>(claims.permissions ?? []);
        for (const roleName of resolvedRoles) {
            for (const permission of roleMap.get(roleName) ?? []) {
                permissionSet.add(permission);
            }
        }

        req.auth = {
            userId: claims.sub ?? "anonymous",
            roles: resolvedRoles,
            permissions: Array.from(permissionSet),
            twoFactorEnabled: Boolean(claims.two_factor)
        };
        next();
    };
}

export function requirePermission(permission: Permission) {
    return (req: Request, res: Response, next: NextFunction): Response | void => {
        const auth = req.auth;
        if (!auth || !auth.permissions.includes(permission)) {
            return res.status(403).json({ message: `Missing permission: ${permission}` });
        }
        next();
    };
}

export function requireAdminWith2FA(req: Request, res: Response, next: NextFunction): Response | void {
    const auth = req.auth;
    if (!auth || !auth.roles.includes("admin")) {
        return res.status(403).json({ message: "Admin role required" });
    }
    if (!auth.twoFactorEnabled) {
        return res.status(403).json({ message: "2FA required for admin action" });
    }
    next();
}