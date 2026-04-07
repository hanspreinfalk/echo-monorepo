import { EMBED_CONFIG } from './config';
import { chatBubbleIcon, closeIcon } from './icons';
import { PageAgent } from 'page-agent';

// cd apps/embed && VITE_WIDGET_URL=https://echo-monorepo-widget.vercel.app pnpm build

/** Above page-agent SimulatorMask (z-index 2147483641) so the chat iframe and Stop stay clickable. */
const WIDGET_Z_PANEL = 2147483646;
const WIDGET_Z_BUTTON = 2147483647;

(function() {
  let iframe: HTMLIFrameElement | null = null;
  let container: HTMLDivElement | null = null;
  let button: HTMLButtonElement | null = null;
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

  function render() {
    // Create floating action button
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
      background: #3b82f6;
      color: white;
      border: none;
      cursor: pointer;
      z-index: ${WIDGET_Z_BUTTON};
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(59, 130, 246, 0.35);
      transition: all 0.2s ease;
    `;

    button.addEventListener('click', toggleWidget);
    button.addEventListener('mouseenter', () => {
      if (button) button.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseleave', () => {
      if (button) button.style.transform = 'scale(1)';
    });

    document.body.appendChild(button);

    // Create container (hidden by default)
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

    // Create iframe
    iframe = document.createElement('iframe');
    iframe.src = buildWidgetUrl();
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;
    // Add permissions for microphone and clipboard
    iframe.allow = 'microphone; clipboard-read; clipboard-write';

    container.appendChild(iframe);
    document.body.appendChild(container);

    // Handle messages from widget
    window.addEventListener('message', handleMessage);
  }

  function buildWidgetUrl(): string {
    const params = new URLSearchParams();
    params.append('organizationId', organizationId!);
    return `${EMBED_CONFIG.WIDGET_URL}?${params.toString()}`;
  }

  function handleMessage(event: MessageEvent) {
    if (event.origin !== new URL(EMBED_CONFIG.WIDGET_URL).origin) return;

    const { type, payload } = event.data;

    switch (type) {
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
    if (isOpen) {
      hide();
    } else {
      show();
    }
  }

  function show() {
    if (container && button) {
      isOpen = true;
      container.style.display = 'block';
      // Trigger animation
      setTimeout(() => {
        if (container) {
          container.style.opacity = '1';
          container.style.transform = 'translateY(0)';
        }
      }, 10);
      // Change button icon to close
      button.innerHTML = closeIcon;
    }
  }

  function hide() {
    if (container && button) {
      isOpen = false;
      container.style.opacity = '0';
      container.style.transform = 'translateY(10px)';
      // Hide after animation
      setTimeout(() => {
        if (container) container.style.display = 'none';
      }, 300);
      // Change button icon back to chat
      button.innerHTML = chatBubbleIcon;
      button.style.background = '#3b82f6';
    }
  }

  function destroy() {
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
