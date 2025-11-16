import { NextResponse } from 'next/server';
import { runEmailAutomation, agentConfigSchema } from '@/lib/emailAgent';

export const runtime = 'nodejs';

const booleanFrom = (value: unknown, fallback: boolean) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  return fallback;
};

const numberFrom = (value: unknown, fallback: number) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const config = agentConfigSchema.parse({
      imap: {
        host: body.imapHost,
        port: numberFrom(body.imapPort, 993),
        secure: booleanFrom(body.imapSecure, true),
        user: body.imapUser,
        password: body.imapPassword,
        mailbox: body.imapMailbox ?? 'INBOX',
      },
      smtp: {
        host: body.smtpHost,
        port: numberFrom(body.smtpPort, 465),
        secure: booleanFrom(body.smtpSecure, true),
        user: body.smtpUser,
        password: body.smtpPassword,
      },
      options: {
        dryRun: booleanFrom(body.dryRun, false),
        maxMessages: numberFrom(body.maxMessages, 50),
        unsubscribeHttp: booleanFrom(body.unsubscribeHttp, true),
        unsubscribeMailto: booleanFrom(body.unsubscribeMailto, true),
        replyToImportant: booleanFrom(body.replyToImportant, true),
      },
    });

    const result = await runEmailAutomation(config);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Agent execution failed', error);
    return NextResponse.json(
      {
        error: 'Agent execution failed',
        details:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error,
      },
      { status: 500 }
    );
  }
}
