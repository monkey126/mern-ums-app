import { Request } from 'express';

export interface RequestInfo {
	ip?: string;
	userAgent?: string;
}

export function getRequestInfo(req: Request): RequestInfo {
	const info: RequestInfo = {};
	if (req.ip) info.ip = req.ip;
	const userAgent = req.get('user-agent');
	if (userAgent) info.userAgent = userAgent;
	return info;
}
