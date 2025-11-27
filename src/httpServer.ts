import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { createAlgorandServer } from './serverCore.js';

type Session = {
    transport: StreamableHTTPServerTransport;
};

const app = express();
const PORT = Number(process.env.PORT) || 8081;

app.use(express.json({ limit: '2mb' }));
app.use(
    cors({
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'mcp-session-id', 'mcp-protocol-version'],
        exposedHeaders: ['mcp-session-id', 'mcp-protocol-version'],
    })
);

const sessions = new Map<string, Session>();

async function createSession(): Promise<Session> {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
            if (sessionId) {
                sessions.set(sessionId, { transport });
            }
        },
    });

    transport.onclose = () => {
        if (transport.sessionId) {
            sessions.delete(transport.sessionId);
        }
    };

    const server = createAlgorandServer();
    await server.connect(transport);
    return { transport };
}

function getSessionFromRequest(req: Request) {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    return sessionId ? sessions.get(sessionId) : undefined;
}

app.get('/healthz', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

app.post('/mcp', async (req: Request, res: Response) => {
    try {
        let session = getSessionFromRequest(req);

        if (!session) {
            if (!isInitializeRequest(req.body)) {
                res.status(400).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Bad Request: No valid session ID provided',
                    },
                    id: null,
                });
                return;
            }
            session = await createSession();
        }

        await session.transport.handleRequest(req, res, req.body);
    } catch (error: any) {
        console.error('Error handling MCP POST request', error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error',
                },
                id: null,
            });
        }
    }
});

const handleSessionRequest = async (req: Request, res: Response) => {
    const session = getSessionFromRequest(req);
    if (!session) {
        res.status(400).send('Invalid or missing session ID');
        return;
    }

    await session.transport.handleRequest(req, res);
};

app.get('/mcp', handleSessionRequest);
app.delete('/mcp', handleSessionRequest);

app.listen(PORT, () => {
    console.log(`Algorand MCP Streamable HTTP server listening on port ${PORT}`);
});

