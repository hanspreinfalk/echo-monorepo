import { EMBED_CONFIG } from './config';
import { chatBubbleIcon, closeIcon } from './icons';
import {
  fetchWidgetAppearanceForLauncher,
  resolveLauncherButtonColors,
} from './launcher-appearance';
import type { EmbedWidgetAppearance } from './launcher-appearance';
import { PageAgent } from 'page-agent';

// cd apps/demo && VITE_CONVEX_SITE_URL=https://wandering-beagle-503.convex.site VITE_WIDGET_URL=https://echo-monorepo-widget.vercel.app pnpm build

/** Above page-agent SimulatorMask (z-index 2147483641) so the chat iframe and Stop stay clickable. */
const WIDGET_Z_PANEL = 2147483646;
const WIDGET_Z_BUTTON = 2147483647;

(function() {
  const HOST_CONSOLE_MAX = 120;
  const hostConsoleLogs: string[] = [];
  let scheduleHostContextFlush: () => void = () => {};

  function pushHostLogLine(line: string) {
    hostConsoleLogs.push(line);
    if (hostConsoleLogs.length > HOST_CONSOLE_MAX) {
      hostConsoleLogs.splice(0, hostConsoleLogs.length - HOST_CONSOLE_MAX);
    }
    scheduleHostContextFlush();
  }

  /**
   * Single-line text DevTools would show for one console call (args joined with a space).
   * Avoids `[log]` prefixes and raw JSON.stringify-only formatting so the AI sees lines
   * closer to what appears in the browser console.
   */
  function formatConsoleArg(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return String(value);
    }
    if (typeof value === 'symbol') return String(value);
    if (value instanceof Error) {
      return typeof value.stack === 'string' ? value.stack : value.toString();
    }
    if (typeof value === 'function') {
      const s = Function.prototype.toString.call(value as (...args: unknown[]) => unknown);
      return s.length > 500 ? `${s.slice(0, 497)}…` : s;
    }
    if (typeof value === 'object') {
      if (value instanceof Date) return value.toISOString();
      try {
        return JSON.stringify(value);
      } catch {
        return Object.prototype.toString.call(value);
      }
    }
    return String(value);
  }

  function formatConsoleCallLine(args: unknown[]): string {
    return args.map(formatConsoleArg).join(' ');
  }

  /** First `at …` frame from a stack string (Chromium-style). */
  function firstAtFrameFromStack(stack: string): string {
    for (const raw of stack.split('\n')) {
      const line = raw.trim();
      const m = line.match(/^at\s+(.+)/);
      if (m?.[1]) return m[1];
    }
    return '';
  }

  /**
   * DevTools shows uncaught errors, but they often never go through `console.error`,
   * so the console patch alone misses them. This shape matches what we want in
   * createIssue `consoleLogs` when the embed forwards host console lines.
   */
  function formatUncaughtErrorLine(ev: ErrorEvent): string {
    const message =
      (ev.error && typeof ev.error.message === 'string' && ev.error.message) ||
      ev.message ||
      'Unknown error';
    let atPart = '';
    if (ev.error && typeof ev.error.stack === 'string') {
      const site = firstAtFrameFromStack(ev.error.stack);
      if (site) {
        const display = site.replace(/^window\./, 'Window.');
        atPart = ` at ${display}`;
      }
    }
    if (!atPart && ev.filename) {
      atPart = ` at ${ev.filename}:${ev.lineno}:${ev.colno}`;
    }
    return `uncaught error: ${message}${atPart}`;
  }

  function formatUnhandledRejectionLine(reason: unknown): string {
    if (reason instanceof Error) {
      const at =
        typeof reason.stack === 'string'
          ? firstAtFrameFromStack(reason.stack)
          : '';
      const atPart = at ? ` at ${at.replace(/^window\./, 'Window.')}` : '';
      return `unhandled rejection: ${reason.message}${atPart}`;
    }
    return `unhandled rejection: ${String(reason)}`;
  }

  function onWindowError(ev: ErrorEvent) {
    try {
      pushHostLogLine(formatUncaughtErrorLine(ev));
    } catch {
      /* ignore */
    }
  }

  function onUnhandledRejection(ev: PromiseRejectionEvent) {
    try {
      pushHostLogLine(formatUnhandledRejectionLine(ev.reason));
    } catch {
      /* ignore */
    }
  }

  window.addEventListener('error', onWindowError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);

  (['log', 'warn', 'error', 'info', 'debug'] as const).forEach((method) => {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      try {
        pushHostLogLine(formatConsoleCallLine(args));
      } catch {
        /* ignore */
      }
      return original(...args);
    };
  });

  let iframe: HTMLIFrameElement | null = null;
  let container: HTMLDivElement | null = null;
  let button: HTMLButtonElement | null = null;
  let cachedEmbedAppearance: EmbedWidgetAppearance = undefined;
  let isOpen = false;
  let agent: InstanceType<typeof PageAgent> | null = null;
  /** Current `page-agent-execute` / `execute()` correlation id (Convex pageControlRequests id). */
  let activePageControlRequestId: string | undefined;
  let suppressNextAgentDone = false;
  const widgetMessageTarget = new URL(EMBED_CONFIG.WIDGET_URL).origin;

  // Get configuration from script tag
  let organizationId: string | null = null;
  let position: 'bottom-right' | 'bottom-left' = EMBED_CONFIG.DEFAULT_POSITION;

  // Try to get the current script
  const currentScript = document.currentScript as HTMLScriptElement;
  if (currentScript) {
    organizationId = currentScript.getAttribute('data-organization-id');
    position = (currentScript.getAttribute('data-position') as 'bottom-right' | 'bottom-left') || EMBED_CONFIG.DEFAULT_POSITION;
  } else {
    // Fallback: find script tag by src
    const scripts = document.querySelectorAll('script[src*="embed"]');
    const embedScript = Array.from(scripts).find(script =>
      script.hasAttribute('data-organization-id')
    ) as HTMLScriptElement;

    if (embedScript) {
      organizationId = embedScript.getAttribute('data-organization-id');
      position = (embedScript.getAttribute('data-position') as 'bottom-right' | 'bottom-left') || EMBED_CONFIG.DEFAULT_POSITION;
    }
  }

  // Exit if no organization ID
  if (!organizationId) {
    console.error('Echo Widget: data-organization-id attribute is required');
    return;
  }

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', render);
    } else {
      render();
    }
  }

  function applyLauncherButtonStyles(
    btn: HTMLButtonElement,
    appearance: EmbedWidgetAppearance,
  ) {
    const t = resolveLauncherButtonColors(appearance);
    if (!t) return;
    btn.style.background = t.background;
    btn.style.color = t.color;
    btn.style.boxShadow = t.boxShadow;
    btn.style.border = '1px solid rgba(15, 23, 42, 0.12)';
  }

  function mountLauncherButton(appearance: EmbedWidgetAppearance) {
    if (button || !resolveLauncherButtonColors(appearance)) return;

    button = document.createElement('button');
    button.id = 'echo-widget-button';
    button.innerHTML = chatBubbleIcon;
    button.style.cssText = `
      position: fixed;
      ${position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
      bottom: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      z-index: ${WIDGET_Z_BUTTON};
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    `;
    applyLauncherButtonStyles(button, appearance);

    button.addEventListener('click', toggleWidget);
    button.addEventListener('mouseenter', () => {
      if (button) button.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseleave', () => {
      if (button) button.style.transform = 'scale(1)';
    });

    document.body.appendChild(button);
  }

  function setupEmbedShell() {
    if (container) return;

    container = document.createElement('div');
    container.id = 'echo-widget-container';
    container.style.cssText = `
      position: fixed;
      ${position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
      bottom: 90px;
      width: 400px;
      height: 600px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 110px);
      z-index: ${WIDGET_Z_PANEL};
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      display: none;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `;

    iframe = document.createElement('iframe');
    iframe.src = buildWidgetUrl();
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    `;
    iframe.allow = 'microphone; clipboard-read; clipboard-write';

    container.appendChild(iframe);
    document.body.appendChild(container);

    let flushHostContextTimer: ReturnType<typeof setTimeout> | null = null;
    function flushHostContextToWidget() {
      if (!iframe?.contentWindow) return;
      try {
        iframe.contentWindow.postMessage(
          {
            type: 'echo-host-context',
            payload: {
              hostPageUrl: window.location.href,
              hostConsoleLogs: hostConsoleLogs.slice(),
            },
          },
          new URL(EMBED_CONFIG.WIDGET_URL).origin,
        );
      } catch {
        /* ignore */
      }
    }
    function scheduleHostContextFlushInner() {
      if (flushHostContextTimer) return;
      flushHostContextTimer = setTimeout(() => {
        flushHostContextTimer = null;
        flushHostContextToWidget();
      }, 1500);
    }
    scheduleHostContextFlush = scheduleHostContextFlushInner;

    iframe.addEventListener('load', () => {
      flushHostContextToWidget();
    });

    window.addEventListener('message', handleMessage);
  }

  function render() {
    void fetchWidgetAppearanceForLauncher(
      EMBED_CONFIG.CONVEX_SITE_URL,
      organizationId!,
    ).then((raw) => {
      const appearance = raw ?? undefined;
      cachedEmbedAppearance = appearance;
      setupEmbedShell();
      mountLauncherButton(appearance);
    });
  }

  function buildWidgetUrl(): string {
    const params = new URLSearchParams();
    params.append('organizationId', organizationId!);
    return `${EMBED_CONFIG.WIDGET_URL}?${params.toString()}`;
  }

  const MAX_SCREENSHOT_BYTES = 10 * 1024 * 1024;

  function postScreenshotError(requestId: string, message: string) {
    iframe?.contentWindow?.postMessage(
      { type: 'echo-host-screenshot-error', payload: { requestId, message } },
      widgetMessageTarget,
    );
  }

  async function captureHostPageAndPostToWidget(requestId: string) {
    const win = iframe?.contentWindow;
    if (!win) {
      postScreenshotError(requestId, 'Widget is not ready.');
      return;
    }
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: Math.min(2, Math.max(1, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1)),
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png', 0.9),
      );
      if (!blob) {
        postScreenshotError(requestId, 'Could not create screenshot image.');
        return;
      }
      if (blob.size > MAX_SCREENSHOT_BYTES) {
        postScreenshotError(
          requestId,
          'Screenshot is larger than 10 MB. Try capturing a shorter page.',
        );
        return;
      }
      const buf = await blob.arrayBuffer();
      win.postMessage(
        {
          type: 'echo-host-screenshot-result',
          payload: { requestId, mimeType: blob.type || 'image/png', bytes: buf },
        },
        widgetMessageTarget,
        [buf],
      );
    } catch (e) {
      postScreenshotError(
        requestId,
        e instanceof Error ? e.message : 'Could not capture this page.',
      );
    }
  }

  function handleMessage(event: MessageEvent) {
    if (event.origin !== new URL(EMBED_CONFIG.WIDGET_URL).origin) return;

    const { type, payload } = event.data;

    switch (type) {
      case 'echo-request-host-screenshot': {
        const requestId = payload?.requestId as string | undefined;
        if (requestId) {
          void captureHostPageAndPostToWidget(requestId);
        }
        break;
      }
      case 'close':
        hide();
        break;
      case 'resize':
        if (payload.height && container) {
          container.style.height = `${payload.height}px`;
        }
        break;
      case 'page-agent-execute':
        if (payload?.action) {
          executePageAction(payload.action, payload.requestId);
        }
        break;
      case 'page-agent-stop': {
        const rid = payload?.requestId as string | undefined;
        if (!rid || rid !== activePageControlRequestId || !agent) break;
        suppressNextAgentDone = true;
        agent.stop();
        iframe?.contentWindow?.postMessage(
          {
            type: 'agent-done',
            payload: { requestId: rid, success: false, data: 'Stopped by user' },
          },
          widgetMessageTarget,
        );
        break;
      }
    }
  }

  async function executePageAction(action: string, requestId?: string) {
    if (!agent) {
      agent = new PageAgent({
        model: 'gpt-5.1',
        baseURL: `https://wandering-beagle-503.convex.site/embed/openai/v1`,
        apiKey: organizationId!,
        language: 'en-US',
        instructions: {
          system: `
          You are an AI agent that performs actions on behalf of the user.

Act immediately. Never ask questions. Never request clarification.
If information is missing, make a reasonable assumption and proceed.

Be concise and outcome-focused.

Rules:
- Do NOT ask questions
- Do NOT explain reasoning
- Do NOT verify or restate obvious results
- Do NOT repeat steps
- Avoid phrases like "confirm", "verify", "task completed"
- Only describe meaningful actions
- Each step max 5 words
- If the task is simple, skip steps entirely

After completing the task, return a short, natural result message.

Good examples:
- Click + button twice
- Fill email field
- Submit form

Final message examples:
- Done. Counter is now 2
- Added 2 to the counter
          `
        },
        onAfterStep: (_agentInstance, history) => {
          const rid = activePageControlRequestId;
          if (!rid) return;
          const last = history[history.length - 1];
          if (last?.type === 'step') {
            iframe?.contentWindow?.postMessage(
              {
                type: 'agent-step',
                payload: {
                  requestId: rid,
                  stepIndex: last.stepIndex,
                  goal: last.reflection?.next_goal ?? '',
                  actionName: last.action?.name ?? '',
                },
              },
              widgetMessageTarget,
            );
          }
        },
        onAfterTask: (_agentInstance, result) => {
          if (suppressNextAgentDone) {
            suppressNextAgentDone = false;
            return;
          }
          const rid = activePageControlRequestId;
          if (!rid) return;
          iframe?.contentWindow?.postMessage(
            {
              type: 'agent-done',
              payload: { requestId: rid, success: result.success, data: result.data },
            },
            widgetMessageTarget,
          );
        },
      });
      agent.panel.hide();
      agent.panel.show = () => {}; // prevent execute() from re-showing the panel
    }
    activePageControlRequestId = requestId;
    try {
      await agent.execute(action);
    } finally {
      activePageControlRequestId = undefined;
      suppressNextAgentDone = false;
    }
  }

  function toggleWidget() {
    if (!button) return;
    if (isOpen) {
      hide();
    } else {
      show();
    }
  }

  function show() {
    if (!container) return;
    isOpen = true;
    container.style.display = 'block';
    setTimeout(() => {
      if (container) {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
      }
    }, 10);
    if (button) {
      button.innerHTML = closeIcon;
    }
  }

  function hide() {
    if (!container) return;
    isOpen = false;
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (container) container.style.display = 'none';
    }, 300);
    if (button) {
      button.innerHTML = chatBubbleIcon;
      applyLauncherButtonStyles(button, cachedEmbedAppearance);
    }
  }

  function destroy() {
    window.removeEventListener('error', onWindowError);
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
    window.removeEventListener('message', handleMessage);
    if (container) {
      container.remove();
      container = null;
      iframe = null;
    }
    if (button) {
      button.remove();
      button = null;
    }
    if (agent) {
      agent.panel.dispose();
      agent = null;
    }
    isOpen = false;
  }

  // Function to reinitialize with new config
  function reinit(newConfig: { organizationId?: string; position?: 'bottom-right' | 'bottom-left' }) {
    destroy();

    if (newConfig.organizationId) {
      organizationId = newConfig.organizationId;
    }
    if (newConfig.position) {
      position = newConfig.position;
    }

    init();
  }

  // Expose API to global scope
  (window as any).EchoWidget = {
    init: reinit,
    show,
    hide,
    destroy
  };

  // Auto-initialize
  init();
})();
