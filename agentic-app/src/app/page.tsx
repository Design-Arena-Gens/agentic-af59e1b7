'use client';

import { useCallback, useMemo, useState } from 'react';
import type { AgentResult } from '@/lib/emailAgent';
import styles from './page.module.css';

const createEmptyResult = (): AgentResult => ({
  unsubscribed: [],
  replied: [],
  important: [],
  marketing: [],
  logs: [],
});

export default function Home() {
  const [imapHost, setImapHost] = useState('imap.gmail.com');
  const [imapPort, setImapPort] = useState('993');
  const [imapSecure, setImapSecure] = useState(true);
  const [imapMailbox, setImapMailbox] = useState('INBOX');
  const [imapUser, setImapUser] = useState('');
  const [imapPassword, setImapPassword] = useState('');

  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('465');
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');

  const [dryRun, setDryRun] = useState(false);
  const [maxMessages, setMaxMessages] = useState('50');
  const [unsubscribeHttp, setUnsubscribeHttp] = useState(true);
  const [unsubscribeMailto, setUnsubscribeMailto] = useState(true);
  const [replyToImportant, setReplyToImportant] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AgentResult>(() => createEmptyResult());
  const [error, setError] = useState<string | null>(null);

  const pendingActions = useMemo(() => {
    if (!result) return [];
    return [
      ...result.unsubscribed.filter((item) => item.status === 'failed'),
      ...result.replied.filter((item) => item.status === 'failed'),
    ];
  }, [result]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setError(null);
      setResult(createEmptyResult());

      try {
        const response = await fetch('/api/agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imapHost,
            imapPort,
            imapSecure,
            imapMailbox,
            imapUser,
            imapPassword,
            smtpHost,
            smtpPort,
            smtpSecure,
            smtpUser,
            smtpPassword,
            dryRun,
            maxMessages,
            unsubscribeHttp,
            unsubscribeMailto,
            replyToImportant,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(
            payload?.details?.message ??
              payload?.error ??
              `Agent failed with status ${response.status}`
          );
        }

        const payload = (await response.json()) as AgentResult;
        setResult(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      dryRun,
      imapHost,
      imapMailbox,
      imapPassword,
      imapPort,
      imapSecure,
      imapUser,
      maxMessages,
      replyToImportant,
      smtpHost,
      smtpPassword,
      smtpPort,
      smtpSecure,
      smtpUser,
      unsubscribeHttp,
      unsubscribeMailto,
    ]
  );

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <section>
          <h1>Inbox Automation Agent</h1>
          <p className={styles.subtitle}>
            Connect your IMAP inbox and let the agent unsubscribe from marketing
            blasts while sending polished replies to important emails.
          </p>
        </section>

        <form className={styles.form} onSubmit={handleSubmit}>
          <fieldset>
            <legend>IMAP Settings</legend>
            <div className={styles.fieldGroup}>
              <label>
                Host
                <input
                  type="text"
                  value={imapHost}
                  onChange={(event) => setImapHost(event.target.value)}
                  required
                />
              </label>
              <label>
                Port
                <input
                  type="number"
                  value={imapPort}
                  onChange={(event) => setImapPort(event.target.value)}
                  required
                />
              </label>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={imapSecure}
                  onChange={(event) => setImapSecure(event.target.checked)}
                />
                Secure (TLS)
              </label>
              <label>
                Mailbox
                <input
                  type="text"
                  value={imapMailbox}
                  onChange={(event) => setImapMailbox(event.target.value)}
                  required
                />
              </label>
            </div>
            <div className={styles.fieldGroup}>
              <label>
                Username
                <input
                  type="email"
                  value={imapUser}
                  onChange={(event) => setImapUser(event.target.value)}
                  required
                />
              </label>
              <label>
                App Password
                <input
                  type="password"
                  value={imapPassword}
                  onChange={(event) => setImapPassword(event.target.value)}
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>SMTP Settings</legend>
            <div className={styles.fieldGroup}>
              <label>
                Host
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(event) => setSmtpHost(event.target.value)}
                  required
                />
              </label>
              <label>
                Port
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(event) => setSmtpPort(event.target.value)}
                  required
                />
              </label>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={smtpSecure}
                  onChange={(event) => setSmtpSecure(event.target.checked)}
                />
                Secure (TLS)
              </label>
            </div>
            <div className={styles.fieldGroup}>
              <label>
                Username
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(event) => setSmtpUser(event.target.value)}
                  required
                />
              </label>
              <label>
                App Password
                <input
                  type="password"
                  value={smtpPassword}
                  onChange={(event) => setSmtpPassword(event.target.value)}
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Agent Behavior</legend>
            <div className={styles.fieldGroup}>
              <label>
                Max messages to process
                <input
                  type="number"
                  value={maxMessages}
                  onChange={(event) => setMaxMessages(event.target.value)}
                  min={1}
                  max={500}
                  required
                />
              </label>
            </div>
            <div className={styles.behaviorToggles}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(event) => setDryRun(event.target.checked)}
                />
                Dry run (no outbound network calls)
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={unsubscribeHttp}
                  onChange={(event) =>
                    setUnsubscribeHttp(event.target.checked)
                  }
                />
                Follow HTTP unsubscribe links
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={unsubscribeMailto}
                  onChange={(event) =>
                    setUnsubscribeMailto(event.target.checked)
                  }
                />
                Send mailto unsubscribe requests
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={replyToImportant}
                  onChange={(event) =>
                    setReplyToImportant(event.target.checked)
                  }
                />
                Reply to important messages
              </label>
            </div>
          </fieldset>

          <button
            type="submit"
            className={styles.submit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Running agent…' : 'Run Inbox Automation'}
          </button>
        </form>

        {error ? (
          <div className={styles.errorBox}>
            <strong>Agent error:</strong> {error}
          </div>
        ) : null}

        <section className={styles.results}>
          <div className={styles.resultColumn}>
            <h2>Marketing Unsubscribes</h2>
            {result.unsubscribed.length === 0 ? (
              <p className={styles.emptyState}>No marketing messages found.</p>
            ) : (
              <ul>
                {result.unsubscribed.map((item, index) => (
                  <li key={`${item.target}-${index}`}>
                    <header>
                      <span>{item.subject ?? 'No subject'}</span>
                      <span className={styles.tag} data-status={item.status}>
                        {item.status}
                      </span>
                    </header>
                    <p>{item.from}</p>
                    <p>
                      Action: {item.action} → {item.target}
                    </p>
                    {item.details ? <p>{item.details}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.resultColumn}>
            <h2>Formal Replies</h2>
            {result.replied.length === 0 ? (
              <p className={styles.emptyState}>No important emails handled.</p>
            ) : (
              <ul>
                {result.replied.map((item, index) => (
                  <li key={`${item.to}-${index}`}>
                    <header>
                      <span>{item.subject ?? 'No subject'}</span>
                      <span className={styles.tag} data-status={item.status}>
                        {item.status}
                      </span>
                    </header>
                    <p>Recipient: {item.to ?? 'Unknown'}</p>
                    {item.details ? <p>{item.details}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={styles.diagnostics}>
          <h2>Triage Summary</h2>
          <div className={styles.summary}>
            <dl>
              <div>
                <dt>Marketing identified</dt>
                <dd>{result.marketing.length}</dd>
              </div>
              <div>
                <dt>Important emails</dt>
                <dd>{result.important.length}</dd>
              </div>
              <div>
                <dt>Pending actions</dt>
                <dd>{pendingActions.length}</dd>
              </div>
            </dl>
          </div>

          <h3>Agent Logs</h3>
          {result.logs.length === 0 ? (
            <p className={styles.emptyState}>Run the agent to see detailed logs.</p>
          ) : (
            <ul className={styles.logList}>
              {result.logs.map((entry, index) => (
                <li key={`${entry.message}-${index}`} data-level={entry.level}>
                  <strong>{entry.level.toUpperCase()}</strong> {entry.message}
                  {entry.context ? (
                    <pre>{JSON.stringify(entry.context, null, 2)}</pre>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
